import { useEffect, useState } from "react";

const KEY = "cinematype:onboarded-v1";

export function Onboarding(props: {
  onGoTranscript: () => void;
  onGoPlugins: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  if (!open) return null;

  const finish = (remember: boolean) => {
    if (remember) {
      try {
        localStorage.setItem(KEY, "1");
      } catch {
        /* ignore */
      }
    }
    setOpen(false);
  };

  const steps = [
    {
      title: "Captions in 60 seconds",
      body: "cinematype turns a script into CapCut / YouTube-ready captions and title cards — no timeline PhD required.",
      cta: "Show me how",
      action: () => setStep(1),
    },
    {
      title: "1 · Paste your words",
      body: "Open Transcript, paste your voiceover (or Whisper JSON). We auto-time the cues — you can drag times after.",
      cta: "Paste transcript",
      action: () => {
        props.onGoTranscript();
        setStep(2);
      },
    },
    {
      title: "2 · Download a pack",
      body: "Plugins → CapCut or YouTube → Download pack. Drop the SRT into your editor. Done.",
      cta: "Open plugins",
      action: () => {
        props.onGoPlugins();
        finish(true);
      },
    },
  ];

  const current = steps[step] ?? steps[0]!;

  return (
    <div className="onboard-backdrop" role="dialog" aria-modal="true">
      <div className="onboard-card">
        <p className="onboard-kicker">Welcome · {step + 1}/{steps.length}</p>
        <h2>{current.title}</h2>
        <p className="onboard-body">{current.body}</p>
        <div className="onboard-curl">
          <code>
            curl -fsSL https://raw.githubusercontent.com/Himan-D/cinematype/main/scripts/get-cinematype.sh
            | bash
          </code>
        </div>
        <div className="actions">
          <button type="button" className="btn btn-primary" onClick={current.action}>
            {current.cta}
          </button>
          <button type="button" className="btn" onClick={() => finish(true)}>
            Skip — I know this
          </button>
        </div>
      </div>
    </div>
  );
}
