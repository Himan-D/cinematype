import { useEffect, useState } from "react";

const KEY = "cinematype:onboarded-v2";

export function Onboarding(props: {
  onGoStudio: () => void;
  onGoStyle: () => void;
  onGoDestinations: () => void;
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
      title: "Make captions look like your brand",
      body: "Pick a template, preview on video, save your brand kit, then export to CapCut, YouTube, Premiere, and more — without learning SRT.",
      cta: "Show me how",
      action: () => setStep(1),
    },
    {
      title: "1 · Style on the preview",
      body: "Studio opens with a live video preview. Choose a template and paste your transcript — captions appear on the video.",
      cta: "Open studio",
      action: () => {
        props.onGoStudio();
        setStep(2);
      },
    },
    {
      title: "2 · Apply your brand",
      body: "Style / Brand → fonts, colors, caption look. Save a kit you can reuse on every video.",
      cta: "Open brand",
      action: () => {
        props.onGoStyle();
        setStep(3);
      },
    },
    {
      title: "3 · Export a destination",
      body: "Destinations → CapCut or YouTube → Download pack. Drop the files into your editor. Save a .ct project to reopen later.",
      cta: "Open destinations",
      action: () => {
        props.onGoDestinations();
        finish(true);
      },
    },
  ];

  const current = steps[step] ?? steps[0]!;

  return (
    <div className="onboard-backdrop" role="dialog" aria-modal="true">
      <div className="onboard-card">
        <p className="onboard-kicker">
          Welcome · {step + 1}/{steps.length}
        </p>
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
