"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { ComfortTier, CostComponent } from "@platform/core";
import { GlassScene } from "@/components/glass-scene";
import { Barcode, TornEdge } from "@/components/receipt-chrome";
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

/**
 * Строка чека, которую можно изменить. Слева — название графы, справа —
 * выпадающий список, оформленный как кнопка: рамка, фон, шеврон. Раньше здесь
 * было подчёркнутое слово внутри заголовка, и его никто не пробовал нажать.
 */
function Line({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-dashed border-line py-3">
      <label
        htmlFor={id}
        className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-4"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function ChipSelect({
  id,
  value,
  onChange,
  big = false,
  children,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  big?: boolean;
  children: ReactNode;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`chip ${
        big ? "chip-lg font-display text-[19px] tracking-[-0.02em] sm:text-[22px]" : "text-[14.5px]"
      }`}
    >
      {children}
    </select>
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

  const receiptNo = `${input.destinationSlug.slice(0, 3).toUpperCase()}-${String(
    input.month,
  ).padStart(2, "0")}-${String(input.nights).padStart(2, "0")}`;

  const footNotes = [
    { label: "На человека", value: formatMoney(active.totalMinor / people) },
    { label: "Разброс уровней", value: `${formatAmount(cheapest)} — ${formatAmount(dearest)}` },
    { label: "Мимо цены тура", value: `${hiddenShare}%` },
  ];

  return (
    <div className="flex flex-col gap-14 lg:gap-20">
      {/* ================================ ЧЕК ================================ */}
      <div className="relative">
        {/* Плашки ушли на фон и держат глубину, не споря с чеком за внимание. */}
        <GlassScene parts={parts} variant="edges" className="absolute inset-0 hidden lg:block" />

        <div className="relative z-10 flex flex-col items-center gap-9 lg:gap-11">
          <div className="flex max-w-[34ch] flex-col items-center gap-4 text-center">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-cold">
              Калькулятор отпуска
            </span>
            <h1 className="text-balance font-display text-[clamp(30px,5vw,60px)] font-extrabold leading-[1.08] tracking-[-0.04em] text-paper">
              Сколько на самом деле стоит отпуск
            </h1>
            <p className="max-w-[48ch] text-[16px] leading-relaxed text-paper/55">
              Меняйте строки в чеке — смета пересчитается сразу. Семь статей расходов вместо одной
              цены тура. Ни регистрации, ни телефона.
            </p>
          </div>

          <div className="w-full max-w-[1020px]">
            <TornEdge side="top" />

            <div className="receipt-paper px-5 pb-8 pt-7 sm:px-9 sm:pb-10 sm:pt-9 lg:px-14">
              {/* -------------------------- ШАПКА ЧЕКА -------------------------- */}
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b-2 border-ink pb-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink">
                  Итого · смета поездки
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-4">
                  № {receiptNo} · демонстрационные цены
                </span>
              </div>

              <div className="grid gap-x-14 gap-y-9 pt-7 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                {/* ---------------------- ЧТО ЗА ПОЕЗДКА ---------------------- */}
                <section>
                  <h2 className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-4">
                    Поездка
                  </h2>

                  <div className="mt-2">
                    <Line id="calc-destination" label="Направление">
                      <ChipSelect
                        id="calc-destination"
                        big
                        value={input.destinationSlug}
                        onChange={(v) => patch({ destinationSlug: v })}
                      >
                        {DEMO_DESTINATIONS.map((d) => (
                          <option key={d.slug} value={d.slug}>
                            {d.name}
                          </option>
                        ))}
                      </ChipSelect>
                    </Line>

                    <Line id="calc-month" label="Месяц">
                      <ChipSelect
                        id="calc-month"
                        big
                        value={String(input.month)}
                        onChange={(v) => patch({ month: Number(v) })}
                      >
                        {MONTHS_PREPOSITIONAL.map((m, i) => (
                          <option key={m} value={i + 1}>
                            {m}
                          </option>
                        ))}
                      </ChipSelect>
                    </Line>

                    <Line id="calc-nights" label="Длительность">
                      <ChipSelect
                        id="calc-nights"
                        value={String(input.nights)}
                        onChange={(v) => patch({ nights: Number(v) })}
                      >
                        {NIGHT_OPTIONS.map((n) => (
                          <option key={n} value={n}>
                            {n} {plural(n, "ночь", "ночи", "ночей")}
                          </option>
                        ))}
                      </ChipSelect>
                    </Line>

                    <Line id="calc-adults" label="Кто едет">
                      <span className="flex flex-wrap justify-end gap-2">
                        <ChipSelect
                          id="calc-adults"
                          value={String(input.adults)}
                          onChange={(v) => patch({ adults: Number(v) })}
                        >
                          {ADULT_OPTIONS.map((n) => (
                            <option key={n} value={n}>
                              {n} {plural(n, "взрослый", "взрослых", "взрослых")}
                            </option>
                          ))}
                        </ChipSelect>
                        <label htmlFor="calc-children" className="sr-only">
                          Сколько детей
                        </label>
                        <ChipSelect
                          id="calc-children"
                          value={String(input.children)}
                          onChange={(v) => patch({ children: Number(v) })}
                        >
                          {CHILD_OPTIONS.map((n) => (
                            <option key={n} value={n}>
                              {n === 0
                                ? "без детей"
                                : `${n} ${plural(n, "ребёнок", "ребёнка", "детей")}`}
                            </option>
                          ))}
                        </ChipSelect>
                      </span>
                    </Line>

                    <Line id="calc-stars" label="Отель">
                      <span className="flex flex-wrap justify-end gap-2">
                        <ChipSelect
                          id="calc-stars"
                          value={String(input.hotelStars)}
                          onChange={(v) => patch({ hotelStars: Number(v) as 3 | 4 | 5 })}
                        >
                          {STAR_OPTIONS.map((n) => (
                            <option key={n} value={n}>
                              {n}★
                            </option>
                          ))}
                        </ChipSelect>
                        <label htmlFor="calc-meals" className="sr-only">
                          Питание
                        </label>
                        <ChipSelect
                          id="calc-meals"
                          value={input.allInclusive ? "ai" : "bb"}
                          onChange={(v) => patch({ allInclusive: v === "ai" })}
                        >
                          <option value="ai">всё включено</option>
                          <option value="bb">с завтраками</option>
                        </ChipSelect>
                      </span>
                    </Line>

                    {/* Уровень комфорта живёт здесь же: это такой же параметр
                        расчёта, и разносить управление по странице незачем. */}
                    <div className="flex items-center justify-between gap-4 py-3">
                      <span className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-4">
                        Уровень
                      </span>
                      <div
                        role="group"
                        aria-label="Уровень комфорта"
                        className="flex gap-1 rounded-field bg-muted p-1"
                      >
                        {TIERS.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setTier(t)}
                            aria-pressed={t === tier}
                            className={`rounded-[7px] px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                              t === tier
                                ? "bg-night text-paper"
                                : "text-ink-3 hover:text-laguna-active"
                            }`}
                          >
                            {TIER_LABELS[t]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* ---------------------- СТРОКИ РАСХОДОВ ---------------------- */}
                <section>
                  <h2 className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-4">
                    Расходы
                  </h2>

                  <ul className="mt-2">
                    {active.components.map((c) => (
                      <li
                        key={c.component}
                        className={`flex items-start gap-2 border-b border-dashed border-line py-2.5 ${
                          c.included ? "" : "opacity-45"
                        }`}
                      >
                        <span className="flex min-w-0 flex-col gap-0.5">
                          <span className="flex items-center gap-2 text-[15px] font-semibold leading-tight text-ink">
                            <span
                              aria-hidden
                              className="size-2.5 shrink-0 rounded-[3px]"
                              style={{ background: SEGMENT_COLORS[c.component].bg }}
                            />
                            {COMPONENT_LABELS[c.component]}
                          </span>
                          <span className="pl-[18px] text-[12px] leading-snug text-ink-4">
                            {c.note}
                          </span>
                        </span>

                        <span aria-hidden className="leader" />

                        <span className="tnum shrink-0 self-start text-[15.5px] font-bold text-ink">
                          {c.included ? formatMoney(c.amountMinor) : "—"}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <p className="mt-3 text-[12px] leading-snug text-ink-4">
                    Не вошли чаевые, сувениры, платные пляжи и покупки на месте.
                  </p>
                </section>
              </div>

              {/* ------------------------------ ИТОГО ------------------------------ */}
              <div className="mt-8 border-t-2 border-ink pt-2">
                <div className="border-t border-ink/25 pt-6">
                  <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
                    <span className="flex flex-col gap-1">
                      <span className="font-display text-[22px] font-extrabold tracking-[-0.03em] text-ink sm:text-[26px]">
                        Итого
                      </span>
                      <span className="text-[13px] leading-snug text-ink-3">
                        {estimate.destination.name}, {MONTHS_PREPOSITIONAL[input.month - 1]} ·{" "}
                        {input.nights} {plural(input.nights, "ночь", "ночи", "ночей")} · {people}{" "}
                        {plural(people, "человек", "человека", "человек")}
                      </span>
                    </span>

                    <span
                      aria-live="polite"
                      className="tnum font-display text-[clamp(40px,7.5vw,86px)] font-extrabold leading-[0.9] tracking-[-0.05em] text-ink"
                    >
                      {formatMoney(shownTotal)}
                    </span>
                  </div>

                  <dl className="mt-7 grid grid-cols-1 gap-x-8 gap-y-3 border-t border-dashed border-line pt-5 sm:grid-cols-3">
                    {footNotes.map((f) => (
                      <div key={f.label} className="flex items-baseline justify-between gap-3">
                        <dt className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-4">
                          {f.label}
                        </dt>
                        <dd className="tnum text-[15px] font-bold text-ink">{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              {/* --------------------------- ПОДВАЛ ЧЕКА --------------------------- */}
              <div className="mt-8 flex flex-col items-center gap-2">
                <Barcode seed={active.totalMinor} />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-4">
                  itogo · бронирование у партнёров
                </span>
              </div>
            </div>

            <TornEdge side="bottom" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
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
          Цены демонстрационные. Бронирование — на сайте партнёра.
        </p>
      </div>
    </div>
  );
}
