"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Loader } from "@/components/ui/Loader";

const LOADER_DURATION = 2000;

export function AppShell({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), LOADER_DURATION);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = ready ? "" : "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [ready]);

  return (
    <>
      <AnimatePresence>{!ready && <Loader key="loader" />}</AnimatePresence>
      {ready && children}
    </>
  );
}
