"use client";

import { BUDGET_PRESETS, BUDGET_RANGE, MAX_ADULTS, MAX_CHILDREN, SEASON_MONTHS } from "@/lib/quiz";
import { formatMoney, plural } from "@/lib/demo-estimate";

/* -------------------------------------------------------------------------
   Правая половина подбора. У двух шагов здесь не картинка, а само
   управление: количество людей и бюджет удобнее задавать счётчиком и
   ползунком, чем выбирать из готовых вариантов.

   Всё содержимое рассчитано на невысокую коробку: правая колонка не должна
   выходить ниже последнего вопроса слева.
------------------------------------------------------------------------- */

/* ========================= СКОЛЬКО ЧЕЛОВЕК ========================= */

function StepButton({
  sign,
  disabled,
  onClick,
  label,
}: {
  sign: "−" | "+";
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex size-9 items-center justify-center rounded-full border border-paper/20 text-[17px] font-bold text-paper transition-colors hover:border-cold hover:text-cold disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:border-paper/20 disabled:hover:text-paper"
    >
      {sign}
    </button>
  );
}

function Counter({
  label,
  note,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  note: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-card border border-paper/12 bg-paper/5 px-4 py-3">
      <span className="flex min-w-0 flex-col">
        <span className="text-[14.5px] font-bold text-paper">{label}</span>
        <span className="text-[11.5px] leading-snug text-paper/60">{note}</span>
      </span>
      <span className="flex shrink-0 items-center gap-1.5">
        <StepButton
          sign="−"
          label={`${label}: меньше`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
        />
        <span className="tnum w-7 text-center font-display text-[21px] font-extrabold text-paper">
          {value}
        </span>
        <StepButton
          sign="+"
          label={`${label}: больше`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
        />
      </span>
    </div>
  );
}

export function TravellersStage({
  adults,
  // Не `children`: так называется зарезервированный проп React.
  kids,
  onChange,
}: {
  adults: number;
  kids: number;
  onChange: (next: { adults?: number; children?: number }) => void;
}) {
  const people = adults + kids;
  // Номер рассчитан на двоих взрослых — отсюда и количество номеров.
  const rooms = Math.max(1, Math.ceil(adults / 2));

  return (
    <div className="flex size-full flex-col justify-center gap-3">
      <Counter
        label="Взрослые"
        note="от 12 лет"
        value={adults}
        min={1}
        max={MAX_ADULTS}
        onChange={(v) => onChange({ adults: v })}
      />
      <Counter
        label="Дети"
        note="до 12 лет, перелёт и питание дешевле"
        value={kids}
        min={0}
        max={MAX_CHILDREN}
        onChange={(v) => onChange({ children: v })}
      />

      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-card bg-cold px-4 py-3 text-night">
        <span className="tnum font-display text-[19px] font-extrabold tracking-[-0.03em]">
          {people} {plural(people, "человек", "человека", "человек")}
        </span>
        <span className="text-[12.5px] font-semibold text-night/70">
          нужно {rooms} {plural(rooms, "номер", "номера", "номеров")}
        </span>
      </div>
    </div>
  );
}

/* ============================= БЮДЖЕТ ============================= */

export function BudgetStage({
  budget,
  people,
  onChange,
}: {
  budget: number;
  people: number;
  onChange: (next: number) => void;
}) {
  const fill = ((budget - BUDGET_RANGE.min) / (BUDGET_RANGE.max - BUDGET_RANGE.min)) * 100;
  // Деление бюджета на число людей — арифметика над ответами самого человека,
  // а не цена, которую мы откуда-то взяли.
  const perPerson = people > 0 ? budget / people : undefined;

  return (
    <div className="flex size-full flex-col justify-center gap-6 px-1">
      <div className="flex flex-col items-center gap-1">
        <span className="tnum font-display text-[clamp(30px,4.6vw,46px)] font-extrabold leading-none tracking-[-0.045em] text-paper">
          {formatMoney(budget * 100)}
        </span>
        <span className="text-[13px] text-paper/60">
          {perPerson ? `примерно ${formatMoney(perPerson * 100)} на человека` : "на всю поездку"}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="quiz-budget" className="sr-only">
          Бюджет на поездку
        </label>
        <input
          id="quiz-budget"
          type="range"
          className="range"
          min={BUDGET_RANGE.min}
          max={BUDGET_RANGE.max}
          step={BUDGET_RANGE.step}
          value={budget}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ "--fill": `${fill}%` } as React.CSSProperties}
        />
        <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.08em] text-paper/50">
          <span>40 тыс</span>
          <span>1 млн</span>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {BUDGET_PRESETS.map((preset) => {
          const active = preset === budget;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(preset)}
              aria-pressed={active}
              className={`rounded-field border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
                active
                  ? "border-cold bg-cold text-night"
                  : "border-paper/18 text-paper/75 hover:border-cold hover:text-cold"
              }`}
            >
              {preset / 1000} тыс
            </button>
          );
        })}
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
  return month - 1 < now.getMonth() ? now.getFullYear() + 1 : now.getFullYear();
}

