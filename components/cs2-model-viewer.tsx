"use client";

import Script from "next/script";
import React, { useMemo, useState } from "react";

function slugifyWeapon(value: string) {
  return value
    .toLowerCase()
    .replace(/★/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function Cs2ModelViewer({ weapon, poster, alt }: { weapon: string; poster?: string; alt?: string }) {
  const [failed, setFailed] = useState(false);
  const slug = useMemo(() => slugifyWeapon(weapon || "weapon"), [weapon]);
  const src = `/models/cs2/${slug}.glb`;

  return (
    <div className="cs2-exact-model-shell">
      <Script src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js" type="module" strategy="afterInteractive" />
      {!failed ? React.createElement("model-viewer" as any, {
        src,
        poster,
        alt: alt || weapon,
        "camera-controls": true,
        "touch-action": "pan-y",
        "interaction-prompt": "none",
        "shadow-intensity": "1",
        "shadow-softness": "0.8",
        exposure: "1.05",
        environmentImage: "neutral",
        "auto-rotate": false,
        style: { width: "100%", height: "100%", background: "transparent" },
        onError: () => setFailed(true),
      }) : (
        poster ? <img className="cs2-model-fallback" src={poster} alt={alt || weapon} /> : <div className="cs2-model-missing">3D MODEL FILE REQUIRED</div>
      )}
      <span className="cs2-model-source-badge">{failed ? "2D FALLBACK" : "GLB / 3D"}</span>
    </div>
  );
}
