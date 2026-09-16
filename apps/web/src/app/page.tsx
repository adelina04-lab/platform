import { SolutionCarousel } from "@/components/solution-carousel";
import { TripCalculator } from "@/components/trip-calculator";
import { SEGMENT_COLORS, estimateDemo, formatMoney } from "@/lib/demo-estimate";

/* --------------------------------------------------------------------------
   Числа во всех секциях считает тот же демо-движок, что и калькулятор,
   поэтому страница внутренне непротиворечива.
-------------------------------------------------------------------------- */

const REFERENCE_INPUT = {
  destinationSlug: "turciya",
  month: 10,
  nights: 7,
  adults: 2,
  children: 1,
  hotelStars: 4 as const,
  allInclusive: true,
};

/** Что видно в рекламе тура против того, что уходит на самом деле. */
const COMPARISON: readonly { criterion: string; us: boolean; them: boolean }[] = [
  { criterion: "Считает трансфер, страховку и питание вне отеля", us: true, them: false },
  { criterion: "Показывает, сколько сэкономит сдвиг дат", us: true, them: false },
  { criterion: "Сравнивает пакетный тур с самостоятельной поездкой", us: true, them: false },
  { criterion: "Даёт диапазон, а не одну цифру", us: true, them: false },
  { criterion: "Пишет, что в расчёт не вошло", us: true, them: false },
  { criterion: "Просит телефон до результата", us: false, them: true },
  { criterion: "Продаёт вам что-то напрямую", us: false, them: true },
];

const STEPS = [
  {
    title: "Описываете поездку",
    text: "Шесть значений прямо в предложении: куда, когда, насколько, с кем и в какой отель. Ни регистрации, ни почты.",
  },
  {
    title: "Видите пропорции",
    text: "Перелёт — обычно меньше половины бюджета. Полоса показывает, какая часть денег на что уходит, ещё до того как вы начнёте считать.",
  },
  {
    title: "Меняете одно решение",
    text: "Сдвиг дат, звёздность, длительность, город вылета. Каждое решение сразу подписано суммой, которую оно стоит или экономит.",
  },
  {
    title: "Уходите бронировать",
    text: "Переход открывает выдачу партнёра с уже подставленными датами и составом. Вводить заново ничего не нужно.",
  },
] as const;

// ВРЕМЕННО: заготовки до первых настоящих отзывов. Публиковать выдуманные
// нельзя — заменить на реальные перед запуском (эпик E12).
const REVIEWS = [
  "Считала Турцию на троих в октябре. Сошлось почти в рубль с тем, что мы потратили, — разошлось тысяч на семь, и то из-за экскурсий.",
  "Полезнее всего оказалась строчка про сдвиг дат. Перенесли вылет на неделю позже и сэкономили примерно пятьдесят тысяч на том же отеле.",
  "Первый калькулятор, который честно пишет, чего в расчёте нет. Обычно про страховку вспоминаешь уже в аэропорту.",
] as const;

