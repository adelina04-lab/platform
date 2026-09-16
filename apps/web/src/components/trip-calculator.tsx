"use client";

import { useMemo, useState } from "react";
import type { ComfortTier, CostComponent } from "@platform/core";
import { InlineSelect } from "@/components/inline-select";
import { useCountUp } from "@/hooks/use-count-up";
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

const DESTINATION_OPTIONS = DEMO_DESTINATIONS.map((d) => ({
  value: d.slug,
  label: d.accusative,
}));
const MONTH_OPTIONS = MONTHS_PREPOSITIONAL.map((m, i) => ({ value: String(i + 1), label: m }));
const NIGHT_SELECT = NIGHT_OPTIONS.map((n) => ({
  value: String(n),
  label: `${n} ${plural(n, "ночь", "ночи", "ночей")}`,
}));
const ADULT_SELECT = ADULT_OPTIONS.map((n) => ({
  value: String(n),
  label: `${n} ${plural(n, "взрослый", "взрослых", "взрослых")}`,
}));
const CHILD_SELECT = CHILD_OPTIONS.map((n) => ({
  value: String(n),
  label: n === 0 ? "без детей" : `и ${n} ${plural(n, "ребёнок", "ребёнка", "детей")}`,
}));
const STAR_SELECT = STAR_OPTIONS.map((n) => ({ value: String(n), label: `${n}★` }));
const MEAL_SELECT = [
  { value: "ai", label: "всё включено" },
  { value: "bb", label: "с завтраками" },
];

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

  // Цифра итога перебегает к новому значению: движение — самый понятный
  // признак того, что страница считает, а не показывает картинку.
  const shownTotal = useCountUp(active.totalMinor);

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

  const footNotes = [
    { label: "На человека", value: formatMoney(active.totalMinor / people) },
    { label: "Разброс уровней", value: `${formatAmount(cheapest)} — ${formatAmount(dearest)}` },
    { label: "Мимо цены тура", value: `${hiddenShare}%` },
  ];

  return (
    <div className="flex flex-col gap-14 lg:gap-20">
      {/* ------------------- ФРАЗА И РАСЧЁТ ------------------- */}
      <div className="grid items-start gap-12 lg:grid-cols-[1.04fr_0.96fr] lg:gap-10">
        <div className="flex flex-col gap-7">
          {/* Пунктирная рамка с контрастной подписью: сразу видно, что это
              поле ввода, а не просто крупный заголовок. */}
          <div className="relative rounded-[28px] border-2 border-dashed border-cold/40 px-5 pb-7 pt-9 sm:px-8 sm:pb-8 sm:pt-10">
            <span className="absolute -top-3 left-5 rounded-full bg-cold px-4 py-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-night sm:left-8 sm:text-[11px]">
              Введите данные для расчёта отпуска
            </span>

            <h1 className="font-display text-[clamp(27px,3.7vw,46px)] font-extrabold leading-[1.25] tracking-[-0.035em] text-paper">
              Хочу в{" "}
              <InlineSelect
                label="Направление"
                value={input.destinationSlug}
                options={DESTINATION_OPTIONS}
                onChange={(v) => patch({ destinationSlug: v })}
              />{" "}
              в{" "}
              <InlineSelect
                label="Месяц поездки"
                value={String(input.month)}
                options={MONTH_OPTIONS}
                onChange={(v) => patch({ month: Number(v) })}
              />{" "}
              на{" "}
              <InlineSelect
                label="Сколько ночей"
                value={String(input.nights)}
                options={NIGHT_SELECT}
                onChange={(v) => patch({ nights: Number(v) })}
              />
              , <span className="text-paper/40">едем</span>{" "}
              <InlineSelect
                label="Сколько взрослых"
                value={String(input.adults)}
                options={ADULT_SELECT}
                onChange={(v) => patch({ adults: Number(v) })}
              />{" "}
              <InlineSelect
                label="Сколько детей"
                value={String(input.children)}
                options={CHILD_SELECT}
                onChange={(v) => patch({ children: Number(v) })}
              />
              , <span className="text-paper/40">отель</span>{" "}
              <InlineSelect
                label="Звёздность отеля"
                value={String(input.hotelStars)}
                options={STAR_SELECT}
                onChange={(v) => patch({ hotelStars: Number(v) as 3 | 4 | 5 })}
              />{" "}
              <InlineSelect
                label="Питание"
                value={input.allInclusive ? "ai" : "bb"}
                options={MEAL_SELECT}
                onChange={(v) => patch({ allInclusive: v === "ai" })}
              />
            </h1>
          </div>

          <p className="max-w-[46ch] text-[16px] leading-relaxed text-paper/50">
            Нажмите любое подчёркнутое слово — смета справа пересчитается сразу. Семь статей
            расходов вместо одной цены тура, без регистрации и телефона.
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

        {/* ------------------------- СМЕТА ------------------------- */}
        {/* Плашка залита Cold Blue, текст — Dark Knight: по дизайн-системе
            это 11.2 : 1, уровень AAA. На стекле тот же текст плыл по фону и
            читался плохо, поэтому прозрачность фона здесь не используется.
            Второстепенный текст светлее основного ровно до 70 %: на этой
            заливке получается 5.6 : 1, а уже при 55 % — 3.7 : 1, то есть
            мельче нормы AA. */}
        <div className="rounded-modal bg-cold p-5 text-night shadow-[0_40px_80px_-34px_rgba(0,0,0,.75),inset_0_1px_0_rgba(255,255,255,.55)] sm:p-7 lg:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-night/20 pb-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em]">Смета поездки</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-night/70">
              {estimate.destination.name}, {MONTHS_PREPOSITIONAL[input.month - 1]}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-night/70">
              Уровень
            </span>
            <div
              role="group"
              aria-label="Уровень комфорта"
              className="flex gap-1 rounded-field bg-night/10 p-1"
            >
              {TIERS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTier(t)}
                  aria-pressed={t === tier}
                  className={`rounded-[7px] px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                    t === tier ? "bg-night text-cold" : "text-night/70 hover:text-night"
                  }`}
                >
                  {TIER_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Цветных маркеров здесь нет: половина шкалы долей — это оттенки
              самого Cold Blue, на такой заливке они бы пропали. Цвет статей
              живёт ниже, в полосе «Куда уходят деньги». */}
          <ul className="mt-4">
            {active.components.map((c) => (
              <li
                key={c.component}
                className={`flex items-start gap-2 border-b border-night/15 py-2.5 ${
                  c.included ? "" : "opacity-45"
                }`}
              >
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-[14.5px] font-bold leading-tight">
                    {COMPONENT_LABELS[c.component]}
                  </span>
                  <span className="text-[11.5px] leading-snug text-night/70">{c.note}</span>
                </span>

                <span aria-hidden className="leader" />

                <span className="tnum shrink-0 self-start text-[14.5px] font-bold">
                  {c.included ? formatMoney(c.amountMinor) : "—"}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-t-2 border-night/30 pt-5">
            <span className="flex flex-col gap-1">
              <span className="font-display text-[19px] font-extrabold tracking-[-0.03em]">
                Итого
              </span>
              <span className="text-[12.5px] leading-snug text-night/70">
                {input.nights} {plural(input.nights, "ночь", "ночи", "ночей")} · {people}{" "}
                {plural(people, "человек", "человека", "человек")} · {input.hotelStars}★
              </span>
            </span>

            <span
              aria-live="polite"
              className="tnum font-display text-[clamp(30px,4.2vw,48px)] font-extrabold leading-[0.9] tracking-[-0.045em]"
            >
              {formatMoney(shownTotal)}
            </span>
          </div>

          <dl className="mt-5 grid gap-x-6 gap-y-2 border-t border-dashed border-night/25 pt-4 sm:grid-cols-3">
            {footNotes.map((f) => (
              <div key={f.label} className="flex items-baseline justify-between gap-3">
                <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-night/70">
                  {f.label}
                </dt>
                <dd className="tnum text-[13.5px] font-bold">{f.value}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-4 text-[11.5px] leading-snug text-night/70">
            Цены демонстрационные. Не вошли чаевые, сувениры, платные пляжи и покупки на месте.
          </p>
        </div>
      </div>

      {/* --------------------------- ПОЛОСА ДОЛЕЙ --------------------------- */}
      <div className="flex flex-col gap-6">
        <h2 className="font-display text-[19px] font-bold tracking-[-0.025em] text-paper">
          Куда уходят деньги
        </h2>

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
          Бронирование — на сайте партнёра.
        </p>
      </div>
    </div>
  );
}
