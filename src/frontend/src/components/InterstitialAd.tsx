// ============================================================
// AD CONFIGURATION - MZR Kids Games
// ============================================================
// AdMob App ID:            ca-app-pub-9330624457981835~5994839615
// Banner Ad Unit ID:       ca-app-pub-9330624457981835/7791137015
// Interstitial Ad Unit ID: ca-app-pub-9330624457981835/4033558123
//
// NOTE: AdMob interstitials work in native Android/iOS apps only.
// For web, replace the placeholder box with a full-page AdSense unit.
// ============================================================

import { useEffect, useState } from "react";

interface InterstitialAdProps {
  onClose: () => void;
}

export function InterstitialAd({ onClose }: InterstitialAdProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  return (
    <div
      data-ocid="interstitial.modal"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "20px",
          maxWidth: "360px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        <span
          style={{
            fontSize: "10px",
            color: "#999",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            alignSelf: "flex-start",
          }}
        >
          Advertisement
        </span>

        {/* INSERT_ADSENSE_FULL_PAGE_CODE_HERE — replace the box below */}
        <div
          style={{
            width: "320px",
            height: "250px",
            backgroundColor: "#f0f0f0",
            border: "2px dashed #ccc",
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            color: "#999",
            textAlign: "center",
            padding: "12px",
          }}
        >
          <span style={{ fontSize: "32px" }}>📢</span>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#888" }}>
            Interstitial Ad
          </span>
          <span
            style={{ fontSize: "11px", color: "#aaa", wordBreak: "break-all" }}
          >
            ca-app-pub-9330624457981835/4033558123
          </span>
        </div>

        <button
          type="button"
          data-ocid="interstitial.close_button"
          onClick={countdown <= 0 ? onClose : undefined}
          style={{
            padding: "10px 28px",
            borderRadius: "24px",
            border: "none",
            fontWeight: 700,
            fontSize: "15px",
            cursor: countdown <= 0 ? "pointer" : "not-allowed",
            backgroundColor: countdown <= 0 ? "#22c55e" : "#d1d5db",
            color: countdown <= 0 ? "#ffffff" : "#6b7280",
            transition: "background-color 0.3s, color 0.3s",
            minWidth: "140px",
          }}
          aria-label={
            countdown > 0 ? `Close in ${countdown} seconds` : "Close ad"
          }
        >
          {countdown > 0 ? `Close in ${countdown}s` : "✕ Close"}
        </button>
      </div>
    </div>
  );
}
