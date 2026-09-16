"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Плавный перебег числа к новому значению.
 *
 * Это не украшение: движущаяся цифра — самый понятный сигнал, что страница
 * считает. Пока сумма просто подменялась, калькулятор читался как картинка.
 *
 * Первое значение отдаётся как есть, поэтому разметка на сервере и в браузере
 * совпадает — это важно для статического экспорта.
 */
export function useCountUp(value: number, durationMs = 480): number {
  const [display, setDisplay] = useState(value);
  const displayRef = useRef(value);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const from = displayRef.current;
    if (from === value) return;

    // При отключённой анимации длительность нулевая: значение доедет за один
    // кадр. Так состояние всё равно меняется вне тела эффекта.
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : durationMs;

    const start = performance.now();
    const step = (now: number) => {
      const progress = duration <= 0 ? 1 : Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (value - from) * eased;
      displayRef.current = current;
      setDisplay(current);
      if (progress < 1) frameRef.current = requestAnimationFrame(step);
    };

    frameRef.current = requestAnimationFrame(step);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [value, durationMs]);

  return display;
}
