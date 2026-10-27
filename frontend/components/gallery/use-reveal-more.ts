"use client";

import { useEffect, useRef, useState } from "react";

export function useRevealMore(pageSize: number, total: number) {
  const listRef = useRef<HTMLUListElement>(null);
  const pendingFocusIndex = useRef<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const hasMore = visibleCount < total;

  useEffect(() => {
    const index = pendingFocusIndex.current;
    if (index === null || index >= visibleCount) {
      return;
    }
    pendingFocusIndex.current = null;
    const item = listRef.current?.children[index];
    const control = item?.querySelector("a, button");
    if (control instanceof HTMLElement) {
      control.focus();
    }
  }, [visibleCount]);

  function revealMore() {
    pendingFocusIndex.current = visibleCount;
    setVisibleCount((count) => count + pageSize);
  }

  return { listRef, visibleCount, hasMore, revealMore };
}
