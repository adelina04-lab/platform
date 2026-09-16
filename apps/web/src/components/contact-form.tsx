"use client";

import Link from "next/link";
import { useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

const ERRORS: Record<string, string> = {
  consent: "Без согласия на обработку данных отправить не получится.",
  name: "Имя — от двух до восьмидесяти символов.",
  contact: "Оставьте почту или телефон, иначе ответить будет некуда.",
  message: "Напишите хотя бы пару слов.",
  "too-often": "Только что уже отправляли. Попробуйте через минуту.",
  "not-configured": "Форма ещё не подключена к почте. Позвоните — так быстрее.",
  mail: "Письмо не ушло. Позвоните, пожалуйста, — так надёжнее.",
};

const FIELD =
  "w-full rounded-field border border-paper/18 bg-paper/5 px-4 py-3 text-[15px] text-paper placeholder:text-paper/35 transition-colors focus:border-cold focus:outline-none";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [problem, setProblem] = useState<string | null>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    setStatus("sending");
    setProblem(null);

    try {
      const res = await fetch("/form.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          contact: data.get("contact"),
          message: data.get("message"),
          consent: data.get("consent") === "on",
          company: data.get("company"),
        }),
      });

      const payload = (await res.json().catch(() => null)) as { error?: string } | null;

      if (res.ok) {
        setStatus("sent");
        form.reset();
        return;
      }

      setProblem(ERRORS[payload?.error ?? ""] ?? "Что-то пошло не так. Попробуйте позвонить.");
      setStatus("error");
    } catch {
      // Сеть недоступна или обработчик не залит — телефон в этом случае
      // остаётся рабочим способом связи, о нём и говорим.
      setProblem("Не удалось связаться с сервером. Позвоните, пожалуйста.");
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="flex flex-col gap-3 rounded-card border border-cold/40 bg-paper/5 px-5 py-8">
        <span className="font-display text-[20px] font-extrabold tracking-[-0.03em] text-paper">
          Сообщение ушло
        </span>
        <p className="text-[14px] leading-relaxed text-paper/60">
          Отвечу на указанный контакт. Если дело срочное — звоните, по телефону быстрее.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="self-start text-[13.5px] font-semibold text-cold underline underline-offset-4"
        >
          Написать ещё раз
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-paper/60">
            Как к вам обращаться
          </span>
          <input name="name" type="text" required maxLength={80} className={FIELD} placeholder="Имя" />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-paper/60">
            Куда ответить
          </span>
          <input
            name="contact"
            type="text"
            required
            maxLength={120}
            className={FIELD}
            placeholder="Почта или телефон"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-paper/60">
          Сообщение
        </span>
        <textarea
          name="message"
          required
          rows={4}
          maxLength={2000}
          className={`${FIELD} resize-y`}
          placeholder="Что не сошлось в расчёте, чего не хватает, что предложить"
        />
      </label>

      {/* Ловушка для ботов: людям это поле не видно и не доступно с клавиатуры. */}
      <input
        name="company"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="pointer-events-none absolute size-0 opacity-0"
      />

      <label className="flex items-start gap-3 py-1">
        <input
          name="consent"
          type="checkbox"
          required
          className="mt-0.5 size-4 shrink-0 accent-[#7de2df]"
        />
        <span className="text-[12.5px] leading-snug text-paper/60">
          Согласен на обработку персональных данных на условиях{" "}
          <Link href="/politika/" className="text-cold underline underline-offset-2 hover:text-cold-2">
            политики обработки данных
          </Link>
          . Имя, контакт и текст сообщения нужны только для ответа.
        </span>
      </label>

      {problem && (
        <p role="alert" className="text-[13px] leading-snug text-cold">
          {problem}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-1 inline-flex h-12 w-full items-center justify-center rounded-field bg-cold px-7 text-[15px] font-semibold text-night transition-colors hover:bg-cold-2 disabled:opacity-50 sm:w-auto sm:self-start"
      >
        {status === "sending" ? "Отправляю…" : "Отправить"}
      </button>
    </form>
  );
}
