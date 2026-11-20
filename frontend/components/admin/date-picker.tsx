"use client";

import {
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { inputClass } from "@/components/admin/form-field";
import { ArrowRightIcon, CalendarIcon, ClockIcon } from "@/components/icons/icon";

// Dates are plain "YYYY-MM-DD" strings and times "HH:mm". The math below runs
// in UTC so the browser's time zone never shifts a day.

const weekdays = ["D", "S", "T", "Q", "Q", "S", "S"];
const weekdayNames = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

const monthFormat = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const longDateFormat = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseDate(value: string): Date | null {
  const match = datePattern.exec(value);
  if (!match) {
    return null;
  }
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return Number.isNaN(date.getTime()) ? null : date;
}

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function addMonths(date: Date, months: number): Date {
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(date.getUTCDate(), lastDay));
  return target;
}

// Today on the wall clock in Brasília, where the events happen.
function todayIso(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

export function formatLongDate(value: string): string {
  const date = parseDate(value);
  return date ? longDateFormat.format(date) : "";
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function monthDays(month: Date): Date[] {
  const first = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1));
  const start = addDays(first, -first.getUTCDay());
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

// Closes the popover on a click outside of it.
function useDismiss(open: boolean, rootRef: RefObject<HTMLElement | null>, close: () => void) {
  useEffect(() => {
    if (!open) {
      return;
    }
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        close();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, rootRef, close]);
}

const triggerClass = `${inputClass} flex cursor-pointer items-center justify-between gap-2 text-left hover:bg-sky`;
const popoverClass =
  "absolute top-full left-0 z-20 mt-2 rounded-xl border border-line bg-canvas p-3 shadow-panel";

type TriggerProps = {
  id: string;
  label: string;
  display: string;
  placeholder: string;
  open: boolean;
  popoverId: string;
  invalid: boolean;
  describedBy: string | undefined;
  icon: ReactNode;
  triggerRef: RefObject<HTMLButtonElement | null>;
  onToggle: () => void;
};

function Trigger({
  id,
  label,
  display,
  placeholder,
  open,
  popoverId,
  invalid,
  describedBy,
  icon,
  triggerRef,
  onToggle,
}: TriggerProps) {
  return (
    <button
      ref={triggerRef}
      id={id}
      type="button"
      aria-label={`${label}: ${display || placeholder}`}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={popoverId}
      aria-invalid={invalid ? true : undefined}
      aria-describedby={describedBy}
      onClick={onToggle}
      className={triggerClass}
    >
      <span className={display ? "truncate text-ink-soft" : "truncate text-placeholder"}>
        {display || placeholder}
      </span>
      <span className="shrink-0 text-navy">{icon}</span>
    </button>
  );
}

type DatePickerProps = {
  id: string;
  label: string;
  value: string;
  min?: string;
  invalid: boolean;
  describedBy: string | undefined;
  onChange: (value: string) => void;
};

export function DatePicker({
  id,
  label,
  value,
  min,
  invalid,
  describedBy,
  onChange,
}: DatePickerProps) {
  const popoverId = useId();
  const headingId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [today, setToday] = useState("");
  const [focused, setFocused] = useState<Date | null>(null);

  const selected = parseDate(value);
  const minDate = min ? parseDate(min) : null;
  const display = formatLongDate(value);

  useDismiss(open, rootRef, () => setOpen(false));

  useEffect(() => {
    if (!open || !focused) {
      return;
    }
    gridRef.current
      ?.querySelector<HTMLButtonElement>(`button[data-date="${toIso(focused)}"]`)
      ?.focus();
  }, [open, focused]);

  function openPicker() {
    // Read the clock here, not while rendering, so the page can prerender.
    const now = todayIso();
    setToday(now);
    setFocused(selected ?? minDate ?? parseDate(now));
    setOpen(true);
  }

  function close(returnFocus: boolean) {
    setOpen(false);
    if (returnFocus) {
      triggerRef.current?.focus();
    }
  }

  function choose(date: Date) {
    onChange(toIso(date));
    close(true);
  }

  function isDisabled(date: Date): boolean {
    return minDate !== null && date.getTime() < minDate.getTime();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close(true);
      return;
    }
    if (!focused) {
      return;
    }
    const moves: Record<string, () => Date> = {
      ArrowLeft: () => addDays(focused, -1),
      ArrowRight: () => addDays(focused, 1),
      ArrowUp: () => addDays(focused, -7),
      ArrowDown: () => addDays(focused, 7),
      Home: () => addDays(focused, -focused.getUTCDay()),
      End: () => addDays(focused, 6 - focused.getUTCDay()),
      PageUp: () => addMonths(focused, -1),
      PageDown: () => addMonths(focused, 1),
    };
    const move = moves[event.key];
    if (move && gridRef.current?.contains(event.target as Node)) {
      event.preventDefault();
      setFocused(move());
    }
  }

  const month = focused ?? selected ?? new Date(0);
  const days = monthDays(month);

  return (
    <div ref={rootRef} className="relative">
      <Trigger
        id={id}
        label={label}
        display={display}
        placeholder="Selecione a data"
        open={open}
        popoverId={popoverId}
        invalid={invalid}
        describedBy={describedBy}
        icon={<CalendarIcon className="size-5" />}
        triggerRef={triggerRef}
        onToggle={() => (open ? close(false) : openPicker())}
      />
      {open && focused ? (
        <div
          id={popoverId}
          role="dialog"
          aria-labelledby={headingId}
          onKeyDown={handleKeyDown}
          className={`${popoverClass} w-[min(--spacing(80),calc(100vw-2rem))]`}
        >
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setFocused(addMonths(focused, -1))}
              className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-navy transition-colors hover:bg-sky-deep"
            >
              <ArrowRightIcon className="size-5 rotate-180" />
              <span className="sr-only">Mês anterior</span>
            </button>
            <p id={headingId} aria-live="polite" className="text-label font-semibold text-ink">
              {capitalize(monthFormat.format(month))}
            </p>
            <button
              type="button"
              onClick={() => setFocused(addMonths(focused, 1))}
              className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-navy transition-colors hover:bg-sky-deep"
            >
              <ArrowRightIcon className="size-5" />
              <span className="sr-only">Próximo mês</span>
            </button>
          </div>
          <div ref={gridRef} className="mt-2 grid grid-cols-7 gap-1 text-center">
            {weekdays.map((day, index) => (
              <abbr
                key={weekdayNames[index]}
                title={weekdayNames[index]}
                className="py-1 text-[0.75rem] font-semibold text-muted no-underline"
              >
                {day}
              </abbr>
            ))}
            {days.map((day) => {
              const iso = toIso(day);
              const inMonth = day.getUTCMonth() === month.getUTCMonth();
              const isSelected = iso === value;
              const isToday = iso === today;
              const isFocused = iso === toIso(focused);
              const disabled = isDisabled(day);
              return (
                <button
                  key={iso}
                  type="button"
                  data-date={iso}
                  tabIndex={isFocused ? 0 : -1}
                  disabled={disabled}
                  aria-pressed={isSelected}
                  aria-current={isToday ? "date" : undefined}
                  aria-label={capitalize(longDateFormat.format(day))}
                  onClick={() => choose(day)}
                  className={`inline-flex size-9 items-center justify-center justify-self-center rounded-full text-body transition-colors ${
                    isSelected
                      ? "bg-navy font-bold text-canvas"
                      : isToday
                        ? "border border-saffron font-bold text-ink"
                        : inMonth
                          ? "text-ink-soft"
                          : "text-placeholder"
                  } ${
                    disabled
                      ? "cursor-not-allowed opacity-40"
                      : isSelected
                        ? "cursor-pointer hover:bg-slate"
                        : "cursor-pointer hover:bg-sky-deep"
                  }`}
                >
                  {day.getUTCDate()}
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between border-t border-line pt-2">
            <button
              type="button"
              disabled={isDisabled(parseDate(today) ?? new Date(0))}
              onClick={() => {
                const date = parseDate(today);
                if (date) {
                  choose(date);
                }
              }}
              className="inline-flex h-9 cursor-pointer items-center rounded-full px-3 text-body font-semibold text-navy transition-colors hover:bg-sky-deep disabled:cursor-not-allowed disabled:opacity-40"
            >
              Hoje
            </button>
            <button
              type="button"
              onClick={() => close(true)}
              className="inline-flex h-9 cursor-pointer items-center rounded-full px-3 text-body font-semibold text-navy transition-colors hover:bg-sky-deep"
            >
              Fechar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

type TimePickerProps = {
  id: string;
  label: string;
  value: string;
  invalid: boolean;
  describedBy: string | undefined;
  onChange: (value: string) => void;
};

const stepMinutes = 15;

function timeOptions(current: string): string[] {
  const options = Array.from({ length: (24 * 60) / stepMinutes }, (_, index) => {
    const minutes = index * stepMinutes;
    return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  });
  // An event saved at an odd minute keeps its time in the list.
  if (/^\d{2}:\d{2}$/.test(current) && !options.includes(current)) {
    options.push(current);
    options.sort();
  }
  return options;
}

export function TimePicker({ id, label, value, invalid, describedBy, onChange }: TimePickerProps) {
  const popoverId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState("");
  const options = timeOptions(value);

  useDismiss(open, rootRef, () => setOpen(false));

  useEffect(() => {
    if (!open || !focused) {
      return;
    }
    const button = listRef.current?.querySelector<HTMLButtonElement>(
      `button[data-time="${focused}"]`,
    );
    button?.focus();
    button?.scrollIntoView({ block: "nearest" });
  }, [open, focused]);

  function close(returnFocus: boolean) {
    setOpen(false);
    if (returnFocus) {
      triggerRef.current?.focus();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close(true);
      return;
    }
    const index = options.indexOf(focused);
    const moves: Record<string, number> = {
      ArrowUp: index - 1,
      ArrowDown: index + 1,
      PageUp: index - 4,
      PageDown: index + 4,
      Home: 0,
      End: options.length - 1,
    };
    const next = moves[event.key];
    if (next !== undefined) {
      event.preventDefault();
      setFocused(options[Math.min(Math.max(next, 0), options.length - 1)]);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <Trigger
        id={id}
        label={label}
        display={value}
        placeholder="Hora"
        open={open}
        popoverId={popoverId}
        invalid={invalid}
        describedBy={describedBy}
        icon={<ClockIcon className="size-5" />}
        triggerRef={triggerRef}
        onToggle={() => {
          if (open) {
            close(false);
            return;
          }
          setFocused(options.includes(value) ? value : "19:00");
          setOpen(true);
        }}
      />
      {open ? (
        <div
          id={popoverId}
          role="dialog"
          aria-label={label}
          onKeyDown={handleKeyDown}
          className={`${popoverClass} w-full min-w-32`}
        >
          <div ref={listRef} className="flex max-h-60 flex-col gap-1 overflow-y-auto pr-1">
            {options.map((option) => {
              const isSelected = option === value;
              return (
                <button
                  key={option}
                  type="button"
                  data-time={option}
                  tabIndex={option === focused ? 0 : -1}
                  aria-pressed={isSelected}
                  onClick={() => {
                    onChange(option);
                    close(true);
                  }}
                  className={`inline-flex h-9 shrink-0 cursor-pointer items-center rounded-lg px-3 text-body transition-colors ${
                    isSelected
                      ? "bg-navy font-bold text-canvas hover:bg-slate"
                      : "text-ink-soft hover:bg-sky-deep"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
