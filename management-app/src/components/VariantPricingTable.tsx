"use client";

import { useState, useRef, useEffect, useCallback } from "react";

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
  onSave: (
    variantId: string,
    prices: Array<{
      id?: string;
      currency_code: string;
      region_id?: string;
      amount: number;
    }>,
  ) => Promise<void>;
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
  // Raw string values for inputs so typing isn't interrupted by formatting
  const [inputValues, setInputValues] = useState<
    Record<string, Record<string, string>>
  >({});
  const [savingVariant, setSavingVariant] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Which cell is currently in edit mode (double-clicked or typed into)
  const [editingCell, setEditingCell] = useState<string | null>(null); // "variantId|contextKey"

  // Column widths state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
    () => {
      const widths: Record<string, number> = { title: 200 };
      priceContexts.forEach((ctx) => {
        widths[ctx.key] = 150;
      });
      return widths;
    },
  );

  // Column resizing state
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  // Cell selection state
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<CellPosition | null>(
    null,
  );
  const [selectionEnd, setSelectionEnd] = useState<CellPosition | null>(null);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());

  // Get price for a variant in a specific price context
  const getPrice = (
    variant: Variant,
    contextKey: string,
  ): Price | undefined => {
    return variant.prices?.find((p) => p.context_key === contextKey);
  };

  // Get the display value for an input field
  const getInputDisplayValue = (
    variant: Variant,
    contextKey: string,
    priceId?: string,
  ): string => {
    const editKey = priceId || contextKey;
    // If user is actively editing, show raw input
    const rawInput = inputValues[variant.id]?.[editKey];
    if (rawInput !== undefined) return rawInput;
    // Otherwise show the edited or original price
    if (editedPrices[variant.id]?.[editKey] !== undefined) {
      return editedPrices[variant.id][editKey].toString();
    }
    const price = getPrice(variant, contextKey);
    return price?.amount !== undefined ? price.amount.toString() : "";
  };

  // Get edited or original price amount (for copy/paste/save logic)
  const getPriceAmount = (
    variant: Variant,
    contextKey: string,
    priceId?: string,
  ): number | undefined => {
    const editKey = priceId || contextKey;
    if (editedPrices[variant.id]?.[editKey] !== undefined) {
      return editedPrices[variant.id][editKey];
    }
    const price = getPrice(variant, contextKey);
    return price?.amount;
  };

  // Handle typing in the input - store raw string
  const handlePriceChange = (
    variantId: string,
    contextKey: string,
    priceId: string | undefined,
    value: string,
  ) => {
    const editKey = priceId || contextKey;
    setInputValues((prev) => ({
      ...prev,
      [variantId]: {
        ...prev[variantId],
        [editKey]: value,
      },
    }));
  };

  // On blur, parse the raw input into a number and store in editedPrices
  const handleBlur = (
    variantId: string,
    contextKey: string,
    priceId: string | undefined,
  ) => {
    const editKey = priceId || contextKey;
    const rawValue = inputValues[variantId]?.[editKey];
    if (rawValue === undefined) return;

    // Clear raw input
    setInputValues((prev) => {
      const newState = { ...prev };
      if (newState[variantId]) {
        delete newState[variantId][editKey];
        if (Object.keys(newState[variantId]).length === 0) {
          delete newState[variantId];
        }
      }
      return newState;
    });

    // If empty, remove the edit
    if (rawValue === "") {
      setEditedPrices((prev) => {
        const newState = { ...prev };
        if (newState[variantId]) {
          delete newState[variantId][editKey];
          if (Object.keys(newState[variantId]).length === 0) {
            delete newState[variantId];
          }
        }
        return newState;
      });
      return;
    }

    const numValue = parseFloat(rawValue);
    if (isNaN(numValue)) return;

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
    return (
      !!editedPrices[variantId] &&
      Object.keys(editedPrices[variantId]).length > 0
    );
  };

  // Save prices for a variant
  const handleSave = async (variant: Variant) => {
    if (!hasChanges(variant.id)) return;

    setSavingVariant(variant.id);

    try {
      const priceUpdates: Array<{
        id?: string;
        currency_code: string;
        region_id?: string;
        amount: number;
      }> = [];

      priceContexts.forEach((context) => {
        const price = getPrice(variant, context.key);
        const editKey = price?.id || context.key;
        const editedAmount = editedPrices[variant.id]?.[editKey];

        if (editedAmount !== undefined) {
          priceUpdates.push({
            id: price?.id, // undefined for new prices
            currency_code: context.currency_code,
            region_id: context.region_id,
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

  // Handle cell selection start (single click = select, not edit)
  const handleCellMouseDown = (variantId: string, contextKey: string) => {
    if (resizingColumn) return;

    // Exit any current editing
    setEditingCell(null);

    setIsSelecting(true);
    setSelectionStart({ variantId, contextKey });
    setSelectionEnd({ variantId, contextKey });
    setSelectedCells(new Set([`${variantId}|${contextKey}`]));
  };

  // Handle double-click to enter edit mode
  const handleCellDoubleClick = (variantId: string, contextKey: string) => {
    const cellKey = `${variantId}|${contextKey}`;
    setEditingCell(cellKey);
    setSelectedCells(new Set([cellKey]));
  };

  // Handle cell selection move
  const handleCellMouseEnter = (variantId: string, contextKey: string) => {
    if (!isSelecting || !selectionStart) return;

    setSelectionEnd({ variantId, contextKey });

    // Calculate selected cells range
    const startVariantIdx = variants.findIndex(
      (v) => v.id === selectionStart.variantId,
    );
    const endVariantIdx = variants.findIndex((v) => v.id === variantId);
    const startContextIdx = priceContexts.findIndex(
      (c) => c.key === selectionStart.contextKey,
    );
    const endContextIdx = priceContexts.findIndex((c) => c.key === contextKey);

    const minVariantIdx = Math.min(startVariantIdx, endVariantIdx);
    const maxVariantIdx = Math.max(startVariantIdx, endVariantIdx);
    const minContextIdx = Math.min(startContextIdx, endContextIdx);
    const maxContextIdx = Math.max(startContextIdx, endContextIdx);

    const newSelectedCells = new Set<string>();
    for (let vIdx = minVariantIdx; vIdx <= maxVariantIdx; vIdx++) {
      for (let cIdx = minContextIdx; cIdx <= maxContextIdx; cIdx++) {
        const v = variants[vIdx];
        const c = priceContexts[cIdx];
        newSelectedCells.add(`${v.id}|${c.key}`);
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

  // Handle copy/paste for selected cells
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedCells.size === 0) return;

      const isMeta = e.metaKey || e.ctrlKey;

      // Paste: Cmd+V / Ctrl+V
      if (isMeta && e.key === "v") {
        // Don't intercept if actively editing a cell
        if (editingCell) return;
        e.preventDefault();
        navigator.clipboard.readText().then((text) => {
          const trimmed = text.trim();
          if (!trimmed) return;

          // Parse pasted text - could be a single value or tab/newline grid
          const rows = trimmed.split(/\r?\n/).map((row) => row.split("\t"));

          // Get selected cells as a sorted grid
          const selectedArr = Array.from(selectedCells);
          const selectedVariantIds = [
            ...new Set(selectedArr.map((c) => c.split("|")[0])),
          ];
          const selectedContextKeys = [
            ...new Set(selectedArr.map((c) => c.split("|").slice(1).join("|"))),
          ];

          // Sort by variant order and context order
          selectedVariantIds.sort((a, b) => {
            const ai = variants.findIndex((v) => v.id === a);
            const bi = variants.findIndex((v) => v.id === b);
            return ai - bi;
          });
          selectedContextKeys.sort((a, b) => {
            const ai = priceContexts.findIndex((c) => c.key === a);
            const bi = priceContexts.findIndex((c) => c.key === b);
            return ai - bi;
          });

          setEditedPrices((prev) => {
            const newState = { ...prev };

            selectedVariantIds.forEach((variantId, rowIdx) => {
              const variant = variants.find((v) => v.id === variantId);
              if (!variant) return;

              selectedContextKeys.forEach((contextKey, colIdx) => {
                // Get the value from the paste grid, or use the single value
                let pasteValue: string;
                if (rows.length === 1 && rows[0].length === 1) {
                  // Single value - apply to all selected cells
                  pasteValue = rows[0][0];
                } else {
                  // Grid paste - map row/col
                  const row = rows[rowIdx % rows.length];
                  pasteValue = row ? row[colIdx % row.length] : "";
                }

                const numValue = parseFloat(pasteValue);
                if (isNaN(numValue)) return;

                const price = getPrice(variant, contextKey);
                const editKey = price?.id || contextKey;

                if (!newState[variantId]) newState[variantId] = {};
                newState[variantId][editKey] = numValue;
              });
            });

            return newState;
          });
        });
      }

      // Copy: Cmd+C / Ctrl+C
      if (isMeta && e.key === "c") {
        // Don't intercept if actively editing
        if (editingCell) return;

        e.preventDefault();

        const selectedArr = Array.from(selectedCells);
        const selectedVariantIds = [
          ...new Set(selectedArr.map((c) => c.split("|")[0])),
        ];
        const selectedContextKeys = [
          ...new Set(selectedArr.map((c) => c.split("|").slice(1).join("|"))),
        ];

        selectedVariantIds.sort((a, b) => {
          const ai = variants.findIndex((v) => v.id === a);
          const bi = variants.findIndex((v) => v.id === b);
          return ai - bi;
        });
        selectedContextKeys.sort((a, b) => {
          const ai = priceContexts.findIndex((c) => c.key === a);
          const bi = priceContexts.findIndex((c) => c.key === b);
          return ai - bi;
        });

        const rows: string[] = [];
        selectedVariantIds.forEach((variantId) => {
          const variant = variants.find((v) => v.id === variantId);
          if (!variant) return;

          const cols: string[] = [];
          selectedContextKeys.forEach((contextKey) => {
            const price = getPrice(variant, contextKey);
            const amount = getPriceAmount(variant, contextKey, price?.id);
            cols.push(amount !== undefined ? amount.toFixed(2) : "");
          });
          rows.push(cols.join("\t"));
        });

        navigator.clipboard.writeText(rows.join("\n"));
      }
    };

    // Handle typing to enter edit mode on selected cell
    const handleTyping = (e: KeyboardEvent) => {
      if (editingCell) return;
      if (selectedCells.size !== 1) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // Only handle number keys, backspace, delete, period
      const isNumber = e.key >= "0" && e.key <= "9";
      const isPeriod = e.key === ".";
      const isDelete = e.key === "Backspace" || e.key === "Delete";

      if (isNumber || isPeriod || isDelete) {
        e.preventDefault();
        const cellKey = Array.from(selectedCells)[0];
        setEditingCell(cellKey);

        const [variantId, ...contextParts] = cellKey.split("|");
        const contextKey = contextParts.join("|");
        const variant = variants.find((v) => v.id === variantId);
        if (!variant) return;
        const price = getPrice(variant, contextKey);
        const editKey = price?.id || contextKey;

        // Start with the typed character (or empty for delete)
        const startValue = isDelete ? "" : e.key;
        setInputValues((prev) => ({
          ...prev,
          [variantId]: {
            ...prev[variantId],
            [editKey]: startValue,
          },
        }));
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keydown", handleTyping);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keydown", handleTyping);
    };
  }, [selectedCells, variants, priceContexts, editedPrices, editingCell]);

  // Handle Escape key to exit fullscreen
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    // Prevent body scroll in fullscreen
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  if (variants.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No variants found
      </div>
    );
  }

  const tableContent = (
    <div
      className={`overflow-auto border border-gray-200 dark:border-gray-700 select-none ${
        isFullscreen ? "flex-1 rounded-none border-t-0" : "rounded-lg"
      }`}
      style={{ userSelect: isSelecting ? "none" : "auto" }}
    >
      <table className="min-w-full border-collapse">
        <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-20">
          <tr>
            {/* Title Column */}
            <th
              className="relative border-r border-b border-gray-200 dark:border-gray-700 px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-800"
              style={{
                width: columnWidths.title,
                minWidth: columnWidths.title,
                maxWidth: columnWidths.title,
              }}
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
                style={{
                  width: columnWidths[context.key],
                  minWidth: columnWidths[context.key],
                  maxWidth: columnWidths[context.key],
                }}
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
                idx % 2 === 0
                  ? "bg-white dark:bg-gray-900"
                  : "bg-gray-50/50 dark:bg-gray-800/30"
              }`}
            >
              {/* Title Cell */}
              <td
                className="border-r border-gray-200 dark:border-gray-700 px-3 py-2 bg-inherit"
                style={{
                  width: columnWidths.title,
                  minWidth: columnWidths.title,
                  maxWidth: columnWidths.title,
                }}
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
                const editKey = price?.id || context.key;
                const amount = getPriceAmount(variant, context.key, price?.id);
                const isEdited =
                  editedPrices[variant.id]?.[editKey] !== undefined;
                const isSelected = isCellSelected(variant.id, context.key);
                const cellKey = `${variant.id}|${context.key}`;
                const isEditing = editingCell === cellKey;

                return (
                  <td
                    key={context.key}
                    className={`border-r border-gray-200 dark:border-gray-700 px-1.5 py-1 overflow-hidden cursor-default ${
                      isEdited && !isSelected
                        ? "bg-yellow-50 dark:bg-yellow-900/20"
                        : "bg-inherit"
                    }`}
                    style={{
                      width: columnWidths[context.key],
                      minWidth: columnWidths[context.key],
                      maxWidth: columnWidths[context.key],
                    }}
                    onMouseDown={(e) => {
                      // If already editing this cell, don't reset
                      if (isEditing) {
                        e.stopPropagation();
                        return;
                      }
                      handleCellMouseDown(variant.id, context.key);
                    }}
                    onMouseEnter={() =>
                      handleCellMouseEnter(variant.id, context.key)
                    }
                    onDoubleClick={() =>
                      handleCellDoubleClick(variant.id, context.key)
                    }
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500 dark:text-gray-400 text-xs flex-shrink-0">
                        {getCurrencySymbol(context.currency_code)}
                      </span>
                      {isEditing ? (
                        /* Edit mode - active input */
                        <input
                          type="number"
                          step="0.01"
                          autoFocus
                          value={getInputDisplayValue(
                            variant,
                            context.key,
                            price?.id,
                          )}
                          onChange={(e) =>
                            handlePriceChange(
                              variant.id,
                              context.key,
                              price?.id,
                              e.target.value,
                            )
                          }
                          onBlur={() => {
                            handleBlur(variant.id, context.key, price?.id);
                            setEditingCell(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === "Escape") {
                              e.preventDefault();
                              handleBlur(variant.id, context.key, price?.id);
                              setEditingCell(null);
                            }
                            if (e.key === "Tab") {
                              handleBlur(variant.id, context.key, price?.id);
                              setEditingCell(null);
                            }
                          }}
                          className="w-full min-w-0 px-1.5 py-1 text-sm rounded text-gray-900 dark:text-white border-2 border-blue-500 dark:border-blue-400 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="0.00"
                        />
                      ) : (
                        /* Display mode - shows value, click to select */
                        <div
                          className={`w-full min-w-0 px-1.5 py-1 text-sm rounded cursor-default select-none ${
                            isSelected
                              ? "border-2 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 shadow-sm text-gray-900 dark:text-white"
                              : isEdited
                                ? "border border-yellow-400 dark:border-yellow-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                : "border border-transparent text-gray-900 dark:text-white"
                          }`}
                        >
                          {amount !== undefined ? (
                            amount.toString()
                          ) : (
                            <span className="text-gray-400">0.00</span>
                          )}
                        </div>
                      )}
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

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900">
        {/* Fullscreen Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Variants & Pricing
          </h2>
          <button
            onClick={() => setIsFullscreen(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Close
          </button>
        </div>
        {tableContent}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setIsFullscreen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title="Open in fullscreen"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
            />
          </svg>
          Fullscreen
        </button>
      </div>
      {tableContent}
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
