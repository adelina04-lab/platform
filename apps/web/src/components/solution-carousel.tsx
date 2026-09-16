"use client";

import { useMemo, useState } from "react";
import {
  COMPONENT_LABELS,
  MONTHS_PREPOSITIONAL,
  SEGMENT_COLORS,
  estimateDemo,
  formatMoney,
  plural,
  type DemoInput,
} from "@/lib/demo-estimate";

/**
 * Готовые сметы: типовая поездка по каждому направлению. Параметры подобраны
 * так, как обычно едут именно туда — в Египет на десять ночей зимой, в Сочи на
 * пять летом. Цифры считает тот же демо-движок, что и калькулятор.
 */
const READY: readonly (DemoInput & { headline: string })[] = [
  {
    destinationSlug: "turciya",
    month: 10,
    nights: 7,
    adults: 2,
    children: 1,
    hotelStars: 4,
    allInclusive: true,
    headline: "Семьёй на бархатный сезон",
  },
  {
    destinationSlug: "egipet",
    month: 1,
    nights: 10,
    adults: 2,
    children: 0,
    hotelStars: 5,
    allInclusive: true,
    headline: "Вдвоём от зимы",
  },
  {
    destinationSlug: "sochi",
    month: 6,
    nights: 5,
    adults: 2,
    children: 2,
    hotelStars: 4,
    allInclusive: false,
    headline: "Без перелёта, с детьми",
  },
  {
    destinationSlug: "oae",
    month: 11,
    nights: 6,
    adults: 2,
    children: 0,
    hotelStars: 5,
    allInclusive: false,
    headline: "Короткая поездка в город",
  },
  {
    destinationSlug: "tailand",
    month: 11,
    nights: 12,
    adults: 2,
    children: 0,
    hotelStars: 4,
    allInclusive: false,
    headline: "Долгая зимовка",
  },
  {
    destinationSlug: "gruziya",
    month: 9,
    nights: 6,
    adults: 2,
    children: 0,
    hotelStars: 4,
    allInclusive: false,
    headline: "Горы, еда и вино",
  },
  {
    destinationSlug: "abhaziya",
    month: 7,
    nights: 8,
    adults: 2,
    children: 1,
    hotelStars: 3,
    allInclusive: false,
    headline: "Самый дешёвый берег",
  },
];

