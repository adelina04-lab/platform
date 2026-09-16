"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Globe } from "@/components/quiz/globe";
import {
  BudgetStage,
  PriorityStage,
  SeasonStage,
  TravellersStage,
} from "@/components/quiz/stages";
import { PartnerDeck } from "@/components/quiz/partner-deck";
import { PARTNERS, QUIZ_PLACES, QUIZ_STEPS, type QuizAnswers } from "@/lib/quiz";

/** Сколько смотреть на ответившую картинку, прежде чем ехать к следующему вопросу. */
const ADVANCE_DELAY = 900;

export function QuizSection() {
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const step = QUIZ_STEPS[current]!;
  const answeredCount = QUIZ_STEPS.filter((s) => answers[s.id]).length;
  const done = answeredCount === QUIZ_STEPS.length;

  const choose = (value: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setAnswers((prev) => ({ ...prev, [step.id]: value }));

    // Пауза нужна, чтобы человек увидел, как картинка справа отозвалась на
    // его ответ. Без неё вопрос сменяется раньше, чем доедет глобус.
    timerRef.current = setTimeout(() => {
      setCurrent((i) => (i + 1 < QUIZ_STEPS.length ? i + 1 : i));
    }, ADVANCE_DELAY);
  };

  const goTo = (index: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrent(index);
  };

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setAnswers({});
    setCurrent(0);
  };

  // На какой витрине остановить ленту. Если шагу отвечают несколько витрин,
  // ответ сам выбирает одну из них — так лента не замирает каждый раз на той же.
  const deckTarget = useMemo(() => {
    const answer = answers[step.id];
    if (!answer) return null;
    const matching = PARTNERS.map((p, i) => ({ p, i })).filter((x) => x.p.settlesOn === step.id);
    if (!matching.length) return null;
    const pick = answer.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % matching.length;
    return matching[pick]!.i;
  }, [answers, step.id]);

  const place = answers.destination ? QUIZ_PLACES[answers.destination] : undefined;

  const stage = () => {
    switch (step.id) {
      case "destination":
        return <Globe target={place ? { lon: place.lon, lat: place.lat } : null} dimmed={!place} />;
      case "travellers":
        return <TravellersStage count={answers.travellers ? Number(answers.travellers) : null} />;
      case "budget":
        return (
          <BudgetStage
            budget={answers.budget ?? null}
            travellers={answers.travellers ? Number(answers.travellers) : null}
          />
        );
      case "season":
        return <SeasonStage season={answers.season ?? null} />;
      case "priority":
        return <PriorityStage priority={answers.priority ?? null} />;
      default:
        return null;
    }
  };

  const stageCaption = () => {
    if (step.id === "destination") {
      const label = QUIZ_STEPS[0]!.options.find((o) => o.value === answers.destination)?.label;
      return place && label ? `${label} · ${place.spot}` : "Точка появится после ответа";
    }
    const chosen = QUIZ_STEPS.find((s) => s.id === step.id)?.options.find(
      (o) => o.value === answers[step.id],
    );
    return chosen ? chosen.label : step.hint;
  };

  return (
    <section id="quiz" className="bg-night-2">
      <div className="mx-auto w-full max-w-[1320px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="flex max-w-[58ch] flex-col gap-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-cold">
            Подбор поездки
          </span>
          <h2 className="text-balance font-display text-[clamp(26px,4vw,50px)] font-extrabold leading-[1.08] tracking-[-0.04em] text-paper">
            Пять вопросов — и видно, что вам подходит
          </h2>
          <p className="text-[16px] leading-relaxed text-paper/50">
            Отвечайте слева. Справа каждый ответ сразу что-то меняет: глобус доворачивается к
            точке, толпа редеет до вашей компании, бюджет находит свою ступень.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12">
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
                const answer = answers[s.id];
                const chosen = s.options.find((o) => o.value === answer);

                if (i !== current) {
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => goTo(i)}
                        className="flex w-full items-center gap-4 rounded-card border border-paper/10 px-4 py-3.5 text-left transition-colors hover:border-cold/50 sm:px-5"
                      >
                        <span className="tnum shrink-0 font-mono text-[11px] text-paper/35">
                          0{i + 1}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[14px] text-paper/55">
                          {s.question}
                        </span>
                        <span
                          className={`shrink-0 text-[13.5px] font-bold ${
                            chosen ? "text-cold" : "text-paper/25"
                          }`}
                        >
                          {chosen ? chosen.label : "—"}
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
                    <h3 className="mt-2 font-display text-[clamp(20px,2.4vw,28px)] font-extrabold leading-tight tracking-[-0.035em] text-paper">
                      {s.question}
                    </h3>
                    <p className="mt-2 text-[13px] leading-snug text-paper/55">{s.hint}</p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {s.options.map((o) => {
                        const active = o.value === answer;
                        return (
                          <button
                            key={o.value}
                            type="button"
                            onClick={() => choose(o.value)}
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
                  </li>
                );
              })}
            </ol>

            {done && (
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-cold/35 px-5 py-4">
                <p className="max-w-[46ch] text-[13.5px] leading-snug text-paper/60">
                  Ответы собраны. Подборку покажем, когда подключим витрины партнёров — сейчас
                  карточки внизу только показывают, как это будет работать.
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

          {/* --------------------------- КАРТИНКА --------------------------- */}
          <div className="flex flex-col gap-4">
            <div className="relative flex aspect-square max-h-[430px] items-center justify-center overflow-hidden rounded-modal border border-paper/10 bg-night sm:aspect-[5/4]">
              {/* Мягкое свечение под сценой — чтобы тёмный прямоугольник не
                  выглядел дырой в секции. */}
              <span
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 size-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60"
                style={{ background: "radial-gradient(circle, rgba(53,172,190,.3), transparent 70%)" }}
              />
              <div className="relative flex size-full items-center justify-center p-6">{stage()}</div>
            </div>

            <div className="flex items-baseline justify-between gap-4">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-paper/55">
                {step.question}
              </span>
              <span className="text-[13.5px] font-bold text-cold">{stageCaption()}</span>
            </div>

            {/* ------------------------ ВИТРИНЫ ------------------------ */}
            <div className="mt-4 flex flex-col gap-3 border-t border-paper/10 pt-6">
              <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1">
                <h3 className="font-display text-[17px] font-bold tracking-[-0.025em] text-paper">
                  Где будем искать
                </h3>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-paper/55">
                  лента тормозит на подходящей витрине
                </span>
              </div>

              <PartnerDeck targetIndex={deckTarget} />

              <p className="text-[12px] leading-snug text-paper/55">
                Макет: ни одна партнёрская программа пока не подключена, поэтому в карточках нет
                ни цен, ни ссылок. На месте заставок встанут логотипы — их выдают вместе с
                бренд-китом и только после одобрения заявки.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
