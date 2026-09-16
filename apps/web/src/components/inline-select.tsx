"use client";

import { useEffect, useId, useRef, useState } from "react";

export interface InlineOption {
  value: string;
  label: string;
}

/**
 * Значение внутри фразы калькулятора со своим выпадающим списком.
 *
 * Системный `<select>` на тёмном фоне выглядел чужим и, главное, никак не
 * показывал, что слово под пунктиром вообще можно нажать. Здесь рядом со
 * значением стоит шеврон, а список — тёмное стекло в цветах сайта.
 *
 * Разметка списка собрана из `span`: фраза живёт внутри `h1`, а туда можно
 * класть только строчное содержимое, поэтому `ul` не подходит. Роли ARIA
 * делают из этих `span` настоящий combobox с клавиатурным управлением.
 */
export function InlineSelect({
  label,
  value,
  options,
  onChange,
  defaultOpen = false,
}: {
  label: string;
  value: string;
  options: readonly InlineOption[];
  onChange: (value: string) => void;
  /** Открыт сразу при загрузке — так видно, что фразу вообще меняют. */
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const currentIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const [highlight, setHighlight] = useState(currentIndex);

  const rootRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLSpanElement>(null);
  const listId = useId();

  const current = options[currentIndex] ?? options[0]!;

  // Закрытие по клику мимо и по Esc на уровне документа.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Список у правого края экрана уезжал бы за его пределы и добавлял странице
  // горизонтальную прокрутку. Сдвигаем его влево ровно настолько, насколько он
  // вылез, — напрямую стилем, без лишнего состояния и перерисовки.
  useEffect(() => {
    const el = panelRef.current;
    if (!open || !el) return;

    el.style.left = "0px";
    const overshoot = el.getBoundingClientRect().right - (window.innerWidth - 12);
    if (overshoot > 0) el.style.left = `${-overshoot}px`;
  }, [open]);

  // Пункт под курсором клавиатуры должен оставаться видимым при прокрутке.
  useEffect(() => {
    if (!open) return;
    panelRef.current
      ?.querySelector(`#${CSS.escape(`${listId}-${highlight}`)}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, highlight, listId]);

  const choose = (index: number) => {
    const option = options[index];
    if (option) onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
      case "ArrowUp": {
        e.preventDefault();
        const step = e.key === "ArrowDown" ? 1 : -1;
        if (!open) {
          setHighlight(currentIndex);
          setOpen(true);
        } else {
          setHighlight((i) => (i + step + options.length) % options.length);
        }
        break;
      }
      case "Home":
        if (open) {
          e.preventDefault();
          setHighlight(0);
        }
        break;
      case "End":
        if (open) {
          e.preventDefault();
          setHighlight(options.length - 1);
        }
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (open) choose(highlight);
        else {
          setHighlight(currentIndex);
          setOpen(true);
        }
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
        }
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <span ref={rootRef} className="relative inline-block">
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-label={label}
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${highlight}` : undefined}
        onKeyDown={onKeyDown}
        onClick={() => {
          setHighlight(currentIndex);
          setOpen((v) => !v);
        }}
        className="madlib-trigger"
      >
        {current.label}
        <svg className="madlib-caret" viewBox="0 0 10 6" fill="none" aria-hidden>
          <path
            d="M1 1l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <span ref={panelRef} id={listId} role="listbox" aria-label={label} className="madlib-panel">
          {options.map((option, i) => (
            <span
              key={option.value}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={option.value === value}
              data-highlighted={i === highlight}
              onPointerEnter={() => setHighlight(i)}
              onClick={() => choose(i)}
              className="madlib-option"
            >
              {option.label}
            </span>
          ))}
        </span>
      )}
    </span>
  );
}
