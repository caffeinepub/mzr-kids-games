// ============================================================
// AD CONFIGURATION - MZR Kids Games
// ============================================================
// AdMob App ID:            ca-app-pub-9330624457981835~5994839615
// Banner Ad Unit ID:       ca-app-pub-9330624457981835/7791137015
// Interstitial Ad Unit ID: ca-app-pub-9330624457981835/4033558123
//
// NOTE: AdMob works in native Android/iOS apps only.
// For this web app, replace the placeholder below with Google AdSense:
//
// <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXX" crossorigin="anonymous"></script>
// <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-XXXXXXXX"
//      data-ad-slot="7791137015" data-ad-format="auto" data-full-width-responsive="true"></ins>
// <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
// ============================================================

export function AdBanner() {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "60px",
        backgroundColor: "#f8f9fa",
        borderTop: "1px solid #e0e0e0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        boxShadow: "0 -2px 8px rgba(0,0,0,0.08)",
      }}
    >
      {/* INSERT_ADSENSE_CODE_HERE — replace this entire div with your AdSense ins tag */}
      <span
        style={{
          fontSize: "9px",
          color: "#aaa",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          lineHeight: 1,
        }}
      >
        Advertisement
      </span>
      <span style={{ fontSize: "12px", color: "#999", marginTop: "2px" }}>
        Banner Ad — ca-app-pub-9330624457981835/7791137015
      </span>
    </div>
  );
}
