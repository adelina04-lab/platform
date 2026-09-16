"use client";

import { useEffect, useRef } from "react";
import { PARTNERS } from "@/lib/quiz";

const CARD = 236;
const GAP = 18;
const STEP = CARD + GAP;
const N = PARTNERS.length;
/** Три копии списка: крайние карточки въезжают в кадр из уже готовой ленты. */
const RENDERED = Array.from({ length: N * 3 }, (_, i) => ({ partner: PARTNERS[i % N]!, i }));

const SPIN_SPEED = 0.42; // карточек в секунду

/**
 * Лента витрин партнёров.
 *
 * Пока на текущий вопрос нет ответа — лента едет. Как только ответ выбран,
 * она мягко тормозит ровно на той витрине, которая за этот ответ отвечает.
 *
 * Сдвиг ленты пишется прямо в стиль из requestAnimationFrame: гонять React
 * на шестидесяти кадрах в секунду ради одного числа незачем.
 */
export function PartnerDeck({ targetIndex }: { targetIndex: number | null }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef(targetIndex);

  // Писать в ref во время отрисовки нельзя, поэтому обновляем его эффектом.
  useEffect(() => {
    targetRef.current = targetIndex;
  }, [targetIndex]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let offset = N; // держим сдвиг в середине ленты, чтобы хватало запаса с краёв
    let frame = 0;
    let last = performance.now();

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const goal = targetRef.current;
      if (goal === null) {
        offset += SPIN_SPEED * dt;
      } else {
        // Ближайшая позиция, на которой нужная витрина окажется по центру:
        // копий три, поэтому одну и ту же карточку можно поймать спереди.
        const base = Math.round((offset - goal) / N) * N + goal;
        offset += (base - offset) * (reduce ? 1 : 1 - Math.exp(-2.8 * dt));
      }

      // Возврат в середину списка незаметен: карточки там ровно такие же.
      if (offset >= N * 2) offset -= N;
      if (offset < N) offset += N;

      track.style.transform = `translateX(${-offset * STEP}px)`;
      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <>
      <ul className="sr-only">
        {PARTNERS.map((p) => (
          <li key={p.name}>
            {p.name} — {p.kind}. Витрина пока не подключена.
          </li>
        ))}
      </ul>

      <div
      className="relative overflow-hidden py-2"
      // Лента уходит в края секции, а не обрывается ступенькой.
      style={{
        maskImage: "linear-gradient(90deg, transparent, #000 9%, #000 91%, transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, #000 9%, #000 91%, transparent)",
      }}
      aria-hidden
    >
      <div className="relative h-[178px]">
        <div
          ref={trackRef}
          className="absolute left-1/2 top-0 flex"
          style={{ gap: GAP, marginLeft: -CARD / 2 }}
        >
          {RENDERED.map(({ partner, i }) => {
            const settled = targetIndex !== null && i % N === targetIndex;
            return (
              <div
                key={i}
                className="glass flex shrink-0 flex-col justify-between rounded-card p-5 transition-[opacity,border-color] duration-500"
                style={{
                  width: CARD,
                  height: 178,
                  opacity: targetIndex === null || settled ? 1 : 0.42,
                  borderColor: settled ? "rgba(125,226,223,.55)" : undefined,
                }}
              >
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-paper/65">
                    {partner.kind}
                  </span>
                  <span className="font-display text-[17px] font-extrabold leading-tight tracking-[-0.03em] text-paper">
                    {partner.name}
                  </span>
                </div>

                {/* Данных нет и придумывать их нельзя: на их месте заглушки. */}
                <div className="flex flex-col gap-2">
                  <span className="skeleton h-3 w-2/3 rounded-full" />
                  <span className="skeleton h-3 w-2/5 rounded-full" />
                </div>

                <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-paper/55">
                  {settled ? "подходит под ответ" : "витрина не подключена"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </>
  );
}
