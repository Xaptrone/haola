"use client";

import { useEffect, useState } from "react";

export function useDesktop(query = "(min-width: 1024px)") {
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setDesktop(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return desktop;
}
