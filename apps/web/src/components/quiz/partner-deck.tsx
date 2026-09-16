"use client";

import { useEffect, useRef } from "react";
import { PARTNERS } from "@/lib/quiz";

const CARD = 198;
const GAP = 14;
const STEP = CARD + GAP;
const HEIGHT = 168;
const N = PARTNERS.length;
/** Три копии списка: крайние карточки въезжают в кадр из уже готовой ленты. */
const RENDERED = Array.from({ length: N * 3 }, (_, i) => ({ partner: PARTNERS[i % N]!, i }));

const SPIN_SPEED = 0.42; // карточек в секунду

/**
 * Заставка на месте логотипа партнёра.
 *
 * Настоящие логотипы выдаёт сама партнёрская программа — вместе с бренд-китом
 * и только после одобрения заявки. До этого ставить чужие знаки на живой сайт
 * нельзя: получилось бы заявление о партнёрстве, которого нет. Плитка занимает
 * ровно то место и тот размер, куда логотип встанет, когда придёт.
 */
function BrandMark({ mark, index, settled }: { mark: string; index: number; settled: boolean }) {
  // Оттенок выводится из позиции в списке, чтобы витрины различались с одного
  // взгляда. Палитра своя, сайта, а не чужих брендов.
  const hue = 168 + ((index * 23) % 46);
  return (
    <span
      className="flex size-11 shrink-0 items-center justify-center rounded-[13px] border font-display text-[14px] font-extrabold tracking-[-0.02em] transition-[background,border-color,color] duration-500"
      style={{
        background: settled
          ? `linear-gradient(145deg, hsl(${hue} 68% 72%), hsl(${hue} 52% 40%))`
          : `linear-gradient(145deg, hsl(${hue} 34% 44% / .55), hsl(${hue} 38% 24% / .75))`,
        borderColor: settled ? "rgba(234,251,250,.6)" : "rgba(249,250,251,.16)",
        color: settled ? "#12414a" : "rgba(249,250,251,.85)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.35)",
      }}
      aria-hidden
    >
      {mark}
    </span>
  );
}

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
      {/* Лента продублирована трижды — скринридеру незачем читать двадцать одну
          карточку. Ему достаётся отдельный список из семи. */}
      <ul className="sr-only">
        {PARTNERS.map((p) => (
          <li key={p.name}>
            {p.name} — {p.kind}. Витрина пока не подключена.
          </li>
        ))}
      </ul>

      <div
        className="relative overflow-hidden py-1"
        // Лента уходит в края блока, а не обрывается ступенькой.
        style={{
          maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
        }}
        aria-hidden
      >
        <div className="relative" style={{ height: HEIGHT }}>
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
                  className="glass flex shrink-0 flex-col justify-between rounded-card p-4 transition-[opacity,border-color] duration-500"
                  style={{
                    width: CARD,
                    height: HEIGHT,
                    opacity: targetIndex === null || settled ? 1 : 0.42,
                    borderColor: settled ? "rgba(125,226,223,.55)" : undefined,
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-paper/65">
                        {partner.kind}
                      </span>
                      <span className="font-display text-[15.5px] font-extrabold leading-tight tracking-[-0.03em] text-paper">
                        {partner.name}
                      </span>
                    </span>

                    <BrandMark mark={partner.mark} index={i % N} settled={settled} />
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
