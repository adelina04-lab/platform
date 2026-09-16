import type { ReactNode } from "react";
import { TripCalculator } from "@/components/trip-calculator";
import { estimateDemo, formatMoney, MONTHS_PREPOSITIONAL } from "@/lib/demo-estimate";

/* --------------------------------------------------------------------------
   Содержимое секций. Тексты настоящие; числа в примерах считаются тем же
   демо-движком, что и калькулятор, поэтому страница внутренне непротиворечива.
-------------------------------------------------------------------------- */

const ADVANTAGES = [
  {
    title: "Стоимость дверь-в-дверь",
    text: "Агрегатор показывает цену тура. Мы считаем, что вы потратите на самом деле: с трансфером, питанием вне отеля, страховкой, экскурсиями и такси до аэропорта. Разница обычно от четверти до трети сверху.",
  },
  {
    title: "Сколько стоит решение",
    text: "Не просто «отпуск стоит 240 000», а «сдвиньте вылет на десять дней — сэкономите 47 000». Считаем соседние варианты и показываем, где деньги лежат на поверхности.",
  },
  {
    title: "Тур или самостоятельно",
    text: "Честное сравнение пакета с раздельной покупкой билетов, отеля и трансфера. Мы зарабатываем на обеих ветках одинаково, поэтому нам всё равно, что вы выберете.",
  },
  {
    title: "Диапазон, а не одна цифра",
    text: "Эконом, средний и комфорт с разбивкой по каждому компоненту. Точная сумма за три месяца до поездки — это обещание, которое никто не может сдержать.",
  },
  {
    title: "Видно, что не входит",
    text: "Под каждым расчётом список того, что мы не посчитали, и дата, на которую собраны цены. Скрытых допущений нет — методика расчёта открыта.",
  },
  {
    title: "Мы ничего вам не продаём",
    text: "Бронирование происходит на сайте Яндекс Путешествий, Level.Travel или другого партнёра. Комиссию платит партнёр, цена для вас не меняется.",
  },
] as const;

const STEPS = [
  {
    n: "01",
    title: "Опишите поездку",
    text: "Направление, месяц, длительность, состав и уровень отеля. Шесть значений, без регистрации и без ввода почты.",
  },
  {
    n: "02",
    title: "Получите смету",
    text: "Семь строк расходов с суммами и пояснениями, итог в трёх уровнях и ссылка на расчёт, которой можно поделиться.",
  },
  {
    n: "03",
    title: "Посмотрите, где сэкономить",
    text: "Сдвиг дат, звёздность отеля, длительность, город вылета — показываем, сколько стоит каждое из этих решений.",
  },
  {
    n: "04",
    title: "Бронируйте у партнёра",
    text: "Переход открывает выдачу с уже подставленными датами и составом. Вводить заново ничего не нужно.",
  },
] as const;

// ВРЕМЕННО: тексты-заготовки до первых настоящих отзывов. Публиковать
// выдуманные отзывы нельзя — заменить на реальные перед запуском (эпик E12).
const REVIEWS = [
  {
    text: "Считала Турцию на троих в октябре. Сошлось почти в рубль с тем, что мы в итоге потратили, — разошлось тысяч на семь, и то из-за экскурсий.",
    author: "Место для настоящего отзыва",
    detail: "Заменить после запуска",
  },
  {
    text: "Полезнее всего оказалась строчка про сдвиг дат. Перенесли вылет на неделю позже и сэкономили примерно пятьдесят тысяч на том же отеле.",
    author: "Место для настоящего отзыва",
    detail: "Заменить после запуска",
  },
  {
    text: "Первый калькулятор, который честно пишет, чего в расчёте нет. Обычно про страховку и трансфер вспоминаешь уже в аэропорту.",
    author: "Место для настоящего отзыва",
    detail: "Заменить после запуска",
  },
] as const;

