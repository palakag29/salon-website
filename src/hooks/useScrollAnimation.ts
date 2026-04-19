import { useCallback, useRef } from "react";

export const useScrollAnimation = () => {
  const cleanupRef = useRef<(() => void) | null>(null);

  const ref = useCallback((node: HTMLDivElement | null) => {
    // Clean up previous
    cleanupRef.current?.();
    cleanupRef.current = null;

    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -20px 0px" }
    );

    const observeChildren = () => {
      const children = node.querySelectorAll(".animate-on-scroll:not(.visible)");
      children.forEach((child) => observer.observe(child));
    };

    observeChildren();

    const mutationObserver = new MutationObserver(() => {
      observeChildren();
    });
    mutationObserver.observe(node, { childList: true, subtree: true });

    cleanupRef.current = () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return ref;
};
