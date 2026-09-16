import type { CostComponent } from "@platform/core";
import { COMPONENT_LABELS, SEGMENT_COLORS, formatMoney } from "@/lib/demo-estimate";

export interface ScenePart {
  component: CostComponent;
  amountMinor: number;
  share: number;
}

/**
 * Раскладки стеклянных плашек. Положение в процентах от сцены, наклон,
 * размер и параметры парения.
 *
 * `cluster` — плашки занимают всю сцену.
 * `edges` — плашки уходят к краям и оставляют середину пустой: так они
 * работают фоном под чеком, а не спорят с ним за внимание.
 */
const LAYOUTS = {
  cluster: [
    { top: "6%", left: "34%", size: 150, rot: "-9deg", dur: "7.5s", delay: "0s", amp: "-16px" },
    { top: "30%", left: "2%", size: 122, rot: "8deg", dur: "8.5s", delay: "-1.4s", amp: "-11px" },
    { top: "48%", left: "40%", size: 132, rot: "-5deg", dur: "9s", delay: "-2.6s", amp: "-14px" },
    { top: "2%", left: "70%", size: 104, rot: "13deg", dur: "7.8s", delay: "-3.4s", amp: "-9px" },
    { top: "62%", left: "4%", size: 96, rot: "-14deg", dur: "8.2s", delay: "-0.8s", amp: "-12px" },
    { top: "34%", left: "74%", size: 112, rot: "6deg", dur: "9.4s", delay: "-4.2s", amp: "-15px" },
    { top: "76%", left: "62%", size: 88, rot: "-11deg", dur: "7.2s", delay: "-2s", amp: "-10px" },
  ],
  edges: [
    { top: "12%", left: "-1%", size: 132, rot: "-11deg", dur: "8.5s", delay: "0s", amp: "-15px" },
    { top: "58%", left: "3%", size: 108, rot: "9deg", dur: "9.2s", delay: "-2.1s", amp: "-11px" },
    { top: "8%", left: "84%", size: 116, rot: "12deg", dur: "7.9s", delay: "-3.6s", amp: "-13px" },
    { top: "54%", left: "88%", size: 138, rot: "-7deg", dur: "9.6s", delay: "-1.2s", amp: "-16px" },
    { top: "82%", left: "76%", size: 88, rot: "14deg", dur: "8.1s", delay: "-4.4s", amp: "-9px" },
  ],
} as const;

export type SceneVariant = keyof typeof LAYOUTS;

/**
 * Сцена из объёмных плашек. Это не украшение: каждая плашка — компонент
 * поездки со своей суммой, и она меняется вместе с расчётом.
 */
export function GlassScene({
  parts,
  variant = "cluster",
  className = "relative h-[320px] w-full sm:h-[400px] lg:h-[460px]",
}: {
  parts: ScenePart[];
  variant?: SceneVariant;
  className?: string;
}) {
  const layout = LAYOUTS[variant];

  return (
    <div
      aria-hidden
      // overflow-hidden: плашки выходят за правый край на узких экранах, и без
      // этого страница получает горизонтальную прокрутку
      className={`pointer-events-none select-none overflow-hidden ${className}`}
      style={{ perspective: "1400px" }}
    >
      {/* Световые пятна под стеклом */}
      <span className="glow left-[10%] top-[14%] size-56 bg-laguna/40" />
      <span className="glow left-[52%] top-[42%] size-64 bg-cold/25" />
      <span className="glow left-[30%] top-[70%] size-48 bg-laguna-active/45" />

      {parts.slice(0, layout.length).map((part, i) => {
        const spot = layout[i]!;
        const color = SEGMENT_COLORS[part.component];
        const compact = spot.size < 110;

        return (
          <div
            key={part.component}
            className="absolute"
            style={{
              top: spot.top,
              left: spot.left,
              width: spot.size,
              height: spot.size,
              transform: `rotate(${spot.rot})`,
              transformStyle: "preserve-3d",
            }}
          >
            <div
              className="floaty size-full"
              style={
                {
                  "--dur": spot.dur,
                  "--delay": spot.delay,
                  "--amp": spot.amp,
                } as React.CSSProperties
              }
            >
              <div className="glass flex size-full flex-col justify-between rounded-[26px] p-3.5">
                {/* Цветное ядро — плашка внутри плашки, как в референсе */}
                <span
                  className="glass-core block rounded-[10px]"
                  style={{
                    width: compact ? 22 : 30,
                    height: compact ? 22 : 30,
                    background: `linear-gradient(140deg, ${color.bg}, ${color.bg}99)`,
                  }}
                />

                <span className="flex flex-col gap-0.5">
                  <span
                    className="block font-mono text-[8.5px] uppercase leading-tight tracking-[0.1em] text-paper/55"
                    style={{ fontSize: compact ? "8px" : "9px" }}
                  >
                    {COMPONENT_LABELS[part.component]}
                  </span>
                  <span
                    className="tnum block font-display font-bold leading-none tracking-[-0.02em] text-paper"
                    style={{ fontSize: compact ? 13 : 16 }}
                  >
                    {formatMoney(part.amountMinor)}
                  </span>
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
