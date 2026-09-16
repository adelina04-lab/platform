"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { ComfortTier, CostComponent } from "@platform/core";
import { GlassScene } from "@/components/glass-scene";
import {
  COMPONENT_LABELS,
  DEMO_DESTINATIONS,
  MONTHS_PREPOSITIONAL,
  SEGMENT_COLORS,
  TIER_LABELS,
  estimateDemo,
  formatAmount,
  formatMoney,
  plural,
  type DemoInput,
} from "@/lib/demo-estimate";

const TIERS: readonly ComfortTier[] = ["economy", "standard", "comfort"];
const NIGHT_OPTIONS = [3, 5, 7, 10, 14] as const;
const ADULT_OPTIONS = [1, 2, 3, 4] as const;
const CHILD_OPTIONS = [0, 1, 2, 3] as const;
const STAR_OPTIONS = [3, 4, 5] as const;

/** Значение внутри фразы: читается как часть предложения, а не как поле формы. */
function Inline({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select id={id} className="madlib" value={value} onChange={(e) => onChange(e.target.value)}>
        {children}
      </select>
    </>
  );
}

export function TripCalculator() {
  const [input, setInput] = useState<DemoInput>({
    destinationSlug: "turciya",
    month: 10,
    nights: 7,
    adults: 2,
    children: 1,
    hotelStars: 4,
    allInclusive: true,
  });
  const [tier, setTier] = useState<ComfortTier>("standard");
  const [hovered, setHovered] = useState<CostComponent | null>(null);

  const estimate = useMemo(() => estimateDemo(input), [input]);
  const active = estimate.tiers.find((t) => t.tier === tier) ?? estimate.tiers[1]!;
  const cheapest = estimate.tiers[0]!.totalMinor;
  const dearest = estimate.tiers[2]!.totalMinor;
  const people = input.adults + input.children;

  const parts = useMemo(
    () =>
      active.components
        .filter((c) => c.included && c.amountMinor > 0)
        .sort((a, b) => b.amountMinor - a.amountMinor)
        .map((c) => ({ ...c, share: c.amountMinor / active.totalMinor })),
    [active],
  );

  // Доля, которой нет в цене на витрине тура: всё, кроме перелёта и отеля.
  const hiddenShare = useMemo(() => {
    const visible = parts
      .filter((p) => p.component === "flight" || p.component === "accommodation")
      .reduce((s, p) => s + p.amountMinor, 0);
    return Math.round(((active.totalMinor - visible) / active.totalMinor) * 100);
  }, [parts, active]);

  const patch = (next: Partial<DemoInput>) => setInput((prev) => ({ ...prev, ...next }));

  const stats = [
    { label: "Вся поездка", value: formatMoney(active.totalMinor), accent: true },
    { label: "На человека", value: formatMoney(active.totalMinor / people) },
    { label: "Разброс уровней", value: `${formatAmount(cheapest)} — ${formatAmount(dearest)}` },
    { label: "Мимо цены тура", value: `${hiddenShare}%` },
  ];

  return (
    <div className="flex flex-col gap-14 lg:gap-20">
      {/* ------------------- ФРАЗА И СЦЕНА ИЗ ПЛАШЕК ------------------- */}
      <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-8">
        <div className="flex flex-col gap-8">
          <h1 className="max-w-[24ch] font-display text-[clamp(30px,4.6vw,58px)] font-extrabold leading-[1.14] tracking-[-0.035em] text-paper">
            Хочу в{" "}
            <Inline
              id="calc-destination"
              label="Направление"
              value={input.destinationSlug}
              onChange={(v) => patch({ destinationSlug: v })}
            >
              {DEMO_DESTINATIONS.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.accusative}
                </option>
              ))}
            </Inline>{" "}
            в{" "}
            <Inline
              id="calc-month"
              label="Месяц поездки"
              value={String(input.month)}
              onChange={(v) => patch({ month: Number(v) })}
            >
              {MONTHS_PREPOSITIONAL.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </Inline>{" "}
            на{" "}
            <Inline
              id="calc-nights"
              label="Сколько ночей"
              value={String(input.nights)}
              onChange={(v) => patch({ nights: Number(v) })}
            >
              {NIGHT_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} {plural(n, "ночь", "ночи", "ночей")}
                </option>
              ))}
            </Inline>
            , <span className="text-paper/40">едем</span>{" "}
            <Inline
              id="calc-adults"
              label="Сколько взрослых"
              value={String(input.adults)}
              onChange={(v) => patch({ adults: Number(v) })}
            >
              {ADULT_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} {plural(n, "взрослый", "взрослых", "взрослых")}
                </option>
              ))}
            </Inline>{" "}
            <Inline
              id="calc-children"
              label="Сколько детей"
              value={String(input.children)}
              onChange={(v) => patch({ children: Number(v) })}
            >
              {CHILD_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n === 0 ? "без детей" : `и ${n} ${plural(n, "ребёнок", "ребёнка", "детей")}`}
                </option>
              ))}
            </Inline>
            , <span className="text-paper/40">отель</span>{" "}
            <Inline
              id="calc-stars"
              label="Звёздность отеля"
              value={String(input.hotelStars)}
              onChange={(v) => patch({ hotelStars: Number(v) as 3 | 4 | 5 })}
            >
              {STAR_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}★
                </option>
              ))}
            </Inline>{" "}
            <Inline
              id="calc-meals"
              label="Питание"
              value={input.allInclusive ? "ai" : "bb"}
              onChange={(v) => patch({ allInclusive: v === "ai" })}
            >
              <option value="ai">всё включено</option>
              <option value="bb">с завтраками</option>
            </Inline>
          </h1>

          <p className="max-w-[46ch] text-[16px] leading-relaxed text-paper/50">
            Семь статей расходов вместо одной цены тура. Меняйте любое слово в предложении — смета
            пересчитается сразу.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="inline-flex h-12 items-center rounded-field bg-laguna px-6 text-[15px] font-semibold text-paper transition-colors hover:bg-laguna-hover active:bg-laguna-active"
            >
              Туры в {estimate.destination.accusative}
            </button>
            <a
              href="#solutions"
              className="inline-flex h-12 items-center rounded-field border border-paper/20 px-6 text-[15px] font-semibold text-paper/80 transition-colors hover:border-cold hover:text-cold"
            >
              Готовые сметы
            </a>
          </div>
        </div>

        <GlassScene parts={parts} />
      </div>

      {/* ------------------------- ПЛАШКИ-ПОКАЗАТЕЛИ ------------------------- */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="glass flex flex-col gap-2 rounded-modal px-5 py-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-paper/45">
              {s.label}
            </span>
            <span
              className={`tnum font-display text-[clamp(19px,2.2vw,28px)] font-extrabold leading-none tracking-[-0.035em] ${
                s.accent ? "text-cold" : "text-paper"
              }`}
            >
              {s.value}
            </span>
          </div>
        ))}
      </div>

      {/* --------------------------- ПОЛОСА ДОЛЕЙ --------------------------- */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-[19px] font-bold tracking-[-0.025em] text-paper">
            Куда уходят деньги
          </h2>
          <div className="flex gap-1 rounded-field bg-paper/8 p-1">
            {TIERS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTier(t)}
                aria-pressed={t === tier}
                className={`rounded-[7px] px-4 py-2 text-[13.5px] font-semibold transition-colors ${
                  t === tier ? "bg-cold text-night" : "text-paper/55 hover:text-paper"
                }`}
              >
                {TIER_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex h-[72px] gap-1 sm:h-[88px]">
          {parts.map((p) => {
            const color = SEGMENT_COLORS[p.component];
            const dim = hovered !== null && hovered !== p.component;
            return (
              <button
                key={p.component}
                type="button"
                onMouseEnter={() => setHovered(p.component)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(p.component)}
                onBlur={() => setHovered(null)}
                style={{
                  flexGrow: p.share,
                  flexBasis: 0,
                  minWidth: 14,
                  background: color.bg,
                  color: color.fg,
                  opacity: dim ? 0.3 : 1,
                }}
                className="flex flex-col justify-end overflow-hidden rounded-[8px] px-3 pb-2.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,.35)] transition-opacity"
                aria-label={`${COMPONENT_LABELS[p.component]}: ${formatMoney(p.amountMinor)}`}
              >
                {p.share > 0.11 && (
                  <>
                    <span className="tnum block font-display text-[19px] font-bold leading-none tracking-[-0.02em]">
                      {Math.round(p.share * 100)}%
                    </span>
                    <span className="mt-1 block truncate font-mono text-[10px] uppercase tracking-[0.08em] opacity-70">
                      {COMPONENT_LABELS[p.component]}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-px sm:grid-cols-3 lg:grid-cols-4">
          {parts.map((p) => {
            const dim = hovered !== null && hovered !== p.component;
            return (
              <div
                key={p.component}
                onMouseEnter={() => setHovered(p.component)}
                onMouseLeave={() => setHovered(null)}
                className={`flex items-baseline justify-between gap-3 border-b border-paper/10 py-2.5 transition-opacity ${
                  dim ? "opacity-35" : "opacity-100"
                }`}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span
                    aria-hidden
                    className="size-2.5 shrink-0 rounded-[3px]"
                    style={{ background: SEGMENT_COLORS[p.component].bg }}
                  />
                  <span className="truncate text-[13.5px] text-paper/70">
                    {COMPONENT_LABELS[p.component]}
                  </span>
                </span>
                <span className="tnum shrink-0 text-[13.5px] font-semibold text-paper">
                  {formatMoney(p.amountMinor)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ---------------------------- ЭКОНОМИЯ ---------------------------- */}
      <div className="flex flex-col gap-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-paper/45">
          Сколько стоит каждое решение
        </span>
        <div className="grid gap-3 sm:grid-cols-3">
          {estimate.savings.map((s) => (
            <button
              key={s.change}
              type="button"
              className="flex flex-col gap-2 rounded-field border border-paper/15 px-5 py-4 text-left transition-colors hover:border-cold hover:bg-paper/5"
            >
              <span className="tnum font-display text-[24px] font-extrabold leading-none tracking-[-0.035em] text-cold">
                −{formatMoney(s.savesMinor)}
              </span>
              <span className="text-[13.5px] leading-snug text-paper/60">{s.change}</span>
            </button>
          ))}
        </div>
        <p className="text-[12.5px] leading-relaxed text-paper/35">
          Цены демонстрационные. Бронирование — на сайте партнёра; не вошли чаевые, сувениры и платные
          пляжи.
        </p>
      </div>
    </div>
  );
}
