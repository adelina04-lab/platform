"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { ComfortTier } from "@platform/core";
import {
  COMPONENT_LABELS,
  DEMO_DESTINATIONS,
  MONTHS_PREPOSITIONAL,
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

/** Инлайновое поле внутри фразы: значение читается как часть предложения. */
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
    <span className="relative inline-block">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select id={id} className="madlib" value={value} onChange={(e) => onChange(e.target.value)}>
        {children}
      </select>
    </span>
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

  const estimate = useMemo(() => estimateDemo(input), [input]);
  const active = estimate.tiers.find((t) => t.tier === tier) ?? estimate.tiers[1]!;
  const cheapest = estimate.tiers[0]!.totalMinor;
  const dearest = estimate.tiers[2]!.totalMinor;
  const people = input.adults + input.children;
  const perPerson = active.totalMinor / people;

  const patch = (next: Partial<DemoInput>) => setInput((prev) => ({ ...prev, ...next }));

  return (
    <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 lg:items-start">
      {/* ------------------------------ ФРАЗА ------------------------------ */}
      <div className="flex flex-col gap-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-cold">
          Калькулятор полной стоимости
        </p>

        <h1 className="font-display text-[clamp(28px,4.4vw,52px)] font-bold leading-[1.18] tracking-[-0.025em] text-paper">
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
          .{" "}
          <span className="text-paper/55">Едем</span>{" "}
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
          , отель{" "}
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
          .
        </h1>

        <div className="flex flex-wrap items-center gap-x-7 gap-y-3 font-mono text-[11px] uppercase tracking-[0.1em] text-paper/45">
          <span>7 компонентов поездки</span>
          <span>Диапазон, а не одна цифра</span>
          <span>Бронирование — у партнёров</span>
        </div>
      </div>

      {/* ------------------------------ СМЕТА ------------------------------ */}
      <div className="rounded-modal bg-surface shadow-float">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft px-6 py-5 sm:px-7">
          <div className="flex flex-col gap-1">
            <span className="font-display text-lg font-semibold tracking-[-0.02em]">Смета поездки</span>
            <span className="font-mono text-[11px] text-ink-4">
              {estimate.destination.name} · {MONTHS_PREPOSITIONAL[input.month - 1]} · {people}{" "}
              {plural(people, "человек", "человека", "человек")}
            </span>
          </div>
          <span className="rounded-full bg-cold-3 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-laguna-active">
            Демо-цены
          </span>
        </div>

        {/* Переключатель уровня */}
        <div className="flex gap-1 border-b border-line-soft bg-paper p-1.5">
          {TIERS.map((t) => {
            const isActive = t === tier;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTier(t)}
                aria-pressed={isActive}
                className={`flex-1 rounded-field px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-night text-paper"
                    : "text-ink-3 hover:bg-muted hover:text-ink-2"
                }`}
              >
                {TIER_LABELS[t]}
              </button>
            );
          })}
        </div>

        {/* Разбивка */}
        <ul className="flex flex-col px-6 sm:px-7">
          {active.components.map((c) => (
            <li
              key={c.component}
              className="flex items-baseline justify-between gap-4 border-b border-line-soft py-3.5 last:border-b-0"
            >
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className={`text-[15px] ${c.included ? "text-ink-2" : "text-ink-4 line-through"}`}>
                  {COMPONENT_LABELS[c.component]}
                </span>
                <span className="text-[12.5px] text-ink-4">{c.note}</span>
              </span>
              <span
                className={`tnum shrink-0 text-[15px] font-semibold ${c.included ? "text-ink" : "text-ink-4"}`}
              >
                {c.included ? formatMoney(c.amountMinor) : "—"}
              </span>
            </li>
          ))}
        </ul>

        {/* Итог */}
        <div className="flex flex-col gap-3 border-t border-line px-6 py-6 sm:px-7">
          <div className="flex items-end justify-between gap-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-4">Итого</span>
            <span className="tnum font-display text-[clamp(30px,5vw,40px)] font-bold leading-none tracking-[-0.03em]">
              {formatMoney(active.totalMinor)}
            </span>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-2 text-[13px] text-ink-3">
            <span>
              Весь диапазон: {formatAmount(cheapest)} — {formatMoney(dearest)}
            </span>
            <span className="tnum">{formatMoney(perPerson)} на человека</span>
          </div>
        </div>

        {/* Сценарии экономии */}
        {estimate.savings.length > 0 && (
          <div className="flex flex-col gap-2.5 border-t border-line-soft bg-cold-4 px-6 py-5 sm:px-7">
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-laguna-active">
              Сколько стоит решение
            </span>
            {estimate.savings.map((s) => (
              <button
                key={s.change}
                type="button"
                className="flex items-baseline justify-between gap-4 rounded-field border border-cold-2 bg-surface px-3.5 py-2.5 text-left text-[14px] text-ink-2 transition-colors hover:border-laguna"
              >
                <span>{s.change}</span>
                <span className="tnum shrink-0 font-semibold text-laguna-active">
                  −{formatMoney(s.savesMinor)}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Переход к партнёрам */}
        <div className="flex flex-col gap-3 border-t border-line-soft px-6 py-6 sm:px-7">
          <button
            type="button"
            className="h-12 w-full rounded-field bg-laguna px-5 text-[15px] font-semibold text-paper transition-colors hover:bg-laguna-hover active:bg-laguna-active"
          >
            Показать туры в {estimate.destination.accusative} от {formatAmount(cheapest)} ₽
          </button>
          <p className="text-[12.5px] leading-relaxed text-ink-4">
            Не входит: чаевые, сувениры, платные пляжи и камера хранения в аэропорту. Бронирование
            происходит на сайте партнёра — мы получаем комиссию от него, а не от вас.
          </p>
        </div>
      </div>
    </div>
  );
}
