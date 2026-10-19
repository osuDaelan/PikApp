import React, { useEffect, useRef, useState } from "react";
import CalculatorSection from "./features/calculator/CalculatorSection.jsx";
import StatsEditor from "./features/calculator/StatsEditor.jsx";
import LevelBadge from "./features/calculator/LevelBadge.jsx";
import useCalculator from "./features/calculator/useCalculator.js";
import { MAX_KNOWN } from "./features/calculator/levelData.js";
import DecorSection from "./features/decor/DecorSection.jsx";
import useDecorCollection from "./features/decor/useDecorCollection.js";
import SetCompletionCelebration from "./features/decor/SetCompletionCelebration.jsx";
import AppHeader from "./shared/components/AppHeader.jsx";
import Navigation from "./shared/components/Navigation.jsx";
import useWindowWidth from "./shared/hooks/useWindowWidth.js";
import { appStyle, scrollPaneStyle } from "./shared/styles/theme.js";
import useWallpaper from "./features/wallpapers/useWallpaper.js";
import { wallpaperUrl } from "./features/wallpapers/catalog.js";

export default function App() {
  const winWidth = useWindowWidth();
  const isWide = winWidth >= 720; // threshold for switching to the side-by-side card layout
  const isSplit = winWidth >= 1100; // wide enough to show Now + Decor together, no tabs
  const containerMax = isSplit ? 1360 : 1200; // ceiling only — never forces width on a narrow screen

  // Defensively zero out any residual horizontal scroll on the split-view panes
  // (can otherwise get stuck mid-scroll when toggling in/out of split view).
  const nowPaneRef = useRef(null);
  const decorPaneRef = useRef(null);
  useEffect(() => {
    if (nowPaneRef.current) nowPaneRef.current.scrollLeft = 0;
    if (decorPaneRef.current) decorPaneRef.current.scrollLeft = 0;
  }, [isSplit]);

  const [tab, setTab] = useState("now");
  const wallpaper = useWallpaper();

  const calculator = useCalculator();
  const decor = useDecorCollection();
  const nowBody = <CalculatorSection calculator={calculator} />;
  const decorBody = <DecorSection decor={decor} isWide={isWide} isSplit={isSplit} />;

  return (
    <div className="pikapp-root" data-wallpaper-id={wallpaper.id} style={{ ...appStyle, background: "#203e30", height: isSplit ? "100vh" : "auto", overflow: isSplit ? "hidden" : "visible" }}>
      <img className="pikapp-wallpaper" src={wallpaperUrl(wallpaper, import.meta.env.BASE_URL)} alt="" style={{ objectFit: "cover", objectPosition: "center 50%" }} />
      <div className="pikapp-wallpaper-shade" aria-hidden="true" style={{ background: "rgba(0,0,0,0.18)" }} />
    <div style={{ maxWidth: containerMax, margin: "0 auto", display: "flex", flexDirection: "column", minHeight: "100vh", height: isSplit ? "100vh" : "auto", overflow: isSplit ? "hidden" : "visible", transition: "max-width 0.15s" }}>

      <AppHeader />
      <LevelBadge level={calculator.level} openEdit={calculator.openEdit} />

      {/* Content */}
      <div style={{
        flex: 1, minHeight: 0, padding: isSplit ? "12px 14px 12px" : "12px 14px 90px",
        display: isSplit ? "flex" : "block", flexDirection: "column", overflow: isSplit ? "hidden" : "visible",
      }}>

        <StatsEditor calculator={calculator} />

        {/* ── NOW + DECOR — side by side once the window is wide enough, tabbed otherwise ── */}
        {isSplit ? (
          <div style={{ display: "flex", gap: 20, flex: 1, minHeight: 0 }}>
            <div ref={nowPaneRef} style={scrollPaneStyle}>{nowBody}</div>
            <div ref={decorPaneRef} style={scrollPaneStyle}>{decorBody}</div>
          </div>
        ) : (
          <>
            {tab === "now" && nowBody}
            {tab === "decor" && decorBody}
          </>
        )}

        {/* Pikipedia footnote */}
        <div style={{ textAlign: "center", marginTop: 16, fontSize: 10, color: "#fff", textShadow: "0 1px 4px #000" }}>
          {isSplit
            ? `Data from pikminwiki.com/Level, Decor_Pikmin & Special_Decor_Pikmin · Lv ${MAX_KNOWN + 1}–130 not yet documented`
            : tab === "decor"
              ? "Data from pikminwiki.com/Decor_Pikmin & Special_Decor_Pikmin"
              : `Data from pikminwiki.com/Level · Lv ${MAX_KNOWN + 1}–130 not yet documented`}
        </div>
      </div>
      </div>

      {!isSplit && <Navigation tab={tab} setTab={setTab} isWide={isWide} containerMax={containerMax} />}
      <SetCompletionCelebration completion={decor.completion} onFinish={decor.dismissCompletion} />
    </div>
  );
}
