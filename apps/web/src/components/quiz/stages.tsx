"use client";

import { BUDGET_MIDPOINTS, SEASON_MONTHS } from "@/lib/quiz";
import { formatMoney } from "@/lib/demo-estimate";

/* -------------------------------------------------------------------------
   Правая половина подбора. Каждый вопрос получает свою картинку, и она
   меняется прямо во время ответа — это и есть весь смысл: человек видит,
   что его слова к чему-то приводят.
------------------------------------------------------------------------- */

/* ============================== ЛЮДИ ============================== */

/**
 * Восемь мест в толпе, от центра к краям. Дальние — выше и мельче: этим
 * и создаётся глубина, никакого 3D-движка для восьми фигур не нужно.
 */
const CROWD_SLOTS = [
  { left: 44, top: 40, scale: 1 },
  { left: 60, top: 38, scale: 0.94 },
  { left: 28, top: 38, scale: 0.94 },
  { left: 73, top: 31, scale: 0.83 },
  { left: 15, top: 31, scale: 0.83 },
  { left: 84, top: 24, scale: 0.71 },
  { left: 4, top: 24, scale: 0.71 },
  { left: 50, top: 19, scale: 0.65 },
] as const;

function Person({ lit, index, scale }: { lit: boolean; index: number; scale: number }) {
  return (
    <svg
      viewBox="0 0 52 76"
      width={52 * scale}
      height={76 * scale}
      className="transition-[opacity,filter] duration-500 ease-out"
      style={{
        opacity: lit ? 1 : 0.12,
        filter: lit ? "none" : "grayscale(1)",
        transitionDelay: `${index * 55}ms`,
      }}
      aria-hidden
    >
      {/* Тень на земле — она и сажает фигуру на плоскость. */}
      <ellipse cx="26" cy="72" rx="17" ry="4.4" fill="url(#quiz-person-shadow)" />
      <path
        d="M6 70c0-12.6 9-22.4 20-22.4S46 57.4 46 70z"
        fill={lit ? "url(#quiz-person-body)" : "#f9fafb"}
      />
      {/* Блик по левому краю корпуса — он и даёт объём. */}
      <path
        d="M6 70c0-10.6 6.4-19.2 15-21.6-4.2 4.8-6.6 12.2-6.6 21.6z"
        fill="#ffffff"
        opacity={lit ? 0.32 : 0}
      />
      <circle cx="26" cy="32" r="12.6" fill={lit ? "url(#quiz-person-head)" : "#f9fafb"} />
      <circle cx="21.4" cy="27.2" r="4.4" fill="#ffffff" opacity={lit ? 0.4 : 0} />
    </svg>
  );
}

/** Толпа-прототип: сначала стоят все, потом остаются только те, кто едет. */
export function TravellersStage({ count }: { count: number | null }) {
  return (
    <div className="flex size-full flex-col items-center justify-between gap-4 py-2">
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <linearGradient id="quiz-person-body" x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0%" stopColor="#b0edeb" />
            <stop offset="55%" stopColor="#35acbe" />
            <stop offset="100%" stopColor="#12414a" />
          </linearGradient>
          <radialGradient id="quiz-person-head" cx="0.34" cy="0.3" r="0.85">
            <stop offset="0%" stopColor="#eafbfa" />
            <stop offset="55%" stopColor="#7de2df" />
            <stop offset="100%" stopColor="#1f6874" />
          </radialGradient>
          <radialGradient id="quiz-person-shadow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="rgba(0,0,0,.55)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>
      </svg>

      <div className="relative w-full flex-1">
        {CROWD_SLOTS.map((slot, i) => (
          <span
            key={i}
            className="absolute -translate-x-1/2"
            style={{
              left: `${slot.left}%`,
              top: `${slot.top}%`,
              // Ближние фигуры перекрывают дальних.
              zIndex: Math.round(slot.scale * 100),
            }}
          >
            <Person index={i} scale={slot.scale} lit={count === null || i < count} />
          </span>
        ))}
      </div>

      <span className="tnum font-display text-[clamp(26px,4.4vw,46px)] font-extrabold leading-none tracking-[-0.04em] text-paper">
        {count === null ? "—" : count}
        <span className="ml-2.5 align-middle font-sans text-[14px] font-semibold text-paper/60">
          {count === null ? "человек" : count === 5 ? "и больше" : "в поездке"}
        </span>
      </span>
    </div>
  );
}

