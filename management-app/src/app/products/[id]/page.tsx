"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import VariantPricingTable from "@/components/VariantPricingTable";

interface UploadedImage {
  id: string;
  url: string;
  file?: File;
  uploading?: boolean;
}

interface ProductDetail {
  id: string;
  title: string;
  handle: string;
  status: string;
  description: string | null;
  thumbnail: string | null;
  images: { id: string; url: string }[];
  created_at: string;
  updated_at: string;
}

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

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { token, isAuthenticated } = useAuth();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [originalImageUrls, setOriginalImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Variants & Pricing state
  const [variants, setVariants] = useState<Variant[]>([]);
  const [priceContexts, setPriceContexts] = useState<PriceContext[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(true);

  // Fetch product on mount
  useEffect(() => {
    if (isAuthenticated && token && productId) {
      loadProduct();
      loadVariantsPricing();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token, productId]);

  const loadProduct = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/admin/products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch product");
      }

      const data = await response.json();
      const prod = data.product as ProductDetail;
      setProduct(prod);

      const existingImages: UploadedImage[] = (prod.images || []).map(
        (img) => ({
          id: img.id,
          url: img.url,
          uploading: false,
        })
      );
      setImages(existingImages);
      setOriginalImageUrls(existingImages.map((i) => i.url));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const loadVariantsPricing = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/admin/products/${productId}/variants-pricing`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch variants");
      }

      const data = await response.json();
      console.log("=== VARIANTS PRICING DEBUG ===");
      console.log("Price Contexts:", data.priceContexts);
      console.log("Variants:", data.variants);
      data.variants?.forEach((v: any, idx: number) => {
        console.log(`Variant ${idx} (${v.title}):`, v.prices?.map((p: any) => ({
          currency: p.currency_code,
          amount: p.amount,
          region: p.region_name,
          context_key: p.context_key,
        })));
      });
      setVariants(data.variants || []);
      setPriceContexts(data.priceContexts || []);
    } catch (err) {
      console.error("Failed to load variants pricing:", err);
    } finally {
      setLoadingVariants(false);
    }
  };

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

          const response = await fetch(
            `${BACKEND_URL}/admin/product-uploads`,
            {
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
            }
          );

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
                : i
            )
          );
        } catch (err) {
          console.error("Upload failed:", err);
          setImages((prev) => prev.filter((i) => i.id !== img.id));
          setError(
            `Failed to upload ${img.file.name}: ${err instanceof Error ? err.message : "Unknown error"}`
          );
        }
      }
    },
    [token]
  );

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((i) => i.id !== id));
  };

  // Check if images have changed
  const anyUploading = images.some((img) => img.uploading);
  const currentUrls = images
    .filter((i) => !i.uploading)
    .map((i) => i.url)
    .sort();
  const isDirty =
    JSON.stringify(currentUrls) !==
    JSON.stringify([...originalImageUrls].sort());

  // Save handler
  const handleSave = async () => {
    if (!token || anyUploading) return;

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const uploadedImages = images
        .filter((img) => !img.uploading)
        .map((img) => ({ url: img.url }));

      const response = await fetch(
        `${BACKEND_URL}/admin/products/${productId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ images: uploadedImages }),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData.message || errData.error || "Failed to update product"
        );
      }

      setOriginalImageUrls(uploadedImages.map((i) => i.url));
      setSuccessMessage("Product images updated successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update product"
      );
    } finally {
      setSaving(false);
    }
  };

  // Handle variant price updates
  const handleSaveVariantPrices = async (
    variantId: string,
    prices: Array<{
      id?: string;
      currency_code: string;
      region_id?: string;
      amount: number;
    }>
  ) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/admin/products/${productId}/variants/${variantId}/prices`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prices }),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to update prices");
      }

      const result = await response.json();

      // Refresh variants to get newly created/updated prices
      await loadVariantsPricing();

      const message = result.created_count > 0
        ? `Created ${result.created_count} and updated ${result.updated_count} prices`
        : `Updated ${result.updated_count} prices`;

      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update prices");
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Product not found
          </p>
          <button
            onClick={() => router.push("/products")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto flex items-center h-14 px-4 sm:px-6 gap-3">
          <button
            onClick={() => router.push("/products")}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit Product
          </h1>
          <span
            className={`ml-auto px-2 py-1 text-xs font-medium rounded-full ${
              product.status === "published"
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
            }`}
          >
            {product.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 flex flex-col gap-6">
          {/* Messages */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 text-sm">
              {successMessage}
            </div>
          )}

          {/* Product Info (read-only) */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Product Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Title
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {product.title}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Handle
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  /{product.handle}
                </p>
              </div>
              {product.description && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Description
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white line-clamp-3">
                    {product.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Media Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Media
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Add or remove product images. The first image will be used as
                the thumbnail.
              </p>
            </div>

            {/* Upload zone */}
            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
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
                    e.target.value = "";
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

            {/* Image grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                {images.map((img) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={img.url}
                      alt="Product"
                      className={`w-full aspect-square object-cover rounded-lg ${
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

            {images.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-4">
                No images yet. Upload some above.
              </p>
            )}
          </div>

          {/* Variants & Pricing Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Variants & Pricing
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Manage variant prices across different currencies. Prices are stored in cents/smallest currency unit.
              </p>
            </div>

            {loadingVariants ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </div>
            ) : (
              <VariantPricingTable
                variants={variants}
                priceContexts={priceContexts}
                onSave={handleSaveVariantPrices}
              />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 sm:px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-end gap-3">
          <button
            onClick={() => router.push("/products")}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || anyUploading || !isDirty}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