export default function HomePage() {
  const reference = estimateDemo(REFERENCE_INPUT);
  const refStandard = reference.tiers[1]!;
  const refTotal = refStandard.totalMinor;
  // Примерно то, что показывает витрина тура: перелёт плюс проживание.
  const advertised = refStandard.components
    .filter((c) => c.component === "flight" || c.component === "accommodation")
    .reduce((s, c) => s + c.amountMinor, 0);
  const hiddenShare = Math.round(((refTotal - advertised) / refTotal) * 100);

  return (
    <>
      {/* ============================== ГЕРОЙ ============================== */}
      <header id="top" className="bg-night">
        <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <nav className="flex items-center justify-between gap-4 border-b border-paper/10 py-5">
            <span className="font-display text-[17px] font-extrabold tracking-[-0.03em] text-paper">
              Итого
            </span>
            <div className="hidden items-center gap-7 text-[13.5px] text-paper/55 md:flex">
              <a className="transition-colors hover:text-cold" href="#gap">
                Зачем
              </a>
              <a className="transition-colors hover:text-cold" href="#how">
                Как считаем
              </a>
              <a className="transition-colors hover:text-cold" href="#solutions">
                Готовые сметы
              </a>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-paper/35">Бета</span>
          </nav>

          <div className="py-12 sm:py-16 lg:py-20">
            <TripCalculator />
          </div>
        </div>
      </header>

      <main>
        {/* ========================= РАЗРЫВ ОЖИДАНИЙ ========================= */}
        <section id="gap" className="bg-paper">
          <div className="mx-auto w-full max-w-[1320px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
            <h2 className="max-w-[24ch] text-balance font-display text-[clamp(28px,4.2vw,54px)] font-extrabold leading-[1.1] tracking-[-0.035em]">
              «Тур за {formatMoney(advertised)}» и поездка за {formatMoney(refTotal)} — это одно и то же
              путешествие
            </h2>

            <div className="mt-14 flex flex-col gap-10 lg:mt-20">
              <div className="flex flex-col gap-3">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-4">
                    Цена на витрине
                  </span>
                  <span className="tnum font-display text-[clamp(20px,2.4vw,30px)] font-bold tracking-[-0.03em] text-ink-4">
                    {formatMoney(advertised)}
                  </span>
                </div>
                <div
                  className="h-11 rounded-[6px] bg-muted sm:h-14"
                  style={{ width: `${Math.round((advertised / refTotal) * 100)}%` }}
                />
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-laguna-active">
                    Сколько уйдёт на самом деле
                  </span>
                  <span className="tnum font-display text-[clamp(20px,2.4vw,30px)] font-bold tracking-[-0.03em]">
                    {formatMoney(refTotal)}
                  </span>
                </div>
                <div className="flex h-11 w-full gap-1 sm:h-14">
                  {refStandard.components
                    .filter((c) => c.included && c.amountMinor > 0)
                    .sort((a, b) => b.amountMinor - a.amountMinor)
                    .map((c) => (
                      <span
                        key={c.component}
                        style={{
                          flexGrow: c.amountMinor / refTotal,
                          flexBasis: 0,
                          background: SEGMENT_COLORS[c.component].bg,
                        }}
                        className="rounded-[6px]"
                      />
                    ))}
                </div>
              </div>
            </div>

            <div className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
              <p className="tnum font-display text-[clamp(56px,9vw,120px)] font-extrabold leading-[0.85] tracking-[-0.05em] text-laguna">
                {hiddenShare}%
              </p>
              <div className="flex max-w-[58ch] flex-col gap-4 self-center text-[17px] leading-relaxed text-ink-3">
                <p>
                  Столько бюджета поездки не попадает в цену, по которой человек её выбирал. Трансфер,
                  страховка, обеды вне отеля, экскурсии, багаж, такси до аэропорта — по отдельности
                  мелочь, вместе — треть отпуска.
                </p>
                <p>
                  Мы считаем эти строки отдельно и показываем их долю сразу, а не в конце. Регистрации
                  нет, телефон не спрашиваем, продать вам ничего не можем.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ======================== МЫ / АГРЕГАТОРЫ ======================== */}
        <section className="bg-cold-3">
          <div className="mx-auto w-full max-w-[1320px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
              <h2 className="max-w-[16ch] text-balance font-display text-[clamp(26px,3.4vw,42px)] font-extrabold leading-[1.1] tracking-[-0.035em] text-laguna-deep">
                Разница не в дизайне, а в том, что посчитано
              </h2>

              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-laguna-deep/20">
                    <th className="pb-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-laguna-deep/55">
                      &nbsp;
                    </th>
                    <th className="w-20 pb-3 text-center font-display text-[13px] font-bold tracking-[-0.01em] text-laguna-deep sm:w-28">
                      Итого
                    </th>
                    <th className="w-20 pb-3 text-center font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-laguna-deep/55 sm:w-28">
                      Витрина тура
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row) => (
                    <tr key={row.criterion} className="border-b border-laguna-deep/10">
                      <td className="py-3.5 pr-4 text-[14.5px] leading-snug text-laguna-deep">
                        {row.criterion}
                      </td>
                      <td className="py-3.5 text-center">
                        <Mark on={row.us} />
                      </td>
                      <td className="py-3.5 text-center">
                        <Mark on={row.them} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* =========================== КАК СЧИТАЕМ =========================== */}
        <section id="how" className="bg-surface">
          <div className="mx-auto w-full max-w-[1320px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
            <h2 className="max-w-[20ch] text-balance font-display text-[clamp(26px,3.4vw,42px)] font-extrabold leading-[1.1] tracking-[-0.035em]">
              Четыре шага, полторы минуты
            </h2>

            <ol className="mt-12 flex flex-col lg:mt-16">
              {STEPS.map((s, i) => (
                <li
                  key={s.title}
                  className="grid gap-x-8 gap-y-3 border-t border-line py-8 sm:grid-cols-[72px_minmax(0,20ch)_1fr] sm:items-baseline lg:gap-x-14"
                >
                  <span className="tnum font-display text-[clamp(30px,4vw,46px)] font-extrabold leading-none tracking-[-0.04em] text-cold-2">
                    {i + 1}
                  </span>
                  <h3 className="font-display text-[19px] font-bold leading-snug tracking-[-0.025em]">
                    {s.title}
                  </h3>
                  <p className="max-w-[62ch] text-[15.5px] leading-relaxed text-ink-3">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ======================== ГОТОВЫЕ СМЕТЫ ======================== */}
        <section id="solutions" className="bg-paper">
          <div className="mx-auto w-full max-w-[1320px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
            <div className="flex flex-col items-center gap-4 text-center">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-laguna-hover">
                Готовые решения
              </span>
              <h2 className="max-w-[20ch] text-balance font-display text-[clamp(26px,3.4vw,44px)] font-extrabold leading-[1.08] tracking-[-0.035em]">
                Типовые поездки, уже посчитанные целиком
              </h2>
              <p className="max-w-[56ch] text-[16px] leading-relaxed text-ink-3">
                Выберите направление — увидите смету на поездку, какой её обычно берут: с привычным
                месяцем, длительностью и составом. Дальше её можно поменять под себя.
              </p>
            </div>

            <div className="mt-12 lg:mt-16">
              <SolutionCarousel />
            </div>
          </div>
        </section>

        {/* ============================== ОТЗЫВЫ ============================== */}
        <section className="bg-surface">
          <div className="mx-auto w-full max-w-[1320px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <h2 className="font-display text-[clamp(26px,3.4vw,42px)] font-extrabold leading-[1.1] tracking-[-0.035em]">
                Что говорят о расчётах
              </h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-4">
                блок-заготовка
              </span>
            </div>

            <div className="mt-10 grid gap-8 md:grid-cols-3 lg:mt-14 lg:gap-12">
              {REVIEWS.map((text) => (
                <figure key={text} className="flex flex-col gap-5">
                  <span aria-hidden className="h-1 w-10 rounded-full bg-line" />
                  <blockquote className="text-[16px] leading-relaxed text-ink-4">{text}</blockquote>
                  <figcaption className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-4">
                    Место для настоящего отзыва
                  </figcaption>
                </figure>
              ))}
            </div>

            <p className="mt-10 max-w-[70ch] text-[13.5px] leading-relaxed text-ink-4">
              Секция намеренно не заполнена до первых настоящих отзывов: выдуманные — недобросовестная
              реклама, и проверяют их первым делом.
            </p>
          </div>
        </section>

        {/* ============================== ПРИЗЫВ ============================== */}
        <section className="bg-night">
          <div className="mx-auto flex w-full max-w-[1320px] flex-col items-start gap-8 px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
            <h2 className="max-w-[16ch] text-balance font-display text-[clamp(30px,5vw,64px)] font-extrabold leading-[1.05] tracking-[-0.04em] text-paper">
              Посчитайте поездку целиком
            </h2>
            <p className="max-w-[54ch] text-[17px] leading-relaxed text-paper/55">
              Полторы минуты, без регистрации. Расчёт можно сохранить и вернуться к нему, когда цены
              изменятся.
            </p>
            <a
              href="#top"
              className="inline-flex h-12 items-center rounded-field bg-cold px-7 text-[15px] font-semibold text-night transition-colors hover:bg-cold-2"
            >
              Наверх, к калькулятору
            </a>
          </div>
        </section>
      </main>

      {/* ============================== ПОДВАЛ ============================== */}
      <footer className="border-t border-paper/10 bg-night">
        <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-10 px-5 py-14 sm:px-8 lg:px-12">
          <div className="flex flex-wrap items-start justify-between gap-10">
            <div className="flex flex-col gap-2">
              <span className="font-display text-[17px] font-extrabold tracking-[-0.03em] text-paper">
                Итого
              </span>
              <span className="text-[13.5px] text-paper/45">
                Полная стоимость поездки, а не цена тура
              </span>
            </div>
            <nav className="flex flex-col gap-2.5 text-[14px] text-paper/55">
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

          <p className="max-w-[80ch] border-t border-paper/10 pt-8 text-[12.5px] leading-relaxed text-paper/35">
            Сервис не продаёт туры и не принимает платежи. Переходы к партнёрам — Яндекс Путешествия,
            Level.Travel, Cherehapa, Kiwitaxi — содержат партнёрские ссылки: партнёр платит комиссию с
            состоявшегося бронирования, на цену для вас это не влияет. Цены в расчётах на этой странице
            демонстрационные.
          </p>
        </div>
      </footer>
    </>
  );
}

/** Отметка в таблице сравнения: заполненный кружок или прочерк. */
function Mark({ on }: { on: boolean }) {
  return on ? (
    <span
      aria-label="да"
      className="inline-block size-3 rounded-full bg-laguna ring-4 ring-laguna/20"
    />
  ) : (
    <span aria-label="нет" className="inline-block h-px w-4 bg-laguna-deep/30 align-middle" />
  );
}
