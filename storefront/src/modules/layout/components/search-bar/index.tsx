"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { MeiliSearch } from "meilisearch"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { BsSearch, BsX } from "react-icons/bs"
import Image from "next/image"

const SEARCH_ENDPOINT =
  process.env.NEXT_PUBLIC_SEARCH_ENDPOINT || "http://localhost:7700"
const SEARCH_API_KEY = process.env.NEXT_PUBLIC_SEARCH_API_KEY || ""

type ProductHit = {
  id: string
  title: string
  handle: string
  description?: string
  thumbnail?: string
  variant_sku?: string
}

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<ProductHit[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputRefMobile = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mobileContainerRef = useRef<HTMLDivElement>(null)
  const proxyInputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Focus input when search opens
  useEffect(() => {
    if (isOpen) {
      // Desktop: simple delayed focus
      setTimeout(() => inputRef.current?.focus(), 200)
      // Mobile: transfer focus from proxy to real input
      // The proxy already has the keyboard open from the tap event
      setTimeout(() => {
        if (inputRefMobile.current) {
          inputRefMobile.current.focus()
        }
      }, 100)
    }
  }, [isOpen])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        mobileContainerRef.current &&
        !mobileContainerRef.current.contains(target)
      ) {
        closeSearch()
      }
      // Desktop only
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !mobileContainerRef.current
      ) {
        closeSearch()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearch()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)
    try {
      const client = new MeiliSearch({
        host: SEARCH_ENDPOINT,
        apiKey: SEARCH_API_KEY,
      })
      const searchResults = await client
        .index("products")
        .search(searchQuery, { limit: 8 })
      setResults(searchResults.hits as ProductHit[])
    } catch (err) {
      console.error("Search error:", err)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => performSearch(value), 250)
  }

  const closeSearch = () => {
    setIsOpen(false)
    setQuery("")
    setResults([])
  }

  /* shared results dropdown */
  const renderResults = () => {
    if (!query.trim()) return null
    return (
      <>
        {isSearching ? (
          <div className="px-4 py-6 text-center text-gray-400 text-sm">
            Searching...
          </div>
        ) : results.length === 0 ? (
          <div className="px-4 py-6 text-center text-gray-400 text-sm">
            No results for &ldquo;{query}&rdquo;
          </div>
        ) : (
          <div className="max-h-[60vh] md:max-h-[400px] overflow-y-auto">
            {results.map((product, i) => (
              <LocalizedClientLink
                key={product.id}
                href={`/products/${product.handle}`}
                onClick={closeSearch}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition ${
                  i > 0 ? "border-t border-gray-100" : ""
                }`}
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {product.thumbnail ? (
                    <Image
                      src={product.thumbnail}
                      alt={product.title}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                      No img
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-800 line-clamp-2">
                  {product.title}
                </span>
              </LocalizedClientLink>
            ))}
          </div>
        )}
      </>
    )
  }

  // Toggle body class to hide nav links when search is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("search-open")
    } else {
      document.body.classList.remove("search-open")
    }
    return () => document.body.classList.remove("search-open")
  }, [isOpen])

  return (
    <>
      {/* CSS to hide center nav when search is open on tablet-sized screens */}
      <style jsx global>{`
        .search-open [data-nav-center] {
          display: none !important;
        }
      `}</style>

      {/* ========== DESKTOP: inline sliding expand ========== */}
      <div ref={containerRef} className="relative items-center hidden md:flex">
        <div
          className={`flex items-center overflow-hidden transition-all duration-300 ease-in-out rounded-full ${
            isOpen ? "w-[320px] bg-gray-100 border border-gray-200" : "w-12"
          }`}
        >
          <button
            onClick={() => {
              if (!isOpen) setIsOpen(true)
            }}
            className={`flex-shrink-0 w-12 h-12 rounded-full flex justify-center items-center cursor-pointer transition ${
              isOpen ? "" : "hover:bg-black/[0.05]"
            }`}
            aria-label="Search"
          >
            <BsSearch className="text-[18px] text-black" />
          </button>

          <input
            ref={inputRef}
            type="text"
            placeholder="Search rugs..."
            value={query}
            onChange={handleInputChange}
            className={`bg-transparent outline-none text-base flex-1 pr-2 transition-opacity duration-200 ${
              isOpen
                ? "opacity-100 w-full"
                : "opacity-0 w-0 pointer-events-none"
            }`}
          />

          {isOpen && (
            <button
              onClick={closeSearch}
              className="flex-shrink-0 w-10 h-10 flex justify-center items-center text-gray-400 hover:text-black transition"
              aria-label="Close search"
            >
              <BsX className="text-2xl" />
            </button>
          )}
        </div>

        {/* Desktop dropdown */}
        {isOpen && query.trim() && (
          <div className="absolute top-full right-0 mt-2 w-[400px] bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-[100]">
            {renderResults()}
          </div>
        )}
      </div>

      {/* ========== MOBILE: full-width overlay with grow animation ========== */}
      <style jsx global>{`
        @keyframes searchGrowIn {
          0% {
            opacity: 0;
            transform: scaleX(0.3) scaleY(0.8);
          }
          60% {
            opacity: 1;
            transform: scaleX(1.02) scaleY(1);
          }
          100% {
            opacity: 1;
            transform: scaleX(1) scaleY(1);
          }
        }
        @keyframes searchFadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        @keyframes searchDropIn {
          0% {
            opacity: 0;
            transform: translateY(-8px) scale(0.97);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      {/* Mobile search icon */}
      {!isOpen && (
        <button
          onClick={() => {
            // Focus proxy input SYNCHRONOUSLY on tap to trigger iOS keyboard
            proxyInputRef.current?.focus()
            setIsOpen(true)
          }}
          className="md:hidden w-8 h-8 rounded-full flex justify-center items-center hover:bg-black/[0.05] cursor-pointer transition"
          aria-label="Search"
        >
          <BsSearch className="text-[15px] text-black" />
        </button>
      )}

      {/* Hidden proxy input to capture iOS keyboard on first tap */}
      <input
        ref={proxyInputRef}
        className="absolute opacity-0 w-0 h-0 pointer-events-none"
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* Mobile overlay */}
      {isOpen && (
        <div
          ref={mobileContainerRef}
          className="fixed inset-x-0 top-0 z-[200] md:hidden"
        >
          <div
            className="flex items-center gap-2 bg-white px-4 py-2 shadow-md border-b border-gray-200 origin-center"
            style={{
              animation:
                "searchGrowIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
            }}
          >
            <div className="flex items-center flex-1 bg-gray-100 rounded-full border border-gray-200">
              <div className="flex-shrink-0 w-10 h-10 flex justify-center items-center">
                <BsSearch className="text-[15px] text-gray-400" />
              </div>
              <input
                ref={inputRefMobile}
                type="text"
                placeholder="Search rugs..."
                value={query}
                onChange={handleInputChange}
                className="bg-transparent outline-none text-sm flex-1 pr-2"
              />
              <button
                onClick={closeSearch}
                className="flex-shrink-0 w-10 h-10 flex justify-center items-center text-gray-400 hover:text-black transition"
                aria-label="Close search"
              >
                <BsX className="text-xl" />
              </button>
            </div>
          </div>

          {/* Mobile dropdown */}
          {query.trim() && (
            <div
              className="mx-4 mt-2 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden"
              style={{ animation: "searchDropIn 0.25s ease-out forwards" }}
            >
              {renderResults()}
            </div>
          )}

          {/* Background overlay */}
          <div
            className="fixed inset-0 bg-black/20 -z-10"
            style={{ animation: "searchFadeIn 0.3s ease-out forwards" }}
            onClick={closeSearch}
          />
        </div>
      )}
    </>
  )
}
