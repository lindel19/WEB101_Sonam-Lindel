"use client";

import { useEffect, useRef } from "react";

export default function useIntersectionObserver(callback) {
  const targetRef = useRef(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          callback();
        }
      },
      {
        threshold: 1,
      }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [callback]);

  return targetRef;
}
