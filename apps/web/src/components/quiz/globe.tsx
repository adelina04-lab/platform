"use client";

import { useEffect, useRef } from "react";
import { LAND_RINGS } from "@/lib/land-110m";

const RAD = Math.PI / 180;

/** Пока направление не выбрано, глобус медленно крутится сам. */
const IDLE_SPEED = 5.5; // градусов в секунду
const IDLE_LAT = 14;

interface Rotation {
  lon: number;
  lat: number;
}

/**
 * Ортографическая проекция — та самая, из-за которой шар выглядит шаром:
 * точка видна, только если она на обращённой к нам половине.
 */
function project(lon: number, lat: number, c: Rotation) {
  const l = (lon - c.lon) * RAD;
  const p = lat * RAD;
  const p0 = c.lat * RAD;
  const cosP = Math.cos(p);
  const cosL = Math.cos(l);
  return {
    x: cosP * Math.sin(l),
    y: Math.cos(p0) * Math.sin(p) - Math.sin(p0) * cosP * cosL,
    visible: Math.sin(p0) * Math.sin(p) + Math.cos(p0) * cosP * cosL >= 0,
  };
}

/** Кратчайший путь по долготе: из 350° в 10° надо идти вперёд, а не назад. */
function shortestLonDelta(from: number, to: number): number {
  return ((to - from + 540) % 360) - 180;
}

function buildLandPath(c: Rotation, cx: number, cy: number, r: number): Path2D {
  const path = new Path2D();

  for (const ring of LAND_RINGS) {
    let drawing = false;
    for (let i = 0; i < ring.length; i += 2) {
      const pt = project(ring[i]!, ring[i + 1]!, c);
      if (!pt.visible) {
        drawing = false;
        continue;
      }
      const x = cx + r * pt.x;
      const y = cy - r * pt.y;
      if (drawing) path.lineTo(x, y);
      else {
        path.moveTo(x, y);
        drawing = true;
      }
    }
  }

  return path;
}

function buildGraticulePath(c: Rotation, cx: number, cy: number, r: number): Path2D {
  const path = new Path2D();

  const line = (points: [number, number][]) => {
    let drawing = false;
    for (const [lon, lat] of points) {
      const pt = project(lon, lat, c);
      if (!pt.visible) {
        drawing = false;
        continue;
      }
      const x = cx + r * pt.x;
      const y = cy - r * pt.y;
      if (drawing) path.lineTo(x, y);
      else {
        path.moveTo(x, y);
        drawing = true;
      }
    }
  };

  for (let lon = -180; lon < 180; lon += 30) {
    const pts: [number, number][] = [];
    for (let lat = -80; lat <= 80; lat += 4) pts.push([lon, lat]);
    line(pts);
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    const pts: [number, number][] = [];
    for (let lon = -180; lon <= 180; lon += 4) pts.push([lon, lat]);
    line(pts);
  }

  return path;
}

/**
 * Глобус на canvas. Рисуем вручную, а не пересобираем SVG каждый кадр: точек
 * больше полутора тысяч, и React на такой частоте перерисовок начал бы
 * заикаться. Ни одного постороннего пакета для этого не нужно.
 *
 * Суша обведена контуром, а не залита: залитый материк на краю диска пришлось
 * бы обрезать по дуге, и без честного отсечения по сфере в этом месте лезут
 * артефакты. Вместо заливки — широкий полупрозрачный штрих под тонким: масса
 * читается, а обрезать нечего.
 */
export function Globe({ target, dimmed }: { target: { lon: number; lat: number } | null; dimmed: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetRef = useRef(target);
  const dimmedRef = useRef(dimmed);

  // Пропсы кладём в ref из эффекта, а не прямо в теле компонента: писать в ref
  // во время отрисовки нельзя. Сам цикл заводится один раз — иначе смена
  // подсветки перезапускала бы его и глобус прыгал бы к точке без поворота.
  useEffect(() => {
    targetRef.current = target;
    dimmedRef.current = dimmed;
  }, [target, dimmed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rotation: Rotation = targetRef.current
      ? { ...targetRef.current }
      : { lon: 40, lat: IDLE_LAT };

    let size = 0;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      size = wrap.clientWidth;
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(wrap);

    let frame = 0;
    let last = performance.now();

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const goal = targetRef.current;
      if (goal) {
        // Экспоненциальное сглаживание: быстро стартует, мягко причаливает.
        const k = reduce ? 1 : 1 - Math.exp(-3.2 * dt);
        rotation.lon += shortestLonDelta(rotation.lon, goal.lon) * k;
        rotation.lat += (goal.lat - rotation.lat) * k;
      } else if (!reduce) {
        rotation.lon = (rotation.lon + IDLE_SPEED * dt) % 360;
        rotation.lat += (IDLE_LAT - rotation.lat) * (1 - Math.exp(-2 * dt));
      }

      const cx = size / 2;
      const cy = size / 2;
      const r = size * 0.42;

      ctx.clearRect(0, 0, size, size);

      // Сам шар: свет падает слева сверху.
      const sphere = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.1, cx, cy, r);
      sphere.addColorStop(0, "rgba(53,172,190,0.30)");
      sphere.addColorStop(0.65, "rgba(18,65,74,0.42)");
      sphere.addColorStop(1, "rgba(18,65,74,0.08)");
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = sphere;
      ctx.fill();

      const fade = dimmedRef.current ? 0.45 : 1;

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.strokeStyle = `rgba(125,226,223,${0.14 * fade})`;
      ctx.lineWidth = 1;
      ctx.stroke(buildGraticulePath(rotation, cx, cy, r));

      const land = buildLandPath(rotation, cx, cy, r);
      ctx.strokeStyle = `rgba(125,226,223,${0.1 * fade})`;
      ctx.lineWidth = 7;
      ctx.stroke(land);
      ctx.strokeStyle = `rgba(125,226,223,${0.72 * fade})`;
      ctx.lineWidth = 1.2;
      ctx.stroke(land);

      // Кромка диска.
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(125,226,223,${0.32 * fade})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      if (goal) {
        const pt = project(goal.lon, goal.lat, rotation);
        if (pt.visible) {
          const px = cx + r * pt.x;
          const py = cy - r * pt.y;
          const pulse = reduce ? 0.5 : (Math.sin(now / 620) + 1) / 2;

          ctx.beginPath();
          ctx.arc(px, py, 7 + pulse * 13, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(125,226,223,${0.22 * (1 - pulse)})`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(px, py, 7, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(125,226,223,0.85)";
          ctx.lineWidth = 1.4;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(px, py, 3.2, 0, Math.PI * 2);
          ctx.fillStyle = "#7de2df";
          ctx.fill();
        }
      }

      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative aspect-square w-full">
      <canvas ref={canvasRef} className="size-full" aria-hidden />
    </div>
  );
}
