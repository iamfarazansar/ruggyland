"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ProductFormData, ProductOption, ProductVariant } from "@/lib/types";

interface UploadedImage {
  id: string;
  url: string;
  file?: File;
  uploading?: boolean;
}

interface SalesChannel {
  id: string;
  name: string;
}

// Tab enum
enum Tab {
  DETAILS = "details",
  ORGANIZE = "organize",
  VARIANTS = "variants",
}

type TabStatus = "not-started" | "in-progress" | "completed";
type TabState = Record<Tab, TabStatus>;

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

export default function CreateProductPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData | null>(null);

  // Tab state
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.DETAILS);
  const [tabState, setTabState] = useState<TabState>({
    [Tab.DETAILS]: "in-progress",
    [Tab.ORGANIZE]: "not-started",
    [Tab.VARIANTS]: "not-started",
  });

  // Details tab state
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [handle, setHandle] = useState("");
  const [handleManuallyEdited, setHandleManuallyEdited] = useState(false);
  const [checkingHandle, setCheckingHandle] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [enableVariants, setEnableVariants] = useState(false);

  // Organize tab state
  const [discountable, setDiscountable] = useState(true);
  const [typeId, setTypeId] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string>("");
  const [shippingProfileId, setShippingProfileId] = useState("");
  const [availableShippingProfiles, setAvailableShippingProfiles] = useState<
    { id: string; name: string }[]
  >([]);
  const [salesChannels, setSalesChannels] = useState<SalesChannel[]>([]);
  const [availableSalesChannels, setAvailableSalesChannels] = useState<
    SalesChannel[]
  >([]);
  const [showSalesChannelDropdown, setShowSalesChannelDropdown] =
    useState(false);
  const salesChannelDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        salesChannelDropdownRef.current &&
        !salesChannelDropdownRef.current.contains(event.target as Node)
      ) {
        setShowSalesChannelDropdown(false);
      }
    };

    if (showSalesChannelDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSalesChannelDropdown]);

  // Variants tab state
  const [options, setOptions] = useState<ProductOption[]>([
    { title: "Default option", values: ["Default option value"] },
  ]);
  const [optionValuesText, setOptionValuesText] = useState<string[]>([
    "Default option value",
  ]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [storeCurrencies, setStoreCurrencies] = useState<string[]>([]);
  const [regions, setRegions] = useState<
    { id: string; name: string; currency_code: string }[]
  >([]);

  // Load form data from standard Medusa admin APIs
  useEffect(() => {
    if (isAuthenticated && token) {
      loadFormData();
    }
  }, [isAuthenticated, token]);

  const loadFormData = async () => {
    if (!token) return;

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    try {
      // Fetch all data in parallel using standard Medusa admin APIs
      const [
        categoriesRes,
        collectionsRes,
        typesRes,
        salesChannelsRes,
        storeRes,
        regionsRes,
        shippingProfilesRes,
      ] = await Promise.all([
        fetch(`${BACKEND_URL}/admin/product-categories?limit=100`, {
          headers,
        }).catch(() => null),
        fetch(`${BACKEND_URL}/admin/collections?limit=100`, {
          headers,
        }).catch(() => null),
        fetch(`${BACKEND_URL}/admin/product-types?limit=100`, {
          headers,
        }).catch(() => null),
        fetch(`${BACKEND_URL}/admin/sales-channels?limit=100`, {
          headers,
        }).catch(() => null),
        fetch(`${BACKEND_URL}/admin/stores`, {
          headers,
        }).catch(() => null),
        fetch(`${BACKEND_URL}/admin/regions?limit=100`, {
          headers,
        }).catch(() => null),
        fetch(`${BACKEND_URL}/admin/shipping-profiles?limit=100`, {
          headers,
        }).catch(() => null),
      ]);

      const data: ProductFormData = {
        categories: [],
        collections: [],
        shipping_profiles: [],
      };

      // Parse categories
      if (categoriesRes?.ok) {
        const categoriesData = await categoriesRes.json();
        data.categories = (categoriesData.product_categories || []).map(
          (c: any) => ({
            id: c.id,
            name: c.name,
          }),
        );
      }

      // Parse collections
      if (collectionsRes?.ok) {
        const collectionsData = await collectionsRes.json();
        data.collections = (collectionsData.collections || []).map(
          (c: any) => ({
            id: c.id,
            title: c.title,
          }),
        );
      }

      // Parse product types
      if (typesRes?.ok) {
        const typesData = await typesRes.json();
        data.product_types = (typesData.product_types || []).map((t: any) => ({
          id: t.id,
          value: t.value,
        }));
      }

      // Parse sales channels and set default
      if (salesChannelsRes?.ok) {
        const salesChannelsData = await salesChannelsRes.json();
        const channels = (salesChannelsData.sales_channels || []).map(
          (c: any) => ({
            id: c.id,
            name: c.name,
          }),
        );
        setAvailableSalesChannels(channels);
        if (channels.length > 0) {
          setSalesChannels([channels[0]]);
        }
      }

      // Parse store currencies
      let currencies: string[] = ["usd"]; // Default fallback
      if (storeRes?.ok) {
        const storeData = await storeRes.json();
        const store = storeData.stores?.[0] || storeData.store;
        if (store?.supported_currencies?.length > 0) {
          currencies = store.supported_currencies.map((c: any) =>
            typeof c === "string" ? c : c.currency_code,
          );
        }
      }
      setStoreCurrencies(currencies);

      // Parse regions
      if (regionsRes?.ok) {
        const regionsData = await regionsRes.json();
        const regionsList = (regionsData.regions || []).map((r: any) => ({
          id: r.id,
          name: r.name,
          currency_code: r.currency_code,
        }));
        setRegions(regionsList);
      }

      // Parse shipping profiles
      if (shippingProfilesRes?.ok) {
        const shippingProfilesData = await shippingProfilesRes.json();
        const profiles = (shippingProfilesData.shipping_profiles || []).map(
          (sp: any) => ({
            id: sp.id,
            name: sp.name,
          }),
        );
        setAvailableShippingProfiles(profiles);
      }

      // Initialize default variant with prices for all currencies
      const defaultPrices = currencies.map((code) => ({
        amount: 0,
        currency_code: code,
      }));
      setVariants([
        {
          title: "Default variant",
          options: { "Default option": "Default option value" },
          prices: defaultPrices,
          manage_inventory: false,
        },
      ]);

      setFormData(data);
    } catch (err) {
      console.error("Failed to load form data:", err);
    }
  };

  // Generate handle from title
  const generateHandle = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  // Check if handle is available
  const checkHandleAvailability = async (
    candidateHandle: string,
  ): Promise<boolean> => {
    if (!token || !candidateHandle) return true;
    try {
      const response = await fetch(
        `${BACKEND_URL}/admin/products?handle=${encodeURIComponent(candidateHandle)}&limit=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        return !data.products || data.products.length === 0;
      }
      return true;
    } catch {
      return true;
    }
  };

  // Generate unique handle with fallback
  const generateUniqueHandle = async (baseTitle: string) => {
    if (!baseTitle.trim()) return;

    setCheckingHandle(true);

    // Try full handle first (e.g., "shanks-rug")
    const fullHandle = generateHandle(baseTitle);
    const isFullAvailable = await checkHandleAvailability(fullHandle);

    if (isFullAvailable) {
      setHandle(fullHandle);
      setCheckingHandle(false);
      return;
    }

    // Try first word only (e.g., "shanks")
    const words = baseTitle.trim().split(/\s+/);
    if (words.length > 1) {
      const shortHandle = generateHandle(words[0]);
      const isShortAvailable = await checkHandleAvailability(shortHandle);

      if (isShortAvailable) {
        setHandle(shortHandle);
        setCheckingHandle(false);
        return;
      }
    }

    // If both taken, add a random suffix
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const uniqueHandle = `${generateHandle(words[0])}-${randomSuffix}`;
    setHandle(uniqueHandle);
    setCheckingHandle(false);
  };

  // Auto-generate handle from title when title changes (with debounce)
  useEffect(() => {
    if (!title || handleManuallyEdited) return;

    const timeoutId = setTimeout(() => {
      generateUniqueHandle(title);
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, handleManuallyEdited, token]);

  // Handle manual edit
  const handleHandleChange = (value: string) => {
    setHandle(value);
    setHandleManuallyEdited(true);
  };

  // Update tab state when current tab changes
  useEffect(() => {
    const newState = { ...tabState };
    if (currentTab === Tab.DETAILS) {
      newState[Tab.DETAILS] = "in-progress";
    }
    if (currentTab === Tab.ORGANIZE) {
      newState[Tab.DETAILS] = "completed";
      newState[Tab.ORGANIZE] = "in-progress";
    }
    if (currentTab === Tab.VARIANTS) {
      newState[Tab.DETAILS] = "completed";
      newState[Tab.ORGANIZE] = "completed";
      newState[Tab.VARIANTS] = "in-progress";
    }
    setTabState(newState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab]);

  // Helper to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  };

  // Image upload handler
  const handleImageUpload = useCallback(
    async (files: FileList) => {
      if (!token) return;

      const newImages: UploadedImage[] = [];

      for (const file of Array.from(files)) {
        const tempId = `temp-${Date.now()}-${Math.random()}`;
        const previewUrl = URL.createObjectURL(file);

        newImages.push({
          id: tempId,
          url: previewUrl,
          file,
          uploading: true,
        });
      }

      setImages((prev) => [...prev, ...newImages]);

      for (const img of newImages) {
        if (!img.file) continue;

        try {
          const base64Content = await fileToBase64(img.file);

          const response = await fetch(`${BACKEND_URL}/admin/product-uploads`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              file: base64Content,
              filename: img.file.name,
              mimeType: img.file.type,
            }),
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || "Upload failed");
          }

          const result = await response.json();
          setImages((prev) =>
            prev.map((i) =>
              i.id === img.id
                ? {
                    ...i,
                    id: result.file.id,
                    url: result.file.url,
                    uploading: false,
                  }
                : i,
            ),
          );
        } catch (err) {
          console.error("Upload failed:", err);
          setImages((prev) => prev.filter((i) => i.id !== img.id));
          setError(`Failed to upload ${img.file.name}`);
        }
      }
    },
    [token],
  );

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((i) => i.id !== id));
  };

  // Option management
  const addOption = () => {
    setOptions([...options, { title: "", values: [] }]);
    setOptionValuesText([...optionValuesText, ""]);
  };

  const updateOption = (
    index: number,
    field: "title" | "values",
    value: string | string[],
  ) => {
    const newOptions = [...options];
    if (field === "title") {
      newOptions[index].title = value as string;
    } else {
      newOptions[index].values = value as string[];
    }
    setOptions(newOptions);
    regenerateVariants(newOptions);
  };

  const removeOption = (index: number) => {
    if (index === 0) return;
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    setOptionValuesText(optionValuesText.filter((_, i) => i !== index));
    regenerateVariants(newOptions);
  };

  // Generate variant permutations
  const getPermutations = (
    data: { title: string; values: string[] }[],
  ): Record<string, string>[] => {
    const validData = data.filter((d) => d.title && d.values.length > 0);
    if (validData.length === 0) return [];
    if (validData.length === 1) {
      return validData[0].values.map((value) => ({
        [validData[0].title]: value,
      }));
    }

    const first = validData[0];
    const rest = validData.slice(1);

    return first.values.flatMap((value) => {
      return getPermutations(rest).map((permutation) => ({
        [first.title]: value,
        ...permutation,
      }));
    });
  };

  const regenerateVariants = (newOptions: ProductOption[]) => {
    if (!enableVariants) return;

    const permutations = getPermutations(newOptions);
    const newVariants: ProductVariant[] = permutations.map((options, idx) => ({
      title: Object.values(options).join(" / "),
      options,
      prices: storeCurrencies.map((code) => ({
        amount: 0,
        currency_code: code,
      })),
      manage_inventory: false,
      sku: "",
    }));

    if (newVariants.length > 0) {
      setVariants(newVariants);
    }
  };

  // Variant management
  const updateVariant = (
    index: number,
    field: keyof ProductVariant,
    value: string | ProductVariant["prices"] | boolean,
  ) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== index) return v;
        if (field === "title") return { ...v, title: value as string };
        if (field === "sku") return { ...v, sku: value as string };
        if (field === "prices")
          return { ...v, prices: value as ProductVariant["prices"] };
        if (field === "manage_inventory")
          return { ...v, manage_inventory: value as boolean };
        return v;
      }),
    );
  };

  // Update a specific currency price in a variant
  const updateVariantPrice = (
    variantIndex: number,
    currencyCode: string,
    amount: number,
  ) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== variantIndex) return v;
        const existingPrices = [...(v.prices || [])];
        const priceIndex = existingPrices.findIndex(
          (p) => p.currency_code === currencyCode,
        );
        if (priceIndex >= 0) {
          existingPrices[priceIndex] = { amount, currency_code: currencyCode };
        } else {
          existingPrices.push({ amount, currency_code: currencyCode });
        }
        return { ...v, prices: existingPrices };
      }),
    );
  };

  // Get price for a specific currency from variant
  const getVariantPrice = (
    variant: ProductVariant,
    currencyCode: string,
  ): number => {
    const price = variant.prices?.find((p) => p.currency_code === currencyCode);
    return price?.amount || 0;
  };

  // Get currency symbol
  const getCurrencySymbol = (code: string): string => {
    const symbols: Record<string, string> = {
      usd: "$",
      eur: "€",
      gbp: "£",
      inr: "₹",
      jpy: "¥",
      cad: "C$",
      aud: "A$",
    };
    return symbols[code.toLowerCase()] || code.toUpperCase();
  };

  // Update a region-specific price in a variant
  const updateVariantRegionPrice = (
    variantIndex: number,
    regionId: string,
    amount: number,
  ) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== variantIndex) return v;
        return {
          ...v,
          region_prices: {
            ...(v.region_prices || {}),
            [regionId]: amount,
          },
        };
      }),
    );
  };

  // Get region-specific price from variant
  const getVariantRegionPrice = (
    variant: ProductVariant,
    regionId: string,
  ): number => {
    return variant.region_prices?.[regionId] || 0;
  };

  // Handle variants toggle
  const handleEnableVariantsChange = (enabled: boolean) => {
    setEnableVariants(enabled);
    if (enabled) {
      setOptions([{ title: "", values: [] }]);
      setOptionValuesText([""]);
      setVariants([]);
    } else {
      setOptions([
        { title: "Default option", values: ["Default option value"] },
      ]);
      setOptionValuesText(["Default option value"]);
      setVariants([
        {
          title: "Default variant",
          options: { "Default option": "Default option value" },
          prices: storeCurrencies.map((code) => ({
            amount: 0,
            currency_code: code,
          })),
          manage_inventory: false,
        },
      ]);
    }
  };

  // Tab navigation
  const validateDetailsTab = (): boolean => {
    if (!title.trim()) {
      setError("Title is required");
      return false;
    }
    return true;
  };

  const validateOrganizeTab = (): boolean => {
    return true; // All fields optional
  };

  const validateVariantsTab = (): boolean => {
    if (enableVariants) {
      const validOptions = options.filter(
        (o) => o.title && o.values.length > 0,
      );
      if (validOptions.length === 0) {
        setError("At least one option with values is required");
        return false;
      }
      if (variants.length === 0) {
        setError("At least one variant is required");
        return false;
      }
    }
    return true;
  };

  const handleTabChange = async (tab: Tab) => {
    setError(null);

    // Validate current tab before allowing navigation
    if (currentTab === Tab.DETAILS && !validateDetailsTab()) return;
    if (currentTab === Tab.ORGANIZE && !validateOrganizeTab()) return;

    setCurrentTab(tab);
  };

  const handleContinue = () => {
    setError(null);

    if (currentTab === Tab.DETAILS) {
      if (!validateDetailsTab()) return;
      setCurrentTab(Tab.ORGANIZE);
    } else if (currentTab === Tab.ORGANIZE) {
      if (!validateOrganizeTab()) return;
      setCurrentTab(Tab.VARIANTS);
    }
  };

  // Submit handler
  const handleSubmit = async (asDraft: boolean = false) => {
    setError(null);

    if (!validateDetailsTab()) {
      setCurrentTab(Tab.DETAILS);
      return;
    }
    if (!validateVariantsTab()) {
      setCurrentTab(Tab.VARIANTS);
      return;
    }

    setLoading(true);

    try {
      const uploadedImages = images
        .filter((img) => !img.uploading)
        .map((img) => ({ url: img.url }));

      const productData = {
        title,
        subtitle: subtitle || undefined,
        description: description || undefined,
        handle: handle || undefined,
        status: asDraft ? "draft" : "published",
        discountable,
        images: uploadedImages,
        options: options
          .filter((o) => o.title && o.values.length > 0)
          .map((o) => ({
            title: o.title.trim(),
            values: o.values.filter((v) => v.trim().length > 0),
          })),
        variants: variants
          .filter((v) => v.title)
          .map((v) => {
            // Build prices array with currency prices and region prices
            const currencyPrices = v.prices
              .filter((p) => p.amount > 0)
              .map((p) => ({
                amount: p.amount,
                currency_code: p.currency_code,
              }));

            // Add region-specific prices
            const regionPrices = Object.entries(v.region_prices || {})
              .filter(([, amount]) => amount > 0)
              .map(([regionId, amount]) => {
                const region = regions.find((r) => r.id === regionId);
                return {
                  amount,
                  currency_code: region?.currency_code || "usd",
                  rules: { region_id: regionId },
                };
              });

            return {
              title: v.title,
              sku: v.sku,
              options: v.options,
              manage_inventory: v.manage_inventory,
              prices: [...currencyPrices, ...regionPrices],
            };
          }),
        categories:
          selectedCategories.length > 0
            ? selectedCategories.map((id) => ({ id }))
            : undefined,
        collection_id: selectedCollection || undefined,
        type_id: typeId || undefined,
        tags: tags
          ? tags
              .split(",")
              .map((t) => t.trim())
              .filter((t) => t)
          : undefined,
        shipping_profile_id: shippingProfileId || undefined,
        sales_channels:
          salesChannels.length > 0
            ? salesChannels.map((sc) => sc.id)
            : undefined,
      };

      const response = await fetch(`${BACKEND_URL}/admin/custom-products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create product");
      }

      router.push("/products");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  // Tab status icon
  const TabStatusIcon = ({ status }: { status: TabStatus }) => {
    if (status === "completed") {
      return (
        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
          <svg
            className="w-3 h-3 text-gray-900 dark:text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      );
    }
    if (status === "in-progress") {
      return (
        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white" />
        </div>
      );
    }
    return (
      <div className="w-5 h-5 rounded-full border-2 border-gray-400 dark:border-gray-600" />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header with tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center h-14 px-4">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white mr-4"
          >
            <svg
              className="w-5 h-5"
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
          </button>
          <span className="text-gray-400 text-sm mr-4">esc</span>

          {/* Tab triggers */}
          <div className="flex items-center gap-6 border-l border-gray-700 pl-6">
            <button
              onClick={() => handleTabChange(Tab.DETAILS)}
              className={`flex items-center gap-2 py-4 text-sm font-medium transition-colors ${
                currentTab === Tab.DETAILS
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <TabStatusIcon status={tabState[Tab.DETAILS]} />
              Details
            </button>
            <button
              onClick={() => handleTabChange(Tab.ORGANIZE)}
              className={`flex items-center gap-2 py-4 text-sm font-medium transition-colors ${
                currentTab === Tab.ORGANIZE
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <TabStatusIcon status={tabState[Tab.ORGANIZE]} />
              Organize
            </button>
            <button
              onClick={() => handleTabChange(Tab.VARIANTS)}
              className={`flex items-center gap-2 py-4 text-sm font-medium transition-colors ${
                currentTab === Tab.VARIANTS
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <TabStatusIcon status={tabState[Tab.VARIANTS]} />
              Variants
            </button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {/* Details Tab */}
        {currentTab === Tab.DETAILS && (
          <div className="flex flex-col items-center p-8 md:p-16">
            <div className="w-full max-w-[720px] flex flex-col gap-y-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                General
              </h2>

              {/* General info */}
              <div className="flex flex-col gap-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Winter jacket"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Subtitle <span className="text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Warm and cozy"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Handle <span className="text-gray-500">(Optional)</span>
                    </label>
                    <div className="flex relative">
                      <span className="inline-flex items-center px-3 py-2 bg-gray-700 border border-r-0 border-gray-600 rounded-l-lg text-gray-600 dark:text-gray-400">
                        /
                      </span>
                      <input
                        type="text"
                        value={handle}
                        onChange={(e) => handleHandleChange(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="winter-jacket"
                      />
                      {checkingHandle && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-blue-500" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Auto-generated from title
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Description{" "}
                    <span className="text-gray-500">(Optional)</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                    placeholder="A warm and cozy jacket"
                  />
                </div>
              </div>

              {/* Media section */}
              <div className="flex flex-col gap-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Media <span className="text-gray-500">(Optional)</span>
                  </label>
                </div>

                <div
                  className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-gray-500 transition-colors"
                  onClick={() =>
                    document.getElementById("image-upload")?.click()
                  }
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files) {
                      handleImageUpload(e.dataTransfer.files);
                    }
                  }}
                >
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        handleImageUpload(e.target.files);
                      }
                    }}
                  />
                  <div className="text-gray-600 dark:text-gray-400">
                    <svg
                      className="mx-auto h-10 w-10 mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                    <p className="text-sm">Upload images</p>
                    <p className="text-xs text-gray-500">
                      Drag and drop images here or click to upload.
                    </p>
                  </div>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {images.map((img) => (
                      <div key={img.id} className="relative group">
                        <img
                          src={img.url}
                          alt="Preview"
                          className={`w-full h-24 object-cover rounded-lg ${
                            img.uploading ? "opacity-50" : ""
                          }`}
                        />
                        {img.uploading && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
                          </div>
                        )}
                        {!img.uploading && (
                          <button
                            type="button"
                            onClick={() => removeImage(img.id)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <hr className="border-gray-700" />

              {/* Variants toggle */}
              <div className="flex flex-col gap-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Variants
                </h2>
                <div className="flex items-start gap-4 p-4 bg-gray-800 rounded-lg">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableVariants}
                      onChange={(e) =>
                        handleEnableVariantsChange(e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Yes, this is a product with variants
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      When unchecked, we will create a default variant for you
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Organize Tab */}
        {currentTab === Tab.ORGANIZE && (
          <div className="flex flex-col items-center p-8 md:p-16">
            <div className="w-full max-w-[720px] flex flex-col gap-y-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Organize
              </h2>

              {/* Discountable toggle */}
              <div className="flex items-start gap-4 p-4 bg-gray-800 rounded-lg">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={discountable}
                    onChange={(e) => setDiscountable(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                </label>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Discountable{" "}
                    <span className="text-gray-500">(Optional)</span>
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    When unchecked, discounts will not be applied to this
                    product
                  </p>
                </div>
              </div>

              {/* Type and Collection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Type <span className="text-gray-500">(Optional)</span>
                  </label>
                  <select
                    value={typeId}
                    onChange={(e) => setTypeId(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select type</option>
                    {formData?.product_types?.map((pt) => (
                      <option key={pt.id} value={pt.id}>
                        {pt.value}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Collection <span className="text-gray-500">(Optional)</span>
                  </label>
                  <select
                    value={selectedCollection}
                    onChange={(e) => setSelectedCollection(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select collection</option>
                    {formData?.collections?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Categories and Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Categories <span className="text-gray-500">(Optional)</span>
                  </label>
                  <select
                    multiple
                    value={selectedCategories}
                    onChange={(e) =>
                      setSelectedCategories(
                        Array.from(e.target.selectedOptions, (o) => o.value),
                      )
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    size={3}
                  >
                    {formData?.categories?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Tags <span className="text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="winter, jacket, warm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Comma-separated tags
                  </p>
                </div>
              </div>

              {/* Shipping Profile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Shipping profile{" "}
                    <span className="text-gray-500">(Optional)</span>
                  </label>
                  <p className="text-xs text-gray-500">
                    Connect the product to a shipping profile
                  </p>
                </div>
                <div>
                  <select
                    value={shippingProfileId}
                    onChange={(e) => setShippingProfileId(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select shipping profile</option>
                    {availableShippingProfiles.map((sp) => (
                      <option key={sp.id} value={sp.id}>
                        {sp.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sales Channels */}
              <div className="relative">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                      Sales channels{" "}
                      <span className="text-gray-500">(Optional)</span>
                    </label>
                    <p className="text-xs text-gray-500">
                      This product will only be available in the default sales
                      channel if left untouched.
                    </p>
                  </div>
                  <div className="relative" ref={salesChannelDropdownRef}>
                    <button
                      type="button"
                      onClick={() =>
                        setShowSalesChannelDropdown(!showSalesChannelDropdown)
                      }
                      className="px-3 py-1.5 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                    >
                      Add
                    </button>
                    {showSalesChannelDropdown && (
                      <div className="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                        <div className="p-2 max-h-48 overflow-y-auto">
                          {availableSalesChannels
                            .filter(
                              (sc) =>
                                !salesChannels.some((s) => s.id === sc.id),
                            )
                            .map((sc) => (
                              <button
                                key={sc.id}
                                type="button"
                                onClick={() => {
                                  setSalesChannels((prev) => [...prev, sc]);
                                  setShowSalesChannelDropdown(false);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 rounded"
                              >
                                {sc.name}
                              </button>
                            ))}
                          {availableSalesChannels.filter(
                            (sc) => !salesChannels.some((s) => s.id === sc.id),
                          ).length === 0 && (
                            <p className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                              All channels added
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {salesChannels.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {salesChannels.map((sc) => (
                      <span
                        key={sc.id}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-900 dark:text-white"
                      >
                        {sc.name}
                        <button
                          type="button"
                          onClick={() =>
                            setSalesChannels((prev) =>
                              prev.filter((s) => s.id !== sc.id),
                            )
                          }
                          className="text-gray-400 hover:text-gray-900 dark:text-white"
                        >
                          <svg
                            className="w-3 h-3"
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
                        </button>
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSalesChannels([])}
                      className="text-sm text-gray-400 hover:text-gray-900 dark:text-white"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Variants Tab */}
        {currentTab === Tab.VARIANTS && (
          <div className="flex-1 overflow-hidden">
            {/* Options builder (when variants enabled) */}
            {enableVariants && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-100 dark:bg-gray-800/50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Product Options
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Define options like size, color, etc.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addOption}
                    className="px-3 py-1.5 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-3">
                  {options.map((option, index) => (
                    <div
                      key={index}
                      className="flex gap-3 items-center bg-gray-200 dark:bg-gray-700/50 p-3 rounded-lg"
                    >
                      <div className="flex-1">
                        <label className="block text-xs text-gray-400 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={option.title}
                          onChange={(e) =>
                            updateOption(index, "title", e.target.value)
                          }
                          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-white text-sm"
                          placeholder="e.g., Size"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-400 mb-1">
                          Values
                        </label>
                        <input
                          type="text"
                          value={
                            optionValuesText[index] ?? option.values.join(", ")
                          }
                          onChange={(e) => {
                            setOptionValuesText((prev) => {
                              const updated = [...prev];
                              updated[index] = e.target.value;
                              return updated;
                            });
                          }}
                          onBlur={(e) => {
                            const values = e.target.value
                              .split(",")
                              .map((v) => v.trim())
                              .filter((v) => v.length > 0);
                            updateOption(index, "values", values);
                          }}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-white text-sm"
                          placeholder="e.g., Small, Medium, Large"
                        />
                      </div>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="p-2 text-red-400 hover:text-red-300"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Variants table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-400 w-32">
                      Options
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-400 w-32">
                      Title
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-400 w-24">
                      SKU
                    </th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-400 w-28">
                      Managed Inventory
                    </th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-400 w-28">
                      Allow backorder
                    </th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-400 w-28">
                      Has inventory kit
                    </th>
                    {storeCurrencies.map((currency) => (
                      <th
                        key={currency}
                        className="px-4 py-2 text-left text-sm font-medium text-gray-400 w-24"
                      >
                        Price {currency.toUpperCase()}
                      </th>
                    ))}
                    {regions.map((region) => (
                      <th
                        key={region.id}
                        className="px-4 py-2 text-left text-sm font-medium text-gray-400 w-28"
                      >
                        Price {region.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {variants.map((variant, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 dark:border-gray-700"
                    >
                      <td className="px-4 py-3 w-32">
                        <input
                          type="text"
                          value={
                            Object.values(variant.options || {}).join(" / ") ||
                            "Default option va..."
                          }
                          readOnly
                          className="w-full px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 w-32">
                        <input
                          type="text"
                          value={variant.title}
                          onChange={(e) =>
                            updateVariant(index, "title", e.target.value)
                          }
                          className="w-full px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white text-sm"
                          placeholder="Default variant"
                        />
                      </td>
                      <td className="px-4 py-3 w-24">
                        <input
                          type="text"
                          value={variant.sku || ""}
                          onChange={(e) =>
                            updateVariant(index, "sku", e.target.value)
                          }
                          className="w-full px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white text-sm"
                          placeholder="SKU"
                        />
                      </td>
                      <td className="px-4 py-3 w-28 text-center">
                        <input
                          type="checkbox"
                          checked={variant.manage_inventory || false}
                          onChange={(e) =>
                            updateVariant(
                              index,
                              "manage_inventory",
                              e.target.checked,
                            )
                          }
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 w-28 text-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 w-28 text-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                      </td>
                      {storeCurrencies.map((currency) => (
                        <td key={currency} className="px-4 py-3 w-24">
                          <div className="flex items-center">
                            <span className="text-gray-400 mr-1">
                              {getCurrencySymbol(currency)}
                            </span>
                            <input
                              type="number"
                              step="0.01"
                              value={getVariantPrice(variant, currency) || ""}
                              onChange={(e) =>
                                updateVariantPrice(
                                  index,
                                  currency,
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              className="w-full px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white text-sm"
                              placeholder="0.00"
                            />
                          </div>
                        </td>
                      ))}
                      {regions.map((region) => (
                        <td key={region.id} className="px-4 py-3 w-28">
                          <div className="flex items-center">
                            <span className="text-gray-400 mr-1">
                              {getCurrencySymbol(region.currency_code)}
                            </span>
                            <input
                              type="number"
                              step="0.01"
                              value={
                                getVariantRegionPrice(variant, region.id) || ""
                              }
                              onChange={(e) =>
                                updateVariantRegionPrice(
                                  index,
                                  region.id,
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              className="w-full px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white text-sm"
                              placeholder="0.00"
                            />
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3">
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm text-gray-300 hover:text-gray-900 dark:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="px-4 py-2 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save as draft"}
          </button>
          {currentTab === Tab.VARIANTS ? (
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Publishing..." : "Publish"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleContinue}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
