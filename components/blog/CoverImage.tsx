"use client";

import { useState } from "react";

/**
 * Renders a remote cover photo over the branded graphic base. Any URL works
 * (no next/image domain config needed). If the link fails to load, the image
 * removes itself so the graphic underneath shows through.
 */
export function CoverImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/25" />
    </>
  );
}
