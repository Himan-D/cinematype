import {
  DEFAULT_CAPTION_STYLE,
  fontStack,
  listBrandKits,
  setActiveBrandKit,
  upsertBrandKit,
  type CaptionAnimation,
  type CaptionStyle,
} from "../../src/index";
import { ANIMATIONS } from "../constants";
import type { StudioState } from "../use-studio";

export function StyleTab({ s }: { s: StudioState }) {
  const { brand } = s;
  return (
    <>
      <h3 style={{ marginTop: "1rem" }}>Brand kits</h3>
      <div className="chip-row">
        {s.kits.map((k) => (
          <button
            key={k.id}
            type="button"
            className="chip"
            data-active={k.id === brand.id}
            onClick={() => {
              const next = setActiveBrandKit(k.id!);
              s.setBrand(next);
            }}
          >
            {k.name ?? k.channelName}
          </button>
        ))}
        <button
          type="button"
          className="chip"
          onClick={() => {
            const next = upsertBrandKit({
              ...brand,
              id: undefined,
              name: `${brand.channelName} copy`,
              channelName: brand.channelName,
            });
            s.setBrand(next);
            s.setKits(listBrandKits());
          }}
        >
          + Duplicate kit
        </button>
      </div>

      <label className="field">Kit name</label>
      <input
        value={brand.name ?? ""}
        onChange={(e) => s.setBrand({ ...brand, name: e.target.value })}
      />
      <label className="field">Channel</label>
      <input
        value={brand.channelName}
        onChange={(e) => s.setBrand({ ...brand, channelName: e.target.value })}
      />
      <label className="field">Tagline</label>
      <input
        value={brand.tagline ?? ""}
        onChange={(e) => s.setBrand({ ...brand, tagline: e.target.value })}
      />
      <label className="field">Lower-third title</label>
      <input
        value={brand.lowerThirdTitle ?? ""}
        onChange={(e) => s.setBrand({ ...brand, lowerThirdTitle: e.target.value })}
      />
      <label className="field">Lower-third subtitle</label>
      <input
        value={brand.lowerThirdSubtitle ?? ""}
        onChange={(e) =>
          s.setBrand({ ...brand, lowerThirdSubtitle: e.target.value })
        }
      />

      <div className="color-row">
        <label className="field">
          Primary
          <input
            type="color"
            value={brand.primaryColor}
            onChange={(e) => {
              const primaryColor = e.target.value;
              s.setBrand({
                ...brand,
                primaryColor,
                caption: {
                  ...(brand.caption ?? DEFAULT_CAPTION_STYLE),
                  highlightColor: primaryColor,
                },
              });
            }}
          />
        </label>
        <label className="field">
          Text
          <input
            type="color"
            value={brand.secondaryColor}
            onChange={(e) => {
              const secondaryColor = e.target.value;
              s.setBrand({
                ...brand,
                secondaryColor,
                caption: {
                  ...(brand.caption ?? DEFAULT_CAPTION_STYLE),
                  color: secondaryColor,
                },
              });
            }}
          />
        </label>
        <label className="field">
          Background
          <input
            type="color"
            value={brand.backgroundColor}
            onChange={(e) =>
              s.setBrand({ ...brand, backgroundColor: e.target.value })
            }
          />
        </label>
      </div>

      <label className="field">Heading font</label>
      <select
        value={brand.fonts?.heading ?? brand.fontDisplay}
        onChange={(e) => s.patchFonts("heading", e.target.value)}
      >
        {s.fonts.map((f) => (
          <option key={f.id} value={f.id}>
            {f.family}
          </option>
        ))}
      </select>
      <label className="field">Body font</label>
      <select
        value={brand.fonts?.body ?? brand.fontBody}
        onChange={(e) => s.patchFonts("body", e.target.value)}
      >
        {s.fonts.map((f) => (
          <option key={f.id} value={f.id}>
            {f.family}
          </option>
        ))}
      </select>
      <label className="field">Caption font</label>
      <select
        value={brand.fonts?.caption ?? brand.fontCaption ?? brand.fontBody}
        onChange={(e) => s.patchFonts("caption", e.target.value)}
      >
        {s.fonts.map((f) => (
          <option key={f.id} value={f.id}>
            {f.family}
          </option>
        ))}
      </select>

      <h3 style={{ marginTop: "1rem" }}>Caption style</h3>
      <label className="field">Size (1080p px)</label>
      <input
        type="number"
        value={s.captionStyle.fontSize}
        onChange={(e) => s.patchCaption({ fontSize: Number(e.target.value) })}
      />
      <label className="field">Position</label>
      <select
        value={s.captionStyle.position}
        onChange={(e) =>
          s.patchCaption({
            position: e.target.value as CaptionStyle["position"],
          })
        }
      >
        <option value="top">top</option>
        <option value="center">center</option>
        <option value="bottom">bottom</option>
      </select>
      <label className="field">Animation</label>
      <select
        value={s.captionStyle.animation}
        onChange={(e) =>
          s.patchCaption({ animation: e.target.value as CaptionAnimation })
        }
      >
        {ANIMATIONS.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>

      <div className="actions" style={{ marginTop: "0.75rem" }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            const saved = upsertBrandKit(brand);
            s.setBrand(saved);
            s.setKits(listBrandKits());
          }}
        >
          Save brand kit
        </button>
      </div>
    </>
  );
}