/* ============================= БЮДЖЕТ ============================= */

/** Сколько плашек в стопке на каждой ступени бюджета. */
const BUDGET_CHIPS: Record<string, number> = {
  "to-100": 4,
  "100-200": 7,
  "200-400": 10,
  "from-400": 14,
};
const MAX_CHIPS = 14;
const CHIP_GAP = 13;

/**
 * Бюджет — стопка объёмных плашек. Смотрим на неё сбоку: наклон задаёт
 * родитель, а каждая плашка поднимается над предыдущей по оси Z. Стопка
 * буквально растёт и оседает при смене ответа.
 */
export function BudgetStage({
  budget,
  travellers,
}: {
  budget: string | null;
  travellers: number | null;
}) {
  const chips = budget ? BUDGET_CHIPS[budget]! : 3;
  const total = budget ? BUDGET_MIDPOINTS[budget] : undefined;
  // Деление бюджета на число людей — арифметика над ответами самого человека,
  // а не цена, которую мы откуда-то взяли.
  const perPerson = total && travellers ? total / travellers : undefined;

  return (
    <div className="flex size-full flex-col items-center justify-between gap-2 py-1">
      <div className="flex w-full flex-1 items-center justify-center" style={{ perspective: 900 }}>
        <div
          className="relative h-[150px] w-[190px] sm:h-[170px] sm:w-[216px]"
          style={{ transform: "rotateX(62deg)", transformStyle: "preserve-3d" }}
        >
          {Array.from({ length: MAX_CHIPS }, (_, i) => {
            const shown = i < chips;
            const t = i / (MAX_CHIPS - 1);
            return (
              <div
                key={i}
                className="absolute inset-0 rounded-[24px] border transition-[transform,opacity] duration-500 ease-out"
                style={{
                  transform: `translateZ(${shown ? i * CHIP_GAP : 0}px)`,
                  opacity: shown ? 1 : 0,
                  transitionDelay: `${i * 34}ms`,
                  background: `linear-gradient(145deg,
                    rgba(125,226,223,${0.3 + t * 0.6}),
                    rgba(31,104,116,${0.55 + t * 0.35}))`,
                  borderColor: `rgba(234,251,250,${0.2 + t * 0.4})`,
                  boxShadow: "0 10px 22px -10px rgba(0,0,0,.65)",
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <span className="tnum font-display text-[clamp(24px,4vw,40px)] font-extrabold leading-none tracking-[-0.04em] text-paper">
          {total ? formatMoney(total) : "—"}
        </span>
        <span className="text-[13px] text-paper/60">
          {perPerson ? `примерно ${formatMoney(perPerson)} на человека` : "ориентир на всю поездку"}
        </span>
      </div>
    </div>
  );
}

/* ============================ КАЛЕНДАРЬ ============================ */

const MONTH_SHORT = [
  "янв",
  "фев",
  "мар",
  "апр",
  "май",
  "июн",
  "июл",
  "авг",
  "сен",
  "окт",
  "ноя",
  "дек",
];
const MONTH_FULL = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];
const WEEKDAYS = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];

/** Ближайшее наступление месяца: если он в этом году уже прошёл — берём следующий. */
function upcomingYear(month: number): number {
  const now = new Date();
  const year = now.getFullYear();
  return month - 1 < now.getMonth() ? year + 1 : year;
}

/** Сетка месяца с понедельника: 42 ячейки, пустые — null. */
function monthGrid(year: number, month: number): (number | null)[] {
  const first = new Date(year, month - 1, 1);
  const shift = (first.getDay() + 6) % 7; // воскресенье в JS нулевое, у нас последнее
  const days = new Date(year, month, 0).getDate();
  return Array.from({ length: 42 }, (_, i) => {
    const day = i - shift + 1;
    return day >= 1 && day <= days ? day : null;
  });
}

/**
 * Календарь вместо абстрактного кольца: месяцы сезона подсвечены в ленте,
 * ниже — разворот середины сезона с настоящими числами и днями недели.
 */
export function SeasonStage({ season }: { season: string | null }) {
  const months = season ? SEASON_MONTHS[season]! : [];
  // Середина сезона. У зимы это январь, поэтому берём именно средний элемент.
  const sheetMonth = months.length ? months[1]! : new Date().getMonth() + 1;
  const year = upcomingYear(sheetMonth);
  const grid = monthGrid(year, sheetMonth);

  return (
    <div className="flex size-full flex-col items-center justify-center gap-5 px-1">
      {/* Лента из двенадцати месяцев */}
      <div className="grid w-full max-w-[330px] grid-cols-6 gap-1">
        {MONTH_SHORT.map((m, i) => {
          const inSeason = months.includes(i + 1);
          return (
            <span
              key={m}
              className="rounded-[7px] py-1.5 text-center font-mono text-[10px] uppercase tracking-[0.04em] transition-colors duration-500"
              style={{
                background: inSeason ? "#7de2df" : "rgba(249,250,251,.07)",
                color: inSeason ? "#1a1d2e" : "rgba(249,250,251,.5)",
                fontWeight: inSeason ? 700 : 500,
              }}
            >
              {m}
            </span>
          );
        })}
      </div>

      {/* Разворот месяца */}
      <div
        key={`${year}-${sheetMonth}`}
        className="sheet-in w-full max-w-[330px] rounded-card border border-paper/12 bg-paper/5 p-4"
        style={{ opacity: season ? 1 : 0.5 }}
      >
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-display text-[17px] font-extrabold tracking-[-0.03em] text-paper">
            {MONTH_FULL[sheetMonth - 1]}
          </span>
          <span className="tnum font-mono text-[11px] text-paper/55">{year}</span>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-y-1 text-center">
          {WEEKDAYS.map((d, i) => (
            <span
              key={d}
              className="font-mono text-[9.5px] uppercase"
              style={{ color: i > 4 ? "rgba(125,226,223,.7)" : "rgba(249,250,251,.4)" }}
            >
              {d}
            </span>
          ))}

          {grid.map((day, i) => (
            <span
              key={i}
              className="tnum py-[3px] text-[12px] transition-colors duration-500"
              style={{
                color: day === null ? "transparent" : season ? "#f9fafb" : "rgba(249,250,251,.45)",
                fontWeight: day !== null && i % 7 > 4 ? 700 : 400,
              }}
            >
              {day ?? "·"}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================== ПРИОРИТЕТ =========================== */

const PRIORITY_TILES = [
  { value: "beach", label: "Пляж", glyph: "M2 17h20M4 13a8 8 0 0 1 16 0M12 5v0" },
  { value: "sights", label: "Экскурсии", glyph: "M4 20V9l8-5 8 5v11M9 20v-6h6v6" },
  { value: "food", label: "Еда", glyph: "M8 3v8a4 4 0 0 0 8 0V3M12 15v6" },
  { value: "price", label: "Цена", glyph: "M7 4h5a4 4 0 0 1 0 8H7m0 0v8m0-8h8" },
] as const;

/** Четыре плитки: выбранная выходит вперёд, остальные уходят на фон. */
export function PriorityStage({ priority }: { priority: string | null }) {
  return (
    <div className="flex size-full items-center justify-center p-4">
      <div className="grid w-full max-w-[320px] grid-cols-2 gap-3.5">
        {PRIORITY_TILES.map((tile) => {
          const active = tile.value === priority;
          return (
            <div
              key={tile.value}
              className="flex aspect-[5/4] flex-col items-center justify-center gap-3 rounded-card border transition-[transform,background-color,border-color,opacity,box-shadow] duration-500 ease-out"
              style={{
                background: active
                  ? "linear-gradient(150deg,#b0edeb,#35acbe)"
                  : "rgba(249,250,251,.05)",
                borderColor: active ? "#7de2df" : "rgba(249,250,251,.12)",
                color: active ? "#12414a" : "#f9fafb",
                opacity: priority && !active ? 0.4 : 1,
                transform: active ? "translateY(-6px) scale(1.06)" : "none",
                boxShadow: active ? "0 22px 40px -18px rgba(0,0,0,.8)" : "none",
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
