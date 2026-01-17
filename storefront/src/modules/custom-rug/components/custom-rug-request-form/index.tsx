"use client"

import React, { useEffect, useMemo, useState } from "react"
import { submitCustomRugRequest } from "@lib/data/custom-rug"

type Shape = "rectangle" | "round" | "oval" | "custom"
type Unit = "in" | "cm" | "ft"

type Props = { className?: string }

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ")
}

function safeNum(v: string) {
  const t = v.trim()
  if (!t) return undefined
  const n = Number(t)
  return Number.isFinite(n) ? n : undefined
}

export default function CustomRugRequestForm({ className }: Props) {
  // ✅ Upload limits (PRODUCTION)
  const MAX_FILES = 3
  const MAX_FILE_SIZE_MB = 5
  const MAX_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [fileError, setFileError] = useState<string | null>(null)

  // ✅ prevent memory leak (store blob urls once)
  const [filePreviews, setFilePreviews] = useState<
    Array<{ file: File; url: string }>
  >([])

  useEffect(() => {
    // cleanup old urls
    filePreviews.forEach((p) => URL.revokeObjectURL(p.url))

    if (!selectedFiles.length) {
      setFilePreviews([])
      setPreviewUrl(null)
      return
    }

    const previews = selectedFiles.map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
    }))

    setFilePreviews(previews)
    setPreviewUrl(previews[0]?.url || null)

    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFiles])

  const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: "$",
    INR: "₹",
    EUR: "€",
    GBP: "£",
    CAD: "$",
    AUD: "$",
  }

  const [shape, setShape] = useState<Shape>("rectangle")
  const [unit, setUnit] = useState<Unit>("in")

  const [width, setWidth] = useState("")
  const [height, setHeight] = useState("")

  const [budgetMin, setBudgetMin] = useState("")
  const [budgetMax, setBudgetMax] = useState("")
  const [currency, setCurrency] = useState("USD")

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{
    id: string
    status?: string
  } | null>(null)

  const clientRequestId = useMemo(() => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID()
    }
    return `cr_${Date.now()}_${Math.random().toString(16).slice(2)}`
  }, [])

  const widthN = safeNum(width)
  const heightN = safeNum(height)
  const budgetMinN = safeNum(budgetMin)
  const budgetMaxN = safeNum(budgetMax)

  // ✅ Submit disabled if fileError exists
  const canSubmit =
    !!name.trim() &&
    !!email.trim() &&
    !!widthN &&
    !!heightN &&
    !submitting &&
    !fileError

  function handleFileChange(files: FileList | null) {
    const arr = Array.from(files || [])

    setFileError(null)
    setError(null)

    if (!arr.length) {
      setSelectedFiles([])
      return
    }

    if (arr.length > MAX_FILES) {
      setFileError(`Maximum ${MAX_FILES} images allowed.`)
      return
    }

    const invalid = arr.find((f) => {
      const okType = ALLOWED_TYPES.includes(f.type)
      const okSize = f.size <= MAX_BYTES
      return !okType || !okSize
    })

    if (invalid) {
      setFileError(
        `Invalid file: ${invalid.name}. Only JPG/PNG/WEBP up to ${MAX_FILE_SIZE_MB}MB allowed.`
      )
      return
    }

    setSelectedFiles(arr)
  }

  async function uploadToS3(files: File[]) {
    const fd = new FormData()
    files.forEach((f) => fd.append("files", f)) // ✅ IMPORTANT

    const base = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
    const pk = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

    if (!base) throw new Error("NEXT_PUBLIC_MEDUSA_BACKEND_URL is missing")
    if (!pk) throw new Error("NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is missing")

    const res = await fetch(
      `${base.replace(/\/$/, "")}/store/custom-rug-uploads`,
      {
        method: "POST",
        headers: {
          "x-publishable-api-key": pk,
        },
        body: fd,
      }
    )

    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data?.message || "Image upload failed")

    return (data.files as Array<{ url: string }>).map((f) => f.url)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // ✅ block submit if file is invalid
    if (fileError) {
      setError(fileError)
      return
    }

    if (!widthN || !heightN) {
      setError("Please enter a valid width and height.")
      return
    }

    if (budgetMinN && budgetMaxN && budgetMinN > budgetMaxN) {
      setError("Min budget cannot be greater than max budget.")
      return
    }

    try {
      setSubmitting(true)

      const uploadedUrls = selectedFiles.length
        ? await uploadToS3(selectedFiles)
        : []

      const payload = {
        client_request_id: clientRequestId,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,

        width: widthN,
        height: heightN,
        unit,
        shape,

        budgetMin: budgetMinN,
        budgetMax: budgetMaxN,
        currency,

        notes: notes.trim() || undefined,
        referenceImages: uploadedUrls.length ? uploadedUrls : undefined,
      }

      const data = await submitCustomRugRequest(payload)
      setSuccess({ id: data.id, status: data.status })
    } catch (err: any) {
      setError(err?.message || "Something went wrong.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section
      className={cn(
        "w-full py-10 md:py-14",
        "bg-[radial-gradient(1200px_circle_at_20%_-10%,rgba(212,175,55,0.10),transparent_55%),radial-gradient(900px_circle_at_85%_0%,rgba(212,175,55,0.08),transparent_55%)]",
        className
      )}
    >
      <div className="mx-auto w-full max-w-5xl px-4 md:px-6">
        <div className="mb-8 md:mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-ui-fg-base">
            Create Your Custom Rug
          </h2>
          <p className="mt-2 text-sm md:text-base text-ui-fg-subtle">
            Tell us about your dream rug — we’ll craft it for you.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="grid gap-6 lg:grid-cols-5 lg:gap-8"
        >
          {/* Left */}
          <div className="lg:col-span-3 rounded-2xl border border-ui-border-base bg-ui-bg-base shadow-sm">
            <div className="p-4 sm:p-5 md:p-7">
              {/* Rug Details */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-ui-fg-base">
                  Rug Details
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ui-fg-subtle">Unit</span>
                  <select
                    className="h-9 rounded-lg border border-ui-border-base bg-ui-bg-base px-3 text-sm text-ui-fg-base outline-none"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as Unit)}
                  >
                    <option value="in">inches</option>
                    <option value="cm">cm</option>
                    <option value="ft">ft</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm text-ui-fg-subtle">Width</span>
                  <input
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    inputMode="decimal"
                    placeholder="e.g. 60"
                    className="mt-1 h-11 w-full rounded-xl border border-ui-border-base bg-ui-bg-base px-4 text-sm text-ui-fg-base outline-none focus:ring-2 focus:ring-[rgba(212,175,55,0.35)]"
                  />
                </label>

                <label className="block">
                  <span className="text-sm text-ui-fg-subtle">Height</span>
                  <input
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    inputMode="decimal"
                    placeholder="e.g. 36"
                    className="mt-1 h-11 w-full rounded-xl border border-ui-border-base bg-ui-bg-base px-4 text-sm text-ui-fg-base outline-none focus:ring-2 focus:ring-[rgba(212,175,55,0.35)]"
                  />
                </label>
              </div>

              <div className="mt-5">
                <span className="text-sm text-ui-fg-subtle">Shape</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(
                    [
                      ["rectangle", "Rectangle"],
                      ["round", "Round"],
                      ["oval", "Oval"],
                      ["custom", "Custom"],
                    ] as const
                  ).map(([key, label]) => {
                    const active = shape === key
                    return (
                      <button
                        type="button"
                        key={key}
                        onClick={() => setShape(key)}
                        className={cn(
                          "h-10 rounded-xl border px-4 text-sm transition",
                          active
                            ? "border-transparent bg-[rgba(212,175,55,0.18)] text-ui-fg-base"
                            : "border-ui-border-base bg-ui-bg-base text-ui-fg-subtle hover:text-ui-fg-base"
                        )}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Images */}
              <div className="mt-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-ui-fg-subtle">
                    Reference Images
                  </span>
                  <span className="text-xs text-ui-fg-subtle">
                    Upload up to {MAX_FILES} images
                  </span>
                </div>

                <div className="mt-2">
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => handleFileChange(e.target.files)}
                  />
                </div>

                {fileError && (
                  <div className="mt-2 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {fileError}
                  </div>
                )}

                {selectedFiles.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {selectedFiles.map((file, idx) => {
                      const p = filePreviews.find((x) => x.file === file)

                      return (
                        <li
                          key={file.name + idx}
                          className="flex items-center justify-between gap-3 rounded-xl border border-ui-border-base bg-ui-bg-subtle px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={p?.url}
                              alt={file.name}
                              className="h-12 w-12 rounded-lg object-cover border"
                            />
                            <div className="text-sm">
                              <p className="truncate text-ui-fg-base">
                                {file.name}
                              </p>
                              <p className="text-xs text-ui-fg-subtle">
                                {(file.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const toRemove = filePreviews[idx]
                              if (toRemove?.url)
                                URL.revokeObjectURL(toRemove.url)

                              setSelectedFiles((prev) =>
                                prev.filter((_, i) => i !== idx)
                              )
                            }}
                            className="text-sm text-ui-fg-subtle hover:text-ui-fg-base"
                          >
                            Remove
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>

              {/* Budget */}
              <div className="mt-8 border-t border-ui-border-base pt-6">
                <h3 className="text-lg font-semibold text-ui-fg-base">
                  Budget
                </h3>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <label className="block">
                    <span className="text-sm text-ui-fg-subtle">
                      Min Budget
                    </span>
                    <div className="mt-1 flex h-11 items-center rounded-xl border border-ui-border-base bg-ui-bg-base px-3">
                      <span className="text-sm text-ui-fg-subtle">
                        {CURRENCY_SYMBOLS[currency] ?? currency}
                      </span>
                      <input
                        value={budgetMin}
                        onChange={(e) => setBudgetMin(e.target.value)}
                        inputMode="numeric"
                        placeholder="e.g. 120"
                        className="h-full w-full bg-transparent px-2 text-sm text-ui-fg-base outline-none"
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="text-sm text-ui-fg-subtle">
                      Max Budget
                    </span>
                    <div className="mt-1 flex h-11 items-center rounded-xl border border-ui-border-base bg-ui-bg-base px-3">
                      <span className="text-sm text-ui-fg-subtle">
                        {CURRENCY_SYMBOLS[currency] ?? currency}
                      </span>
                      <input
                        value={budgetMax}
                        onChange={(e) => setBudgetMax(e.target.value)}
                        inputMode="numeric"
                        placeholder="e.g. 200"
                        className="h-full w-full bg-transparent px-2 text-sm text-ui-fg-base outline-none"
                      />
                    </div>
                  </label>
                </div>

                <div className="mt-3">
                  <label className="block">
                    <span className="text-sm text-ui-fg-subtle">Currency</span>
                    <select
                      className="mt-1 h-11 w-full rounded-xl border border-ui-border-base bg-ui-bg-base px-4 text-sm text-ui-fg-base outline-none"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      <option value="USD">USD</option>
                      <option value="INR">INR</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="CAD">CAD</option>
                      <option value="AUD">AUD</option>
                    </select>
                  </label>
                </div>
              </div>

              {/* Contact */}
              <div className="mt-8 border-t border-ui-border-base pt-6">
                <h3 className="text-lg font-semibold text-ui-fg-base">
                  Contact Info
                </h3>

                <div className="mt-4 grid gap-3">
                  <label className="block">
                    <span className="text-sm text-ui-fg-subtle">Your Name</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full name"
                      className="mt-1 h-11 w-full rounded-xl border border-ui-border-base bg-ui-bg-base px-4 text-sm text-ui-fg-base outline-none focus:ring-2 focus:ring-[rgba(212,175,55,0.35)]"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm text-ui-fg-subtle">
                      Email Address
                    </span>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@email.com"
                      type="email"
                      className="mt-1 h-11 w-full rounded-xl border border-ui-border-base bg-ui-bg-base px-4 text-sm text-ui-fg-base outline-none focus:ring-2 focus:ring-[rgba(212,175,55,0.35)]"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm text-ui-fg-subtle">
                      Phone Number
                    </span>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91..."
                      className="mt-1 h-11 w-full rounded-xl border border-ui-border-base bg-ui-bg-base px-4 text-sm text-ui-fg-base outline-none focus:ring-2 focus:ring-[rgba(212,175,55,0.35)]"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm text-ui-fg-subtle">
                      Additional Notes
                    </span>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Share your idea, colors, theme, deadline, etc."
                      className="mt-1 min-h-[120px] w-full resize-y rounded-xl border border-ui-border-base bg-ui-bg-base px-4 py-3 text-sm text-ui-fg-base outline-none focus:ring-2 focus:ring-[rgba(212,175,55,0.35)]"
                    />
                  </label>
                </div>
              </div>

              {/* Messages */}
              <div className="mt-6">
                {error && (
                  <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    Request submitted! <span className="font-medium">ID:</span>{" "}
                    {success.id}
                    {success.status ? ` • ${success.status}` : ""}
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={cn(
                    "h-12 w-full rounded-2xl px-5 text-sm font-semibold transition",
                    "bg-[linear-gradient(90deg,rgba(212,175,55,0.92),rgba(168,124,32,0.92))] text-black",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "hover:brightness-[1.03]"
                  )}
                >
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>

                {!canSubmit && fileError && (
                  <p className="mt-2 text-xs text-red-600">
                    Fix image upload issue to enable Submit.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-ui-border-base bg-ui-bg-base shadow-sm overflow-hidden lg:sticky lg:top-6">
              <div className="p-5 md:p-6">
                <h3 className="text-base font-semibold text-ui-fg-base">
                  Preview
                </h3>
                <p className="mt-1 text-sm text-ui-fg-subtle">
                  Quick summary of your request.
                </p>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-ui-fg-subtle">Size</span>
                    <span className="font-medium text-ui-fg-base">
                      {width || "—"} × {height || "—"} {unit}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-ui-fg-subtle">Shape</span>
                    <span className="font-medium text-ui-fg-base">
                      {shape.charAt(0).toUpperCase() + shape.slice(1)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-ui-fg-subtle">Budget</span>
                    <span className="font-medium text-ui-fg-base">
                      {budgetMin || budgetMax
                        ? `${budgetMin || "—"} - ${
                            budgetMax || "—"
                          } ${currency}`
                        : "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-ui-fg-subtle">Images</span>
                    <span className="font-medium text-ui-fg-base">
                      {selectedFiles.length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-ui-border-base bg-ui-bg-subtle p-5 md:p-6">
                <div className="aspect-[4/5] w-full overflow-hidden rounded-2xl border border-ui-border-base bg-ui-bg-subtle">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(600px_circle_at_20%_20%,rgba(212,175,55,0.18),transparent_55%),radial-gradient(700px_circle_at_80%_30%,rgba(212,175,55,0.10),transparent_55%)]">
                      <div className="text-center px-6">
                        <p className="text-sm font-semibold text-ui-fg-base">
                          Handmade • Premium Carving • Fast Updates
                        </p>
                        <p className="mt-2 text-xs text-ui-fg-subtle">
                          Upload an image to preview it here
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  )
}
