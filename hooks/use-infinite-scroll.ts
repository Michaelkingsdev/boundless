'use client';

import { useEffect, useRef } from 'react';

export interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  rootMargin?: string;
  /** When true, logs observer lifecycle and skip reasons to console. Default: false. */
  debug?: boolean;
}

/**
 * Triggers onLoadMore when the sentinel element enters the viewport (or within rootMargin of it).
 * Pass the sentinel DOM element (e.g. from a callback ref + state) so the observer attaches after mount.
 * onLoadMore does not need to be memoized (useCallback); a ref is used internally.
 */
export const useInfiniteScroll: (
  sentinel: HTMLElement | null,
  options: UseInfiniteScrollOptions
) => void = (sentinel, options) => {
  const {
    onLoadMore,
    hasMore,
    loading,
    rootMargin = '0px 0px 400px 0px',
    debug = false,
  } = options;

  const onLoadMoreRef = useRef(onLoadMore);
  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    if (!sentinel) {
      if (debug) {
        console.log(
          '[useInfiniteScroll] No sentinel element yet, skipping observer'
        );
      }
      return;
    }

    if (debug) {
      console.log('[useInfiniteScroll] Observer attached to sentinel', {
        hasMore,
        loading,
        rootMargin,
      });
    }

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        const isIntersecting = !!entry?.isIntersecting;
        if (debug) {
          console.log('[useInfiniteScroll] Observer callback', {
            isIntersecting,
            hasMore,
            loading,
          });
        }

        if (!entry?.isIntersecting) return;
        if (!hasMore) {
          if (debug) {
            console.log('[useInfiniteScroll] Skipped: hasMore is false');
          }
          return;
        }
        if (loading) {
          if (debug) {
            console.log('[useInfiniteScroll] Skipped: already loading');
          }
          return;
        }
        if (debug) {
          console.log('[useInfiniteScroll] Calling onLoadMore()');
        }
        onLoadMoreRef.current?.();
      },
      {
        root: null,
        rootMargin,
        threshold: 0,
      }
    );

    observer.observe(sentinel);
    return () => {
      if (debug) {
        console.log('[useInfiniteScroll] Observer disconnected');
      }
      observer.disconnect();
    };
  }, [sentinel, hasMore, loading, rootMargin, debug]);
};
