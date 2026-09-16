"use client";

import { BUDGET_MIDPOINTS, SEASON_MONTHS } from "@/lib/quiz";
import { formatMoney } from "@/lib/demo-estimate";

/* -------------------------------------------------------------------------
   Правая половина подбора. Каждый вопрос получает свою картинку, и она
   меняется прямо во время ответа — это и есть весь смысл: человек видит,
   что его слова к чему-то приводят.
------------------------------------------------------------------------- */

const CROWD = 8;

function Person({ lit, index }: { lit: boolean; index: number }) {
  return (
    <svg
      viewBox="0 0 24 34"
      className="h-full w-auto transition-[opacity,transform] duration-500 ease-out"
      style={{
        opacity: lit ? 1 : 0.13,
        transform: lit ? "scale(1)" : "scale(0.78)",
        transitionDelay: `${index * 45}ms`,
        color: lit ? "#7de2df" : "#f9fafb",
      }}
      aria-hidden
    >
      <circle cx="12" cy="7" r="5.6" fill="currentColor" />
      <path
        d="M1.6 33.4c0-6.2 4.7-11.2 10.4-11.2s10.4 5 10.4 11.2z"
        fill="currentColor"
        opacity="0.85"
      />
    </svg>
  );
}

/** Толпа-прототип: сначала стоят все, потом остаются только те, кто едет. */
export function TravellersStage({ count }: { count: number | null }) {
  const lit = count ?? CROWD;

  return (
    <div className="flex size-full flex-col items-center justify-center gap-8 px-4">
      <div className="grid h-[112px] grid-cols-4 items-end justify-items-center gap-x-5 gap-y-6 sm:h-[150px]">
        {Array.from({ length: CROWD }, (_, i) => (
          <Person key={i} index={i} lit={count === null ? i < CROWD : i < lit} />
        ))}
      </div>

      <span className="tnum font-display text-[clamp(30px,5vw,54px)] font-extrabold leading-none tracking-[-0.04em] text-paper">
        {count === null ? "— " : count}
        <span className="ml-2 align-middle font-sans text-[15px] font-semibold text-paper/50">
          {count === null ? "человек" : count === 5 ? "и больше" : "в поездке"}
        </span>
      </span>
    </div>
  );
}

const BUDGET_STEPS = ["to-100", "100-200", "200-400", "from-400"] as const;
const BUDGET_HEIGHTS = [0.3, 0.52, 0.76, 1];
const BUDGET_SHORT: Record<string, string> = {
  "to-100": "до 100",
  "100-200": "100–200",
  "200-400": "200–400",
  "from-400": "400+",
};