export function SolutionCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = useMemo(
    () =>
      READY.map((input) => {
        const estimate = estimateDemo(input);
        const standard = estimate.tiers[1]!;
        const parts = standard.components
          .filter((c) => c.included && c.amountMinor > 0)
          .sort((a, b) => b.amountMinor - a.amountMinor)
          .map((c) => ({ component: c.component, share: c.amountMinor / standard.totalMinor }));
        return { input, estimate, standard, parts };
      }),
    [],
  );

  const move = (delta: number) =>
    setActiveIndex((i) => Math.min(slides.length - 1, Math.max(0, i + delta)));

  return (
    <div className="flex flex-col gap-10">
      {/* Фильтр по направлениям */}
      <div className="flex flex-wrap justify-center gap-2">
        {slides.map((s, i) => (
          <button
            key={s.estimate.destination.slug}
            type="button"
            onClick={() => setActiveIndex(i)}
            aria-pressed={i === activeIndex}
            className={`rounded-full border px-4 py-2 text-[13.5px] font-semibold transition-colors ${
              i === activeIndex
                ? "border-night bg-night text-paper"
                : "border-line bg-surface text-ink-3 hover:border-laguna hover:text-laguna-active"
            }`}
          >
            {s.estimate.destination.name}
          </button>
        ))}
      </div>

      {/* Веер карточек */}
      <div
        className="relative h-[420px] overflow-hidden sm:h-[470px]"
        style={{ perspective: "1600px" }}
        role="group"
        aria-label="Готовые сметы по направлениям"
      >
        {slides.map((s, i) => {
          const offset = i - activeIndex;
          const distance = Math.abs(offset);
          if (distance > 2) return null;

          const people = s.input.adults + s.input.children;
          const isActive = offset === 0;

          return (
            <button
              key={s.estimate.destination.slug}
              type="button"
              onClick={() => setActiveIndex(i)}
              tabIndex={isActive ? 0 : -1}
              aria-hidden={!isActive}
              className="absolute left-1/2 top-1/2 w-[260px] origin-center rounded-modal text-left transition-[transform,opacity] duration-500 ease-out sm:w-[308px]"
              style={{
                height: isActive ? "100%" : "88%",
                zIndex: 10 - distance,
                opacity: distance === 2 ? 0.45 : 1,
                transform: `translate(-50%, -50%) translateX(${offset * 64}%) scale(${
                  1 - distance * 0.1
                }) rotateY(${offset * -16}deg)`,
              }}
            >
              <div
                className="flex size-full flex-col justify-between overflow-hidden rounded-modal p-6 sm:p-7"
                style={{
                  background: `linear-gradient(160deg, ${
                    SEGMENT_COLORS[s.parts[0]!.component].bg
                  } 0%, #1f6874 55%, #12414a 100%)`,
                  boxShadow: isActive
                    ? "0 40px 70px -30px rgba(18,65,74,.65), inset 0 1px 0 rgba(255,255,255,.4)"
                    : "0 20px 40px -24px rgba(18,65,74,.5), inset 0 1px 0 rgba(255,255,255,.25)",
                }}
              >
                <div className="flex flex-col gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-paper/60">
                    {MONTHS_PREPOSITIONAL[s.input.month - 1]} · {s.input.nights}{" "}
                    {plural(s.input.nights, "ночь", "ночи", "ночей")}
                  </span>
                  <h3 className="font-display text-[30px] font-extrabold leading-none tracking-[-0.04em] text-paper sm:text-[36px]">
                    {s.estimate.destination.name}
                  </h3>
                  <p className="text-[14px] leading-snug text-paper/70">{s.input.headline}</p>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Полоса долей — тот же приём, что в калькуляторе */}
                  <div className="flex h-2.5 gap-[3px]">
                    {s.parts.map((p) => (
                      <span
                        key={p.component}
                        style={{
                          flexGrow: p.share,
                          flexBasis: 0,
                          background: SEGMENT_COLORS[p.component].bg,
                        }}
                        className="rounded-[2px]"
                      />
                    ))}
                  </div>

                  <p className="text-[12.5px] leading-snug text-paper/60">
                    {people} {plural(people, "человек", "человека", "человек")} · {s.input.hotelStars}★
                    {s.input.allInclusive ? " · всё включено" : ""} · больше всего на «
                    {COMPONENT_LABELS[s.parts[0]!.component].toLowerCase()}»
                  </p>

                  <div className="flex items-end justify-between gap-3 border-t border-paper/20 pt-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-paper/55">
                      Итого
                    </span>
                    <span className="tnum font-display text-[27px] font-extrabold leading-none tracking-[-0.04em] text-paper sm:text-[31px]">
                      {formatMoney(s.standard.totalMinor)}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Стрелки */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => move(-1)}
          disabled={activeIndex === 0}
          aria-label="Предыдущая смета"
          className="flex size-11 items-center justify-center rounded-full border border-line bg-surface text-ink-2 transition-colors hover:border-laguna hover:text-laguna disabled:opacity-30"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path
              d="M10 3 5 8l5 5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <span className="tnum font-mono text-[12px] text-ink-4">
          {activeIndex + 1} / {slides.length}
        </span>
        <button
          type="button"
          onClick={() => move(1)}
          disabled={activeIndex === slides.length - 1}
          aria-label="Следующая смета"
          className="flex size-11 items-center justify-center rounded-full border border-line bg-surface text-ink-2 transition-colors hover:border-laguna hover:text-laguna disabled:opacity-30"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path
              d="M6 3l5 5-5 5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
