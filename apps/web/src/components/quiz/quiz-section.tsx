"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Globe } from "@/components/quiz/globe";
import { BudgetStage, PriorityStage, SeasonStage, TravellersStage } from "@/components/quiz/stages";
import { PartnerDeck } from "@/components/quiz/partner-deck";
import { formatMoney, plural } from "@/lib/demo-estimate";
import {
  INITIAL_ANSWERS,
  PARTNERS,
  QUIZ_PLACES,
  QUIZ_STEPS,
  type QuizAnswers,
  type QuizStepId,
} from "@/lib/quiz";

/** Сколько смотреть на ответившую картинку, прежде чем ехать к следующему вопросу. */
const ADVANCE_DELAY = 900;

type Answered = Record<QuizStepId, boolean>;

const NOTHING_ANSWERED: Answered = {
  destination: false,
  travellers: false,
  budget: false,
  season: false,
  priority: false,
};

export function QuizSection() {
  const [answers, setAnswers] = useState<QuizAnswers>(INITIAL_ANSWERS);
  const [answered, setAnswered] = useState<Answered>(NOTHING_ANSWERED);
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const step = QUIZ_STEPS[current]!;
  const answeredCount = QUIZ_STEPS.filter((s) => answered[s.id]).length;
  const done = answeredCount === QUIZ_STEPS.length;
  const people = answers.adults + answers.children;

  const advance = () => setCurrent((i) => (i + 1 < QUIZ_STEPS.length ? i + 1 : i));

  /** Выбор варианта: отмечаем ответ и через паузу едем дальше. */
  const pick = (value: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setAnswers((prev) => ({ ...prev, [step.id]: value }));
    setAnswered((prev) => ({ ...prev, [step.id]: true }));

    // Пауза нужна, чтобы человек увидел, как картинка справа отозвалась на
    // его ответ. Без неё вопрос сменяется раньше, чем доедет глобус.
    timerRef.current = setTimeout(advance, ADVANCE_DELAY);
  };

  /** Шаги со своим управлением: сами вперёд не переключаются. */
  const tune = (patch: Partial<QuizAnswers>) => {
    setAnswers((prev) => ({ ...prev, ...patch }));
    setAnswered((prev) => ({ ...prev, [step.id]: true }));
  };

  const goTo = (index: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrent(index);
  };

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setAnswers(INITIAL_ANSWERS);
    setAnswered(NOTHING_ANSWERED);
    setCurrent(0);
  };

  /** Значение шага с выбором варианта. У счётчика и ползунка его нет. */
  const optionValue = (id: QuizStepId): string | null => {
    if (id === "destination") return answers.destination;
    if (id === "season") return answers.season;
    if (id === "priority") return answers.priority;
    return null;
  };

  /** Короткая запись ответа для свёрнутой строки слева. */
  const summary = (id: QuizStepId): string => {
    if (!answered[id]) return "—";
    switch (id) {
      case "travellers": {
        const adults = `${answers.adults} ${plural(answers.adults, "взрослый", "взрослых", "взрослых")}`;
        return answers.children > 0
          ? `${adults}, ${answers.children} ${plural(answers.children, "ребёнок", "ребёнка", "детей")}`
          : adults;
      }
      case "budget":
        return formatMoney(answers.budget * 100);
      default: {
        const value = optionValue(id);
        return (
          QUIZ_STEPS.find((s) => s.id === id)?.options?.find((o) => o.value === value)?.label ?? "—"
        );
      }
    }
  };

  // На какой витрине остановить ленту. Если шагу отвечают несколько витрин,
  // ответы сами выбирают одну — так лента не замирает каждый раз на той же.
  const deckTarget = useMemo(() => {
    if (!answered[step.id]) return null;
    const matching = PARTNERS.map((p, i) => ({ p, i })).filter((x) => x.p.settlesOn === step.id);
    if (!matching.length) return null;
    const seed = `${answers.destination}${answers.adults}${answers.budget}${answers.season}${answers.priority}`;
    const pickIndex =
      seed.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % matching.length;
    return matching[pickIndex]!.i;
  }, [answered, step.id, answers]);

  const place = answers.destination ? QUIZ_PLACES[answers.destination] : undefined;

  const stage = () => {
    switch (step.id) {
      case "destination":
        return <Globe target={place ? { lon: place.lon, lat: place.lat } : null} dimmed={!place} />;
      case "travellers":
        return (
          <TravellersStage
            adults={answers.adults}
            kids={answers.children}
            onChange={(next) => tune(next)}
          />
        );
      case "budget":
        return (
          <BudgetStage
            budget={answers.budget}
            people={people}
            onChange={(v) => tune({ budget: v })}
          />
        );
      case "season":
        return <SeasonStage season={answers.season} />;
      case "priority":
        return <PriorityStage priority={answers.priority} />;
      default:
        return null;
    }
  };

  const stageCaption = () => {
    if (step.id === "destination") {
      const label = QUIZ_STEPS[0]!.options?.find((o) => o.value === answers.destination)?.label;
      return place && label ? `${label} · ${place.spot}` : "Точка появится после ответа";
    }
    return answered[step.id] ? summary(step.id) : step.hint;
  };

  return (
    <section id="quiz" className="bg-night-2">
      <div className="mx-auto w-full max-w-[1320px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        {/* Заголовок во всю ширину: подпись уходит вправо, а не под него. */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-14">
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-cold">
              Подбор поездки
            </span>
            <h2 className="text-balance font-display text-[clamp(22px,2.8vw,34px)] font-extrabold leading-[1.1] tracking-[-0.035em] text-paper">
              Пять вопросов — и видно, что вам подходит
            </h2>
          </div>
          <p className="max-w-[54ch] text-[14.5px] leading-relaxed text-paper/60">
            Отвечайте слева. Справа каждый ответ сразу что-то меняет: глобус доворачивается к
            точке, счётчик собирает компанию, ползунок показывает, сколько выходит на человека.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12">
          {/* --------------------------- ВОПРОСЫ --------------------------- */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-paper/60">
                Шаг {current + 1} из {QUIZ_STEPS.length}
              </span>
              <span className="h-px flex-1 bg-paper/12">
                <span
                  className="block h-px bg-cold transition-[width] duration-500"
                  style={{ width: `${(answeredCount / QUIZ_STEPS.length) * 100}%` }}
                />
              </span>
            </div>

            <ol className="flex flex-col gap-2.5">
              {QUIZ_STEPS.map((s, i) => {
                if (i !== current) {
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => goTo(i)}
                        className="flex w-full items-center gap-4 rounded-card border border-paper/10 px-4 py-3.5 text-left transition-colors hover:border-cold/50 sm:px-5"
                      >
                        <span className="tnum shrink-0 font-mono text-[11px] text-paper/45">
                          0{i + 1}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[14px] text-paper/55">
                          {s.question}
                        </span>
                        <span
                          className={`shrink-0 text-[13.5px] font-bold ${
                            answered[s.id] ? "text-cold" : "text-paper/30"
                          }`}
                        >
                          {summary(s.id)}
                        </span>
                      </button>
                    </li>
                  );
                }

                return (
                  <li
                    key={s.id}
                    className="rounded-card border border-cold/35 bg-paper/5 px-4 py-6 sm:px-6"
                  >
                    <span className="tnum font-mono text-[11px] tracking-[0.12em] text-cold">
                      0{i + 1}
                    </span>
                    <h3 className="mt-2 font-display text-[clamp(19px,2.2vw,26px)] font-extrabold leading-tight tracking-[-0.035em] text-paper">
                      {s.question}
                    </h3>
                    <p className="mt-2 text-[13px] leading-snug text-paper/55">{s.hint}</p>

                    {s.kind === "options" ? (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {s.options!.map((o) => {
                          const active = o.value === optionValue(s.id);
                          return (
                            <button
                              key={o.value}
                              type="button"
                              onClick={() => pick(o.value)}
                              aria-pressed={active}
                              className={`flex flex-col items-start gap-0.5 rounded-field border px-4 py-2.5 text-left transition-colors ${
                                active
                                  ? "border-cold bg-cold text-night"
                                  : "border-paper/15 text-paper/85 hover:border-cold hover:text-cold"
                              }`}
                            >
                              <span className="text-[14px] font-bold">{o.label}</span>
                              {o.note && (
                                <span
                                  className={`text-[11.5px] ${
                                    active ? "text-night/70" : "text-paper/55"
                                  }`}
                                >
                                  {o.note}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      /* Управление у таких шагов живёт на панели подбора,
                         поэтому здесь только текущее значение и переход дальше. */
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-[14px] text-paper/60">
                          Сейчас: <span className="font-bold text-cold">{summary(s.id)}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setAnswered((prev) => ({ ...prev, [s.id]: true }));
                            advance();
                          }}
                          className="rounded-field bg-laguna px-5 py-2.5 text-[13.5px] font-semibold text-paper transition-colors hover:bg-laguna-hover"
                        >
                          Дальше
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>

            {done && (
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-cold/35 px-5 py-4">
                <p className="max-w-[46ch] text-[13.5px] leading-snug text-paper/65">
                  Ответы собраны. Подборку покажем, когда подключим витрины партнёров — сейчас
                  карточки рядом только показывают, как это будет работать.
                </p>
                <button
                  type="button"
                  onClick={reset}
                  className="shrink-0 rounded-field border border-paper/20 px-4 py-2 text-[13px] font-semibold text-paper/80 transition-colors hover:border-cold hover:text-cold"
                >
                  Пройти заново
                </button>
              </div>
            )}
          </div>

          {/* ---------------------- ПАНЕЛЬ ПОДБОРА ---------------------- */}
          {/* h-full у колонки и flex-1 у сцены: правая половина ровно той же
              высоты, что и левая, а разницу забирает картинка. */}
          <div className="flex h-full flex-col gap-4">
            <div className="relative flex min-h-[282px] flex-1 items-center justify-center overflow-hidden rounded-modal border border-paper/10 bg-night p-5">
              {/* Мягкое свечение под сценой — чтобы тёмный прямоугольник не
                  выглядел дырой в секции. */}
              <span
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 size-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60"
                style={{
                  background: "radial-gradient(circle, rgba(53,172,190,.3), transparent 70%)",
                }}
              />
              <div className="relative flex size-full items-center justify-center">{stage()}</div>
            </div>

            <div className="flex items-baseline justify-between gap-4">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-paper/55">
                {step.question}
              </span>
              <span className="shrink-0 text-[13.5px] font-bold text-cold">{stageCaption()}</span>
            </div>

            {/* ------------------------ ВИТРИНЫ ------------------------ */}
            <div className="mt-2 flex flex-col gap-3 border-t border-paper/10 pt-5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1">
                <h3 className="font-display text-[16px] font-bold tracking-[-0.025em] text-paper">
                  Где будем искать
                </h3>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-paper/55">
                  лента тормозит на подходящей витрине
                </span>
              </div>

              <PartnerDeck targetIndex={deckTarget} />

              <p className="text-[11.5px] leading-snug text-paper/55">
                Макет: ни одна партнёрская программа пока не подключена, поэтому в карточках нет ни
                цен, ни ссылок. На месте заставок встанут логотипы — их выдают вместе с бренд-китом
                и только после одобрения заявки.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
