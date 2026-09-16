import { QuizSection } from "@/components/quiz/quiz-section";
import { SolutionCarousel } from "@/components/solution-carousel";
import { TripCalculator } from "@/components/trip-calculator";

export default function HomePage() {
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
              <a className="transition-colors hover:text-cold" href="#quiz">
                Подбор
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
        <QuizSection />

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

        {/* ============================== СВЯЗЬ ============================== */}
        {/* Пока только телефон. Форма обратной связи собирала бы персональные
            данные, а это отдельный набор обязанностей — уведомление в
            Роскомнадзор, опубликованная политика, HTTPS. До подключения
            партнёрских API смысла брать их на себя нет; готовая форма лежит
            в src/drafts. */}
        <section id="contacts" className="bg-night-2">
          <div className="mx-auto flex w-full max-w-[1320px] flex-col items-start gap-6 px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-cold">
              Обратная связь
            </span>
            <h2 className="max-w-[20ch] text-balance font-display text-[clamp(26px,3.6vw,44px)] font-extrabold leading-[1.08] tracking-[-0.04em] text-paper">
              Не сошлось с вашей поездкой? Позвоните
            </h2>
            <p className="max-w-[52ch] text-[15.5px] leading-relaxed text-paper/60">
              Сервис в бете, расчёт пока демонстрационный. Если цифры разошлись с тем, что вы
              потратили на самом деле, — это самое полезное, что можно сейчас рассказать.
            </p>

            <a
              href="tel:+79603782536"
              className="mt-2 inline-flex items-center rounded-field bg-cold px-7 py-4 font-display text-[clamp(21px,2.8vw,30px)] font-extrabold tracking-[-0.03em] text-night transition-colors hover:bg-cold-2"
            >
              +7 960 378-25-36
            </a>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-paper/55">
              Звонок или сообщение в мессенджере
            </span>
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
              <a className="transition-colors hover:text-cold" href="#contacts">
                Обратная связь
              </a>
              <a className="transition-colors hover:text-cold" href="tel:+79603782536">
                +7 960 378-25-36
              </a>
            </nav>
          </div>

          {/* ВНИМАНИЕ: перед запуском сюда нужно дописать ФИО и ИНН —
              без них подпись «самозанятая» никого не идентифицирует, а при
              маркировке рекламы эти данные всё равно придётся раскрыть. */}
          <p className="border-t border-paper/10 pt-8 text-[13px] leading-relaxed text-paper/55">
            Сайт ведёт самозанятая — плательщик налога на профессиональный доход.
            Телефон для связи: <a className="hover:text-cold" href="tel:+79603782536">+7 960 378-25-36</a>.
          </p>

          <p className="max-w-[80ch] text-[12.5px] leading-relaxed text-paper/35">
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
