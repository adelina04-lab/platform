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
      // Берём меньшую сторону: колонка бывает низкой и широкой, и квадратный
      // холст по ширине попросту не помещался — шар резало сверху и снизу.
      size = Math.max(120, Math.min(wrap.clientWidth, wrap.clientHeight));
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(wrap);

    let frame = 0;
    let last = performance.now();

    /** Раскрутка к выбранной точке: не подмена кадра, а настоящий оборот. */
    interface Spin {
      fromLon: number;
      fromLat: number;
      dLon: number;
      dLat: number;
      t: number;
      dur: number;
    }

    let spin: Spin | null = null;
    let lastGoal: { lon: number; lat: number } | null = null;
    let pin = 0; // 0 — метки нет, 1 — метка села

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const goal = targetRef.current;
      if (goal?.lon !== lastGoal?.lon || goal?.lat !== lastGoal?.lat) {
        lastGoal = goal ? { ...goal } : null;
        pin = 0;
        if (goal) {
          // Всегда крутим на восток и добавляем полный оборот: иначе переход
          // из Турции в Египет — это четыре градуса, и вращения не видно.
          const forward = (((goal.lon - rotation.lon) % 360) + 360) % 360;
          spin = {
            fromLon: rotation.lon,
            fromLat: rotation.lat,
            dLon: forward + 360,
            dLat: goal.lat - rotation.lat,
            t: 0,
            dur: reduce ? 0.001 : 2.2,
          };
        } else {
          spin = null;
        }
      }

      if (spin) {
        spin.t = Math.min(1, spin.t + dt / spin.dur);
        const e = easeInOutCubic(spin.t);
        rotation.lon = spin.fromLon + spin.dLon * e;
        rotation.lat = spin.fromLat + spin.dLat * e;
        // Метка садится на последней четверти оборота, когда точка уже
        // выехала на видимую сторону.
        pin = Math.max(0, Math.min(1, (spin.t - 0.72) / 0.28));
        if (spin.t >= 1) spin = null;
      } else if (goal) {
        pin = 1;
        // Шар продолжает поворачиваться и после остановки, но качается вокруг
        // выбранной точки: вращение видно, а метка не уходит на обратную
        // сторону, как было бы при равномерном вращении.
        rotation.lon = goal.lon + (reduce ? 0 : Math.sin(now / 5200) * 26);
        rotation.lat = goal.lat + (reduce ? 0 : Math.sin(now / 8300) * 5);
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

      if (goal && pin > 0) {
        const pt = project(goal.lon, goal.lat, rotation);
        if (pt.visible) {
          const px = cx + r * pt.x;
          // Метка не проявляется, а падает сверху — так видно, что её ставят.
          const py = cy - r * pt.y - (1 - pin) * 26;
          const grow = easeInOutCubic(pin);
          const pulse = reduce ? 0.5 : (Math.sin(now / 620) + 1) / 2;

          if (pin >= 1) {
            ctx.beginPath();
            ctx.arc(px, py, 7 + pulse * 13, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(125,226,223,${0.22 * (1 - pulse)})`;
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(px, py, 7 * grow, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(125,226,223,${0.85 * grow})`;
          ctx.lineWidth = 1.4;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(px, py, 3.2 * grow, 0, Math.PI * 2);
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
    <div ref={wrapRef} className="flex size-full items-center justify-center">
      <canvas ref={canvasRef} aria-hidden />
    </div>
  );
}
