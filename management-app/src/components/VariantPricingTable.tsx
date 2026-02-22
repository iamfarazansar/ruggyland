"use client";

import { useState, useRef, useEffect } from "react";

interface Price {
  id?: string;
  currency_code: string;
  amount: number;
  region_id?: string;
  region_name?: string;
  context_key?: string;
}

interface Variant {
  id: string;
  title: string;
  sku?: string;
  prices: Price[];
}

interface PriceContext {
  key: string;
  currency_code: string;
  region_id?: string;
  region_name?: string;
}

interface VariantPricingTableProps {
  variants: Variant[];
  priceContexts: PriceContext[];
  onSave: (variantId: string, prices: Array<{ id: string; amount: number }>) => Promise<void>;
}

interface CellPosition {
  variantId: string;
  contextKey: string;
}

export default function VariantPricingTable({
  variants,
  priceContexts,
  onSave,
}: VariantPricingTableProps) {
  const [editedPrices, setEditedPrices] = useState<
    Record<string, Record<string, number>>
  >({});
  const [savingVariant, setSavingVariant] = useState<string | null>(null);

  // Column widths state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const widths: Record<string, number> = { title: 200 };
    priceContexts.forEach((ctx) => {
      widths[ctx.key] = 150;
    });
    return widths;
  });

  // Column resizing state
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  // Cell selection state
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<CellPosition | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<CellPosition | null>(null);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());

  // Get price for a variant in a specific price context
  const getPrice = (variant: Variant, contextKey: string): Price | undefined => {
    return variant.prices?.find((p) => p.context_key === contextKey);
  };

  // Get edited or original price amount
  const getPriceAmount = (variant: Variant, contextKey: string, priceId?: string): number | undefined => {
    const editKey = priceId || contextKey;
    if (editedPrices[variant.id]?.[editKey] !== undefined) {
      return editedPrices[variant.id][editKey];
    }
    const price = getPrice(variant, contextKey);
    return price?.amount;
  };

  // Update price in local state
  const handlePriceChange = (
    variantId: string,
    contextKey: string,
    priceId: string | undefined,
    value: string
  ) => {
    const numValue = value === "" ? 0 : parseFloat(value);
    if (isNaN(numValue)) return;

    const editKey = priceId || contextKey;
    setEditedPrices((prev) => ({
      ...prev,
      [variantId]: {
        ...prev[variantId],
        [editKey]: numValue,
      },
    }));
  };

  // Check if variant has unsaved changes
  const hasChanges = (variantId: string): boolean => {
    return !!editedPrices[variantId] && Object.keys(editedPrices[variantId]).length > 0;
  };

  // Save prices for a variant
  const handleSave = async (variant: Variant) => {
    if (!hasChanges(variant.id)) return;

    setSavingVariant(variant.id);

    try {
      const priceUpdates: Array<{ id: string; amount: number }> = [];

      priceContexts.forEach((context) => {
        const price = getPrice(variant, context.key);
        if (!price?.id) return;

        const editKey = price.id;
        const editedAmount = editedPrices[variant.id]?.[editKey];

        if (editedAmount !== undefined) {
          priceUpdates.push({
            id: price.id,
            amount: editedAmount,
          });
        }
      });

      if (priceUpdates.length > 0) {
        await onSave(variant.id, priceUpdates);
      }

      setEditedPrices((prev) => {
        const newState = { ...prev };
        delete newState[variant.id];
        return newState;
      });
    } catch (error) {
      console.error("Failed to save prices:", error);
    } finally {
      setSavingVariant(null);
    }
  };

  // Handle column resize start
  const handleResizeStart = (e: React.MouseEvent, columnKey: string) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingColumn(columnKey);
    setStartX(e.clientX);
    setStartWidth(columnWidths[columnKey] || 150);
  };

  // Handle cell selection start
  const handleCellMouseDown = (variantId: string, contextKey: string, hasPrice: boolean) => {
    if (resizingColumn || !hasPrice) return;

    setIsSelecting(true);
    setSelectionStart({ variantId, contextKey });
    setSelectionEnd({ variantId, contextKey });
    setSelectedCells(new Set([`${variantId}|${contextKey}`]));
  };

  // Handle cell selection move
  const handleCellMouseEnter = (variantId: string, contextKey: string, hasPrice: boolean) => {
    if (!isSelecting || !selectionStart || !hasPrice) return;

    setSelectionEnd({ variantId, contextKey });

    // Calculate selected cells range
    const startVariantIdx = variants.findIndex(v => v.id === selectionStart.variantId);
    const endVariantIdx = variants.findIndex(v => v.id === variantId);
    const startContextIdx = priceContexts.findIndex(c => c.key === selectionStart.contextKey);
    const endContextIdx = priceContexts.findIndex(c => c.key === contextKey);

    const minVariantIdx = Math.min(startVariantIdx, endVariantIdx);
    const maxVariantIdx = Math.max(startVariantIdx, endVariantIdx);
    const minContextIdx = Math.min(startContextIdx, endContextIdx);
    const maxContextIdx = Math.max(startContextIdx, endContextIdx);

    const newSelectedCells = new Set<string>();
    for (let vIdx = minVariantIdx; vIdx <= maxVariantIdx; vIdx++) {
      for (let cIdx = minContextIdx; cIdx <= maxContextIdx; cIdx++) {
        const v = variants[vIdx];
        const c = priceContexts[cIdx];
        const price = getPrice(v, c.key);
        if (price?.id) {
          newSelectedCells.add(`${v.id}|${c.key}`);
        }
      }
    }
    setSelectedCells(newSelectedCells);
  };

  // Handle selection end
  const handleMouseUp = () => {
    setIsSelecting(false);
  };

  // Check if cell is selected
  const isCellSelected = (variantId: string, contextKey: string): boolean => {
    return selectedCells.has(`${variantId}|${contextKey}`);
  };

  // Handle column resize
  useEffect(() => {
    if (!resizingColumn) return;

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startX;
      const newWidth = Math.max(80, startWidth + diff);
      setColumnWidths((prev) => ({
        ...prev,
        [resizingColumn]: newWidth,
      }));
    };

    const handleMouseUp = () => {
      setResizingColumn(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizingColumn, startX, startWidth]);

  // Handle global mouse up for selection
  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  if (variants.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No variants found
      </div>
    );
  }

  return (
    <div
      className="overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg select-none"
      style={{ userSelect: isSelecting ? 'none' : 'auto' }}
    >
      <table className="min-w-full border-collapse">
        <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-20">
          <tr>
            {/* Title Column */}
            <th
              className="relative border-r border-b border-gray-200 dark:border-gray-700 px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-800"
              style={{ width: columnWidths.title, minWidth: columnWidths.title, maxWidth: columnWidths.title }}
            >
              <div className="flex items-center justify-between">
                <span>Title</span>
                <div
                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 hover:w-1.5 z-30"
                  onMouseDown={(e) => handleResizeStart(e, "title")}
                />
              </div>
            </th>

            {/* Price Context Columns */}
            {priceContexts.map((context) => (
              <th
                key={context.key}
                className="relative border-r border-b border-gray-200 dark:border-gray-700 px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-800 whitespace-nowrap"
                style={{ width: columnWidths[context.key], minWidth: columnWidths[context.key], maxWidth: columnWidths[context.key] }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    {context.region_name ? (
                      <>
                        <div>Price {context.currency_code.toUpperCase()}</div>
                        <div className="text-xs font-normal text-gray-500 dark:text-gray-400 mt-0.5">
                          ({context.region_name})
                        </div>
                      </>
                    ) : (
                      `Price ${context.currency_code.toUpperCase()}`
                    )}
                  </div>
                  <div
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 hover:w-1.5 z-30"
                    onMouseDown={(e) => handleResizeStart(e, context.key)}
                  />
                </div>
              </th>
            ))}

            {/* Actions Column */}
            <th className="sticky right-0 border-b border-gray-200 dark:border-gray-700 px-3 py-2 bg-gray-50 dark:bg-gray-800 w-24"></th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {variants.map((variant, idx) => (
            <tr
              key={variant.id}
              className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                idx % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/50 dark:bg-gray-800/30"
              }`}
            >
              {/* Title Cell */}
              <td
                className="border-r border-gray-200 dark:border-gray-700 px-3 py-2 bg-inherit"
                style={{ width: columnWidths.title, minWidth: columnWidths.title, maxWidth: columnWidths.title }}
              >
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {variant.title}
                </div>
                {variant.sku && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    SKU: {variant.sku}
                  </div>
                )}
              </td>

              {/* Price Cells */}
              {priceContexts.map((context) => {
                const price = getPrice(variant, context.key);
                const amount = getPriceAmount(variant, context.key, price?.id);
                const isEdited = price?.id && editedPrices[variant.id]?.[price.id] !== undefined;
                const isSelected = isCellSelected(variant.id, context.key);

                return (
                  <td
                    key={context.key}
                    className={`border-r border-gray-200 dark:border-gray-700 px-1.5 py-1 overflow-hidden ${
                      isEdited && !isSelected
                        ? "bg-yellow-50 dark:bg-yellow-900/20"
                        : "bg-inherit"
                    }`}
                    style={{ width: columnWidths[context.key], minWidth: columnWidths[context.key], maxWidth: columnWidths[context.key] }}
                    onMouseDown={() => handleCellMouseDown(variant.id, context.key, !!price?.id)}
                    onMouseEnter={() => handleCellMouseEnter(variant.id, context.key, !!price?.id)}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500 dark:text-gray-400 text-xs flex-shrink-0">
                        {getCurrencySymbol(context.currency_code)}
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={amount !== undefined ? amount.toFixed(2) : ""}
                        onChange={(e) =>
                          handlePriceChange(variant.id, context.key, price?.id, e.target.value)
                        }
                        disabled={!price?.id}
                        className={`w-full min-w-0 px-1.5 py-1 text-sm rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed transition-all ${
                          !price?.id
                            ? "border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700"
                            : isSelected
                            ? "border-2 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 shadow-sm"
                            : isEdited
                            ? "border border-yellow-400 dark:border-yellow-600 bg-white dark:bg-gray-800"
                            : "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                        }`}
                        placeholder={!price?.id ? "N/A" : "0.00"}
                      />
                    </div>
                  </td>
                );
              })}

              {/* Actions Cell */}
              <td className="sticky right-0 px-3 py-2 bg-inherit border-l border-gray-200 dark:border-gray-700">
                {hasChanges(variant.id) && (
                  <button
                    onClick={() => handleSave(variant)}
                    disabled={savingVariant === variant.id}
                    className="w-full px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingVariant === variant.id ? "Saving..." : "Save"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    usd: "$",
    eur: "€",
    gbp: "£",
    inr: "₹",
    cad: "$",
    aud: "$",
  };
  return symbols[currency.toLowerCase()] || currency.toUpperCase();
}
