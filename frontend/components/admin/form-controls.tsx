"use client";

import { type ChangeEvent, type DragEvent, type ReactNode, type Ref, useState } from "react";
import { inputClass } from "@/components/admin/form-field";
import { CheckIcon, ChevronDownIcon, ImageIcon } from "@/components/icons/icon";

type SelectInputProps = {
  id: string;
  name: string;
  value: string;
  describedBy: string | undefined;
  invalid: boolean;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
};

export function SelectInput({
  id,
  name,
  value,
  describedBy,
  invalid,
  onChange,
  children,
}: SelectInputProps) {
  return (
    <div className="relative">
      <select
        id={id}
        name={name}
        value={value}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={describedBy}
        onChange={onChange}
        className={`${inputClass} cursor-pointer appearance-none pr-9 hover:bg-sky`}
      >
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2 mt-0.5 size-5 -translate-y-1/2 text-navy" />
    </div>
  );
}

type CheckboxProps = {
  id: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
};

export function Checkbox({ id, name, checked, onChange, children }: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className="group flex w-fit cursor-pointer items-center gap-3 text-body text-text"
    >
      <span className="relative inline-flex size-6 shrink-0">
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer size-6 cursor-pointer appearance-none rounded-sm border-2 border-navy bg-canvas transition-colors checked:border-navy checked:bg-navy group-hover:bg-sky checked:group-hover:bg-slate"
        />
        <CheckIcon className="pointer-events-none absolute inset-0 m-auto size-4.5 stroke-3 text-canvas opacity-0 peer-checked:opacity-100" />
      </span>
      {children}
    </label>
  );
}

type FilePickerProps = {
  id: string;
  name: string;
  multiple?: boolean;
  disabled?: boolean;
  invalid: boolean;
  describedBy: string | undefined;
  inputRef?: Ref<HTMLInputElement>;
  buttonLabel: string;
  // What is chosen right now, or null for the empty prompt.
  selectedLabel: string | null;
  onFiles: (files: File[]) => void;
};

const accept = "image/jpeg,image/png,image/webp";

export function FilePicker({
  id,
  name,
  multiple = false,
  disabled = false,
  invalid,
  describedBy,
  inputRef,
  buttonLabel,
  selectedLabel,
  onFiles,
}: FilePickerProps) {
  const [dragging, setDragging] = useState(false);

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (disabled) {
      return;
    }
    const files = [...event.dataTransfer.files];
    if (files.length > 0) {
      onFiles(multiple ? files : files.slice(0, 1));
    }
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: drop target; the file input and its button stay the keyboard path
    <div
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) {
          setDragging(true);
        }
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`mt-1 flex flex-col gap-3 rounded-lg border-2 border-dashed px-4 py-4 transition-colors sm:flex-row sm:items-center ${
        invalid ? "border-danger" : dragging ? "border-navy bg-sky-deep" : "border-sky-mid bg-sky"
      } ${disabled ? "opacity-60" : ""}`}
    >
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={describedBy}
        onChange={(event) => onFiles(event.target.files ? [...event.target.files] : [])}
        className="peer sr-only"
      />
      <label
        htmlFor={id}
        className={`inline-flex h-10 w-fit shrink-0 items-center justify-center gap-2 rounded-full bg-sky-mid px-4 text-body font-semibold text-indigo-deep transition-colors peer-focus-visible:outline-3 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-indigo ${
          disabled ? "cursor-not-allowed" : "cursor-pointer hover:bg-sky-deep"
        }`}
      >
        <ImageIcon className="size-5" />
        {buttonLabel}
      </label>
      <span className="min-w-0 text-body text-muted wrap-break-word">
        {selectedLabel ??
          (multiple ? "ou arraste as imagens para cá" : "ou arraste a imagem para cá")}
      </span>
    </div>
  );
}