/** Столбики бюджета: выбранный горит, остальные остаются контуром. */
export function BudgetStage({ budget, travellers }: { budget: string | null; travellers: number | null }) {
  const chosenIndex = budget ? BUDGET_STEPS.indexOf(budget as (typeof BUDGET_STEPS)[number]) : -1;
  const total = budget ? BUDGET_MIDPOINTS[budget] : undefined;
  // Деление бюджета на число людей — арифметика над ответами самого человека,
  // а не цена, которую мы откуда-то взяли.
  const perPerson = total && travellers ? total / travellers : undefined;

  return (
    <div className="flex size-full flex-col items-center justify-center gap-9 px-4">
      <div className="flex h-[150px] items-end gap-3 sm:h-[190px] sm:gap-4">
        {BUDGET_STEPS.map((step, i) => {
          const active = i === chosenIndex;
          const below = chosenIndex >= 0 && i < chosenIndex;
          return (
            <div key={step} className="flex w-[52px] flex-col items-center gap-3 sm:w-[64px]">
              <div
                className="w-full rounded-[10px] border transition-[height,background-color,border-color] duration-500 ease-out"
                style={{
                  height: `${BUDGET_HEIGHTS[i]! * (active ? 100 : 82)}%`,
                  background: active ? "#7de2df" : below ? "rgba(125,226,223,.22)" : "transparent",
                  borderColor: active ? "#7de2df" : "rgba(125,226,223,.3)",
                }}
              />
              <span
                className="font-mono text-[10px] uppercase tracking-[0.06em] transition-colors"
                style={{ color: active ? "#7de2df" : "rgba(249,250,251,.4)" }}
              >
                {BUDGET_SHORT[step]}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <span className="tnum font-display text-[clamp(26px,4.4vw,44px)] font-extrabold leading-none tracking-[-0.04em] text-paper">
          {total ? formatMoney(total) : "—"}
        </span>
        <span className="text-[13px] text-paper/50">
          {perPerson
            ? `примерно ${formatMoney(perPerson)} на человека`
            : "ориентир на всю поездку"}
        </span>
      </div>
    </div>
  );
}

const SEASON_LABELS: Record<string, string> = {
  winter: "Зима",
  spring: "Весна",
  summer: "Лето",
  autumn: "Осень",
};

/**
 * Кольцо из двенадцати месяцев: выбранный сезон подъезжает к метке наверху.
 *
 * Внутри кольца только точки, без букв. Буквы пришлось бы вращать обратно,
 * чтобы они не переворачивались, и во время поворота они крутились бы сами
 * по себе — название сезона спокойнее держать в центре, где оно неподвижно.
 */
export function SeasonStage({ season }: { season: string | null }) {
  const months = season ? SEASON_MONTHS[season]! : [];
  // Середину сезона ставим на двенадцать часов. У зимы это январь, поэтому
  // берём именно средний месяц списка, а не первый.
  const centre = months.length ? months[1]! : 1;
  const ringRotation = season ? -(centre - 1) * 30 : 0;

  return (
    <div className="flex size-full items-center justify-center">
      <div className="relative aspect-square w-[76%] max-w-[300px]">
        <svg viewBox="-130 -130 260 260" className="size-full" aria-hidden>
          <circle r="100" fill="none" stroke="rgba(125,226,223,.16)" strokeWidth="1" />
          <g
            className="transition-transform duration-[900ms]"
            style={{ transitionTimingFunction: "cubic-bezier(.16,1,.3,1)", transform: `rotate(${ringRotation}deg)` }}
          >
            {Array.from({ length: 12 }, (_, i) => {
              const angle = (i * 30 - 90) * (Math.PI / 180);
              const inSeason = months.includes(i + 1);
              return (
                <circle
                  key={i}
                  cx={Math.cos(angle) * 100}
                  cy={Math.sin(angle) * 100}
                  r={inSeason ? 11 : 3.5}
                  fill={inSeason ? "#7de2df" : "rgba(249,250,251,.3)"}
                  className="transition-all duration-500"
                />
              );
            })}
          </g>
          {/* Метка «двенадцать часов» — к ней и подъезжает сезон. */}
          <path d="M0 -116 L6.5 -127 L-6.5 -127 Z" fill="#7de2df" />
          <text
            x="0"
            y="0"
            dy="12"
            textAnchor="middle"
            fontSize="34"
            fontWeight="800"
            letterSpacing="-1"
            fill="#f9fafb"
          >
            {season ? SEASON_LABELS[season] : "Когда?"}
          </text>
        </svg>
      </div>
    </div>
  );
}

const PRIORITY_TILES = [
  { value: "beach", label: "Пляж", glyph: "M2 17h20M4 13a8 8 0 0 1 16 0M12 5v0" },
  { value: "sights", label: "Экскурсии", glyph: "M4 20V9l8-5 8 5v11M9 20v-6h6v6" },
  { value: "food", label: "Еда", glyph: "M8 3v8a4 4 0 0 0 8 0V3M12 15v6" },
  { value: "price", label: "Цена", glyph: "M7 4h5a4 4 0 0 1 0 8H7m0 0v8m0-8h8" },
] as const;

/** Четыре плитки: выбранная выходит вперёд, остальные уходят на фон. */
export function PriorityStage({ priority }: { priority: string | null }) {
  return (
    <div className="flex size-full items-center justify-center p-6">
      <div className="grid w-full max-w-[320px] grid-cols-2 gap-3.5">
        {PRIORITY_TILES.map((tile) => {
          const active = tile.value === priority;
          return (
            <div
              key={tile.value}
              className="flex aspect-[5/4] flex-col items-center justify-center gap-3 rounded-card border transition-[transform,background-color,border-color,opacity] duration-500 ease-out"
              style={{
                background: active ? "#7de2df" : "rgba(249,250,251,.05)",
                borderColor: active ? "#7de2df" : "rgba(249,250,251,.12)",
                color: active ? "#1a1d2e" : "#f9fafb",
                opacity: priority && !active ? 0.4 : 1,
                transform: active ? "scale(1.06)" : "scale(1)",
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d={tile.glyph}
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-[13.5px] font-bold">{tile.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
