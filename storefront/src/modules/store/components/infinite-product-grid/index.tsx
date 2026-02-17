"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"

const PAGE_SIZE = 12

export default function InfiniteProductGrid({
  children,
}: {
  children: React.ReactNode
}) {
  const items = React.Children.toArray(children)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const loaderRef = useRef<HTMLDivElement>(null)

  const hasMore = visibleCount < items.length

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, items.length))
  }, [items.length])

  // Auto-load when the sentinel comes into view
  useEffect(() => {
    const el = loaderRef.current
    if (!el || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { rootMargin: "200px" }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loadMore])

  return (
    <>
      <ul
        className="
          grid grid-cols-2 w-full
          gap-x-3 gap-y-5
          small:grid-cols-3 small:gap-x-6 small:gap-y-8
          medium:grid-cols-4
        "
        data-testid="products-list"
      >
        {items.slice(0, visibleCount)}
      </ul>

      {hasMore && (
        <div ref={loaderRef} className="flex justify-center mt-10">
          <button
            onClick={loadMore}
            className="px-6 py-2.5 text-sm font-medium rounded-lg border border-ui-border-base bg-ui-bg-base text-ui-fg-base hover:bg-ui-bg-base-hover transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </>
  )
}
