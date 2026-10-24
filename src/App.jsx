import React, { lazy, Suspense, useCallback, useRef, useState } from "react";
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
import { appStyle, cardStyle } from "./shared/styles/theme.js";
import useWallpaper from "./features/wallpapers/useWallpaper.js";
import { wallpaperUrl } from "./features/wallpapers/catalog.js";
import LocalCalculatorSave from "./shared/components/LocalCalculatorSave.jsx";
import useSectionNavigation from "./shared/hooks/useSectionNavigation.js";
import { calculatorSnapshot } from "./storage/calculatorBackupData.js";
import { createMapStore } from "./features/decor-map/mapStorage.js";
import { guestProgressStore } from "./storage/progressStore.js";

const DecorMapSection = lazy(() => import("./features/decor-map/DecorMapSection.jsx"));
const MushroomsSection = lazy(() => import("./features/mushrooms/MushroomsSection.jsx"));

export default function App() {
  const [importRevision, setImportRevision] = useState(0);
  // Imported values initialize all feature hooks together, without old effects
  // writing their previous state back over the imported save.
  return <AppSession key={importRevision} importComplete={importRevision > 0}
    onProgressImported={() => setImportRevision(value => value + 1)} />;
}

function AppSession({ importComplete, onProgressImported }) {
  const winWidth = useWindowWidth();
  const [tab, setTab] = useSectionNavigation();
  const [mushroomDraft, setMushroomDraft] = useState(null);
  const showsCalculator = tab === "calculator";
  const isWide = winWidth >= 720;
  const isDesktopMap = winWidth >= 1100 && tab === "map";
  const fillsViewport = isDesktopMap;
  const viewportHeight = isDesktopMap ? "100dvh" : "auto";
  const containerMax = tab === "map" ? undefined : 1200;

  const wallpaper = useWallpaper();

  const calculator = useCalculator();
  const decor = useDecorCollection();
  const mapProgress = useRef(null);
  const captureMapProgress = useCallback(readTransferState => { mapProgress.current = readTransferState; }, []);
  function getProgressSnapshot() {
    guestProgressStore.assertReadable();
    let map;
    if (mapProgress.current) map = mapProgress.current();
    else {
      const store = createMapStore();
      map = store.getTransferState(store.read().state);
    }
    return { calculator: calculatorSnapshot(calculator),
      decor: { collected: decor.decorCollected, showAll: decor.showAllDecor }, map };
  }
  function finishImport() {
    // A shared map URL must not override the viewport from the imported save.
    const url = new URL(window.location.href);
    for (const key of ["mapLat", "mapLng", "mapZoom", "lat", "lng", "zoom"]) url.searchParams.delete(key);
    try { window.history.replaceState({}, "", url.href); }
    catch { /* Import is already saved; a blocked history update must not prevent restoration. */ }
    onProgressImported();
  }

  return (
    <div className={`pikapp-root${isDesktopMap ? " pikapp-root--desktop-map" : ""}`} data-wallpaper-id={wallpaper.id} style={{ ...appStyle, background: "#203e30", height: viewportHeight, overflow: fillsViewport ? "hidden" : "visible" }}>
      <img className="pikapp-wallpaper" src={wallpaperUrl(wallpaper, import.meta.env.BASE_URL)} alt="" style={{ objectFit: "cover", objectPosition: "center 50%" }} />
      <div className="pikapp-wallpaper-shade" aria-hidden="true" style={{ background: "rgba(0,0,0,0.18)" }} />
    <div style={{ maxWidth: containerMax, margin: "0 auto", display: "flex", flexDirection: "column", minHeight: "100vh", height: viewportHeight, overflow: fillsViewport ? "hidden" : "visible", transition: "max-width 0.15s" }}>

      <AppHeader getProgressSnapshot={getProgressSnapshot} onProgressImported={finishImport} importComplete={importComplete} />
      {showsCalculator && <LevelBadge level={calculator.level} openEdit={calculator.openEdit} />}
      {import.meta.env.DEV && <div style={!showsCalculator ? { display: "none" } : undefined}><LocalCalculatorSave calculator={calculator} /></div>}

      {/* Content */}
      <div style={{
        flex: 1, minHeight: 0, padding: "12px 14px 90px",
        display: fillsViewport ? "flex" : "block", flexDirection: "column", overflow: fillsViewport ? "hidden" : "visible",
      }}>

        {showsCalculator && <StatsEditor calculator={calculator} />}

        {showsCalculator && <section aria-label="Level calculator"><CalculatorSection calculator={calculator} /></section>}
        {tab === "decor" && <DecorSection decor={decor} isWide={isWide} />}
        {tab === "mushrooms" && <Suspense fallback={<div role="status" style={{ ...cardStyle, padding: 25 }}>Loading mushroom rewards…</div>}>
          <MushroomsSection draft={mushroomDraft} setDraft={setMushroomDraft} />
        </Suspense>}
        {tab === "map" && <Suspense fallback={<div role="status" style={{ ...appStyle, minHeight: 250, borderRadius: 18, padding: 25 }}>Loading decor map…</div>}>
          <DecorMapSection decorCollected={decor.decorCollected} onProgressSnapshot={captureMapProgress} />
        </Suspense>}

        {/* Pikipedia footnote */}
        {(showsCalculator || tab === "decor") && <div style={{ textAlign: "center", marginTop: 16, fontSize: 10, color: "#fff", textShadow: "0 1px 4px #000" }}>
          {tab === "decor"
            ? "Data from pikminwiki.com/Decor_Pikmin & Special_Decor_Pikmin"
            : `Data from pikminwiki.com/Level · Lv ${MAX_KNOWN + 1}–130 not yet documented`}
        </div>}
      </div>
      </div>

      <Navigation tab={tab} setTab={setTab} isWide={isWide} containerMax={containerMax} />
      <SetCompletionCelebration completion={decor.completion} onFinish={decor.dismissCompletion} />
    </div>
  );
}
