import { createRoot } from "react-dom/client";
import { Onboarding } from "./Onboarding";
import { TABS } from "./constants";
import { ProjectPanel, CueTimeline } from "./panels";
import { StudioTab } from "./tabs/StudioTab";
import { StyleTab } from "./tabs/StyleTab";
import { DestinationsTab } from "./tabs/DestinationsTab";
import { MoreTab } from "./tabs/MoreTab";
import { useStudio } from "./use-studio";

const CURL_CMD =
  "curl -fsSL https://raw.githubusercontent.com/Himan-D/cinematype/main/scripts/get-cinematype.sh | bash";

function App() {
  const s = useStudio();
  const showPreview =
    s.tab === "studio" || s.tab === "style" || s.tab === "destinations";

  return (
    <>
      <Onboarding
        onGoStudio={() => s.setTab("studio")}
        onGoStyle={() => s.setTab("style")}
        onGoDestinations={() => s.setTab("destinations")}
      />

      <div className="curl-banner">
        <code>{CURL_CMD}</code>
        <button
          type="button"
          className="btn"
          onClick={() => void navigator.clipboard.writeText(CURL_CMD).catch(() => {})}
        >
          Copy install
        </button>
      </div>

      <header className="top">
        <div>
          <h1 className="brand">CINEMATYPE</h1>
          <p className="tag">
            Create your caption style once. Export it everywhere.
          </p>
        </div>
        <nav className="tabs" aria-label="Studio sections">
          {TABS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              data-active={s.tab === id}
              onClick={() => s.setTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <div className="layout">
        <ProjectPanel s={s} />

        <main className="panel">
          {showPreview && (
            <>
              <h3>Preview · {s.template.label}</h3>
              <div className="video-shell" data-aspect={s.aspect} ref={s.wrapRef}>
                <video
                  ref={s.videoRef}
                  key={s.videoSrc}
                  src={s.videoSrc}
                  muted
                  autoPlay
                  loop
                  playsInline
                  controls
                />
                {s.showSafe && (
                  <div
                    className="safe-guide"
                    style={{
                      top: `${s.safe.top * 100}%`,
                      right: `${s.safe.right * 100}%`,
                      bottom: `${s.safe.bottom * 100}%`,
                      left: `${s.safe.left * 100}%`,
                    }}
                  />
                )}
              </div>
            </>
          )}

          {s.tab === "studio" && <StudioTab s={s} />}
          {s.tab === "style" && <StyleTab s={s} />}
          {s.tab === "destinations" && <DestinationsTab s={s} />}
          {s.tab === "more" && <MoreTab s={s} />}

          <p className="status">
            {s.ready ? "Fonts ready" : "Loading fonts…"} · {s.brandedCues.length} cues ·{" "}
            {s.brand.name ?? s.brand.channelName}
          </p>
        </main>

        <CueTimeline s={s} />
      </div>
    </>
  );
}

const root = document.getElementById("root");
if (root) createRoot(root).render(<App />);