/** Сетка месяца с понедельника. Строк ровно столько, сколько нужно. */
function monthGrid(year: number, month: number): (number | null)[] {
  const shift = (new Date(year, month - 1, 1).getDay() + 6) % 7; // воскресенье в JS нулевое
  const days = new Date(year, month, 0).getDate();
  const cells = Math.ceil((shift + days) / 7) * 7;
  return Array.from({ length: cells }, (_, i) => {
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
    <div className="flex size-full flex-col items-center justify-center gap-3">
      <div className="grid w-full max-w-[300px] grid-cols-6 gap-1">
        {MONTH_SHORT.map((m, i) => {
          const inSeason = months.includes(i + 1);
          return (
            <span
              key={m}
              className="rounded-[6px] py-1 text-center font-mono text-[9.5px] uppercase transition-colors duration-500"
              style={{
                background: inSeason ? "#7de2df" : "rgba(249,250,251,.07)",
                color: inSeason ? "#1a1d2e" : "rgba(249,250,251,.55)",
                fontWeight: inSeason ? 700 : 500,
              }}
            >
              {m}
            </span>
          );
        })}
      </div>

      <div
        key={`${year}-${sheetMonth}`}
        className="sheet-in w-full max-w-[300px] rounded-card border border-paper/12 bg-paper/5 px-3.5 py-3"
        style={{ opacity: season ? 1 : 0.55 }}
      >
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-display text-[15px] font-extrabold tracking-[-0.03em] text-paper">
            {MONTH_FULL[sheetMonth - 1]}
          </span>
          <span className="tnum font-mono text-[10.5px] text-paper/60">{year}</span>
        </div>

        <div className="mt-2 grid grid-cols-7 text-center">
          {WEEKDAYS.map((d, i) => (
            <span
              key={d}
              className="pb-1 font-mono text-[9px] uppercase"
              style={{ color: i > 4 ? "rgba(125,226,223,.75)" : "rgba(249,250,251,.45)" }}
            >
              {d}
            </span>
          ))}

          {grid.map((day, i) => (
            <span
              key={i}
              className="tnum py-[2px] text-[11.5px] transition-colors duration-500"
              style={{
                color: day === null ? "transparent" : season ? "#f9fafb" : "rgba(249,250,251,.5)",
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
    <div className="flex size-full items-center justify-center">
      <div className="grid w-full max-w-[268px] grid-cols-2 gap-3">
        {PRIORITY_TILES.map((tile) => {
          const active = tile.value === priority;
          return (
            <div
              key={tile.value}
              className="flex aspect-[5/4] flex-col items-center justify-center gap-2 rounded-card border transition-[transform,background-color,border-color,opacity,box-shadow] duration-500 ease-out"
              style={{
                background: active
                  ? "linear-gradient(150deg,#b0edeb,#35acbe)"
                  : "rgba(249,250,251,.05)",
                borderColor: active ? "#7de2df" : "rgba(249,250,251,.12)",
                color: active ? "#12414a" : "#f9fafb",
                opacity: priority && !active ? 0.4 : 1,
                transform: active ? "translateY(-5px) scale(1.05)" : "none",
                boxShadow: active ? "0 22px 40px -18px rgba(0,0,0,.8)" : "none",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d={tile.glyph}
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-[13px] font-bold">{tile.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