const EXAMPLE_INPUTS = [
  {
    destinationSlug: "turciya",
    month: 10,
    nights: 7,
    adults: 2,
    children: 1,
    hotelStars: 4 as const,
    allInclusive: true,
  },
  {
    destinationSlug: "egipet",
    month: 1,
    nights: 10,
    adults: 2,
    children: 0,
    hotelStars: 5 as const,
    allInclusive: true,
  },
  {
    destinationSlug: "sochi",
    month: 6,
    nights: 5,
    adults: 2,
    children: 2,
    hotelStars: 4 as const,
    allInclusive: false,
  },
];

const EXAMPLE_COMPONENT_LABELS: Record<string, string> = {
  flight: "Перелёт",
  accommodation: "Проживание",
  food: "Питание вне отеля",
  transfer: "Трансфер",
  insurance: "Страховка",
  excursions: "Экскурсии",
  visa: "Виза и сборы",
};

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-laguna-hover">{children}</span>
  );
}

export default function HomePage() {
  const examples = EXAMPLE_INPUTS.map((input) => ({ input, estimate: estimateDemo(input) }));

  return (
    <>
      {/* ============================== ГЕРОЙ ============================== */}
      <header className="bg-night">
        <div className="mx-auto flex max-w-[1160px] flex-col px-5 sm:px-7">
          <nav className="flex items-center justify-between gap-4 py-6">
            <span className="font-display text-lg font-bold tracking-[-0.02em] text-paper">Итого</span>
            <div className="hidden items-center gap-8 text-[14px] text-paper/60 md:flex">
              <a className="transition-colors hover:text-cold" href="#how">
                Как это работает
              </a>
              <a className="transition-colors hover:text-cold" href="#why">
                Чем отличаемся
              </a>
              <a className="transition-colors hover:text-cold" href="#examples">
                Примеры
              </a>
            </div>
            <span className="rounded-full border border-paper/20 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-paper/50">
              Бета
            </span>
          </nav>

          <div className="py-10 sm:py-14 lg:py-16">
            <TripCalculator />
          </div>
        </div>
      </header>

      <main>
        {/* ============================ О ПРОЕКТЕ ============================ */}
        <section className="border-b border-line">
          <div className="mx-auto grid max-w-[1160px] gap-10 px-5 py-16 sm:px-7 lg:grid-cols-[1fr_0.85fr] lg:gap-20 lg:py-24">
            <div className="flex flex-col gap-6">
              <SectionLabel>О проекте</SectionLabel>
              <h2 className="max-w-[16ch] text-balance font-display text-[clamp(26px,3.4vw,42px)] font-bold leading-[1.12] tracking-[-0.025em]">
                Цена тура — это ещё не стоимость поездки
              </h2>
              <div className="flex max-w-[62ch] flex-col gap-4 text-[17px] leading-relaxed text-ink-3">
                <p>
                  Человек видит «тур в Турцию от 140 000» и планирует бюджет от этой цифры. Потом
                  добавляются трансфер, страховка, обеды вне отеля, экскурсии, такси до аэропорта и
                  багаж — и поездка выходит на четверть дороже, чем он рассчитывал.
                </p>
                <p>
                  Мы собираем цены по каждому компоненту отдельно и показываем итог целиком. Без
                  регистрации, без «оставьте телефон» и без обещания точной суммы там, где её знать
                  невозможно.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 self-start lg:grid-cols-1">
              {[
                { value: "7", label: "компонентов в расчёте" },
                { value: "15", label: "направлений на старте" },
                { value: "0 ₽", label: "берём с вас за расчёт" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col gap-1 rounded-card border border-line bg-surface p-5 shadow-card"
                >
                  <span className="tnum font-display text-[32px] font-bold leading-none tracking-[-0.03em] text-laguna">
                    {stat.value}
                  </span>
                  <span className="text-[13px] leading-snug text-ink-3">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================== УТП ============================== */}
        <section id="why" className="border-b border-line bg-surface">
          <div className="mx-auto flex max-w-[1160px] flex-col gap-10 px-5 py-16 sm:px-7 lg:py-24">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
              <div className="flex flex-col gap-3">
                <SectionLabel>Чем отличаемся</SectionLabel>
                <h2 className="font-display text-[clamp(24px,3vw,34px)] font-bold tracking-[-0.025em]">
                  Шесть вещей, которых нет у агрегаторов
                </h2>
              </div>
              <span className="font-mono text-[12px] text-ink-4">и не появится — им это невыгодно</span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {ADVANTAGES.map((a, i) => (
                <article
                  key={a.title}
                  className="flex flex-col gap-3 rounded-card border border-line bg-paper p-6 transition-colors hover:border-laguna"
                >
                  <span className="font-mono text-[11px] tracking-[0.1em] text-laguna">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-[19px] font-semibold leading-snug tracking-[-0.02em]">
                    {a.title}
                  </h3>
                  <p className="text-[14.5px] leading-relaxed text-ink-3">{a.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* =========================== КАК РАБОТАЕТ =========================== */}
        <section id="how" className="border-b border-line">
          <div className="mx-auto flex max-w-[1160px] flex-col gap-10 px-5 py-16 sm:px-7 lg:py-24">
            <div className="flex flex-col gap-3">
              <SectionLabel>Как это работает</SectionLabel>
              <h2 className="max-w-[18ch] text-balance font-display text-[clamp(24px,3vw,34px)] font-bold tracking-[-0.025em]">
                Четыре шага, полторы минуты
              </h2>
            </div>

            <ol className="grid gap-px overflow-hidden rounded-card border border-line bg-line md:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s) => (
                <li key={s.n} className="flex flex-col gap-3 bg-surface p-6">
                  <span className="tnum font-mono text-[13px] text-laguna">{s.n}</span>
                  <h3 className="font-display text-[18px] font-semibold leading-snug tracking-[-0.02em]">
                    {s.title}
                  </h3>
                  <p className="text-[14px] leading-relaxed text-ink-3">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ============================= ПРИМЕРЫ ============================= */}
        <section id="examples" className="border-b border-line bg-surface">
          <div className="mx-auto flex max-w-[1160px] flex-col gap-10 px-5 py-16 sm:px-7 lg:py-24">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
              <div className="flex flex-col gap-3">
                <SectionLabel>Примеры расчётов</SectionLabel>
                <h2 className="font-display text-[clamp(24px,3vw,34px)] font-bold tracking-[-0.025em]">
                  Как выглядит готовая смета
                </h2>
              </div>
              <span className="rounded-full bg-cold-3 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-laguna-active">
                Демо-цены
              </span>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {examples.map(({ input, estimate }) => {
                const standard = estimate.tiers[1]!;
                const people = input.adults + input.children;
                const top = [...standard.components]
                  .filter((c) => c.included)
                  .sort((a, b) => b.amountMinor - a.amountMinor)
                  .slice(0, 3);

                return (
                  <article
                    key={estimate.destination.slug}
                    className="flex flex-col gap-5 rounded-card border border-line bg-paper p-6"
                  >
                    <div className="flex flex-col gap-1.5">
                      <h3 className="font-display text-[22px] font-bold tracking-[-0.025em]">
                        {estimate.destination.name}
                      </h3>
                      <p className="font-mono text-[11.5px] text-ink-4">
                        {MONTHS_PREPOSITIONAL[input.month - 1]} · {input.nights} ночей · {people} чел. ·{" "}
                        {input.hotelStars}★
                      </p>
                    </div>

                    <ul className="flex flex-col gap-2">
                      {top.map((c) => (
                        <li key={c.component} className="flex items-baseline justify-between gap-3">
                          <span className="text-[13.5px] text-ink-3">
                            {EXAMPLE_COMPONENT_LABELS[c.component] ?? c.component}
                          </span>
                          <span className="tnum text-[13.5px] font-medium text-ink-2">
                            {formatMoney(c.amountMinor)}
                          </span>
                        </li>
                      ))}
                      <li className="text-[13px] text-ink-4">и ещё четыре строки</li>
                    </ul>

                    <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-4">
                      <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-4">
                        Итого
                      </span>
                      <span className="tnum font-display text-[26px] font-bold leading-none tracking-[-0.03em]">
                        {formatMoney(standard.totalMinor)}
                      </span>
                    </div>

                    {estimate.savings[0] && (
                      <p className="rounded-field bg-cold-4 px-3.5 py-2.5 text-[13px] text-laguna-active">
                        {estimate.savings[0].change} — минус {formatMoney(estimate.savings[0].savesMinor)}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================== ОТЗЫВЫ ============================== */}
        <section className="border-b border-line">
          <div className="mx-auto flex max-w-[1160px] flex-col gap-10 px-5 py-16 sm:px-7 lg:py-24">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex flex-col gap-3">
                <SectionLabel>Отзывы</SectionLabel>
                <h2 className="font-display text-[clamp(24px,3vw,34px)] font-bold tracking-[-0.025em]">
                  Что говорят о расчётах
                </h2>
              </div>
              <span className="rounded-full border border-line bg-muted px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-4">
                Блок-заготовка
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {REVIEWS.map((r) => (
                <figure
                  key={r.text}
                  className="flex flex-col gap-5 rounded-card border border-dashed border-line bg-surface p-6"
                >
                  <blockquote className="text-[15px] leading-relaxed text-ink-2">«{r.text}»</blockquote>
                  <figcaption className="mt-auto flex flex-col gap-0.5 border-t border-line-soft pt-4">
                    <span className="text-[14px] font-semibold text-ink-4">{r.author}</span>
                    <span className="font-mono text-[11px] text-ink-4">{r.detail}</span>
                  </figcaption>
                </figure>
              ))}
            </div>

            <p className="max-w-[70ch] text-[13.5px] leading-relaxed text-ink-4">
              Секция намеренно оставлена незаполненной до первых настоящих отзывов. Выдуманные отзывы —
              недобросовестная реклама, и проверяют их первым делом.
            </p>
          </div>
        </section>

        {/* ============================== ПРИЗЫВ ============================== */}
        <section className="bg-night">
          <div className="mx-auto flex max-w-[1160px] flex-col items-start gap-7 px-5 py-16 sm:px-7 lg:py-24">
            <h2 className="max-w-[18ch] text-balance font-display text-[clamp(28px,4vw,46px)] font-bold leading-[1.1] tracking-[-0.03em] text-paper">
              Посчитайте свою поездку целиком
            </h2>
            <p className="max-w-[58ch] text-[17px] leading-relaxed text-paper/60">
              Полторы минуты, без регистрации. Расчёт можно сохранить и вернуться к нему, когда цены
              изменятся.
            </p>
            <a
              href="#top"
              className="inline-flex h-12 items-center rounded-field bg-cold px-6 text-[15px] font-semibold text-night transition-colors hover:bg-cold-2"
            >
              Открыть калькулятор
            </a>
          </div>
        </section>
      </main>

      {/* ============================== ПОДВАЛ ============================== */}
      <footer className="bg-night-2">
        <div className="mx-auto flex max-w-[1160px] flex-col gap-8 px-5 py-12 sm:px-7">
          <div className="flex flex-wrap items-start justify-between gap-8">
            <div className="flex flex-col gap-2">
              <span className="font-display text-lg font-bold tracking-[-0.02em] text-paper">Итого</span>
              <span className="text-[13.5px] text-paper/50">Полная стоимость поездки, а не цена тура</span>
            </div>
            <nav className="flex flex-col gap-2 text-[14px] text-paper/60">
              <a className="transition-colors hover:text-cold" href="#">
                Как мы считаем
              </a>
              <a className="transition-colors hover:text-cold" href="#">
                Источники цен
              </a>
              <a className="transition-colors hover:text-cold" href="#">
                Политика обработки данных
              </a>
            </nav>
          </div>

          <p className="max-w-[80ch] border-t border-paper/10 pt-6 text-[12.5px] leading-relaxed text-paper/40">
            Сервис не продаёт туры и не принимает платежи. Переходы к партнёрам — Яндекс Путешествия,
            Level.Travel, Cherehapa, Kiwitaxi — содержат партнёрские ссылки: партнёр платит нам
            комиссию с состоявшегося бронирования, на цену для вас это не влияет. Цены в расчётах на
            этой странице демонстрационные.
          </p>
        </div>
      </footer>
    </>
  );
}
