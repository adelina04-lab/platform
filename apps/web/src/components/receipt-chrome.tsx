/**
 * Оторванный край чека. Рисуется вектором, а не градиентами: так зубцы
 * получаются ровно те, что задумано, и не зависят от округлений браузера.
 *
 * preserveAspectRatio="none" растягивает полосу по ширине контейнера —
 * зубцы становятся шире на широком экране и уже на узком, что для рваной
 * бумаги как раз естественно.
 */

const TEETH = 48;
const W = 96; // ширина системы координат: два шага на зубец
const H = 8;

function build(side: "top" | "bottom"): string {
  const step = W / TEETH;
  // Прямая сторона примыкает к бумаге, зубчатая смотрит наружу.
  const flat = side === "bottom" ? 0 : H;
  const spike = side === "bottom" ? H : 0;

  let d = `M0 ${flat} H${W}`;
  for (let i = TEETH - 1; i >= 0; i -= 1) {
    d += ` L${((i + 0.5) * step).toFixed(3)} ${spike} L${(i * step).toFixed(3)} ${flat}`;
  }
  return `${d} Z`;
}

const PATHS = { top: build("top"), bottom: build("bottom") } as const;

export function TornEdge({ side }: { side: "top" | "bottom" }) {
  return (
    <svg
      aria-hidden
      // Нахлёст в пиксель: без него между зубцами и бумагой на дробном
      // масштабе проступает тёмная щель.
      className={side === "top" ? "-mb-px block w-full" : "-mt-px block w-full"}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      role="presentation"
    >
      <path d={PATHS[side]} fill="var(--color-surface)" />
    </svg>
  );
}

/**
 * Штрихкод в подвале чека. Ширины полос выводятся из самой суммы, поэтому
 * рисунок меняется вместе с расчётом и одинаков на сервере и в браузере.
 */
export function Barcode({ seed }: { seed: number }) {
  const bars: number[] = [];
  let x = Math.abs(Math.round(seed)) || 1;
  for (let i = 0; i < 58; i += 1) {
    // Линейный конгруэнтный шаг: детерминированный, без Math.random.
    x = (x * 1103515245 + 12345) % 2147483648;
    bars.push(1 + ((x >>> 7) % 3));
  }

  return (
    <div aria-hidden className="flex h-10 items-stretch gap-[2px]">
      {bars.map((w, i) => (
        <span
          key={i}
          className="shrink-0 rounded-[1px] bg-ink"
          style={{ width: w, opacity: i % 2 === 0 ? 0.85 : 0.25 }}
        />
      ))}
    </div>
  );
}
