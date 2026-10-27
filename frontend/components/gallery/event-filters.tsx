"use client";

import { useId } from "react";
import type { EventLocation, EventType } from "@/lib/events/types";
import type { GalleryFiltersCopy } from "@/lib/gallery/types";

export type GalleryFilterValues = {
  tipo: string;
  localizacao: string;
};

type EventFiltersProps = {
  copy: GalleryFiltersCopy;
  types: readonly EventType[];
  locations: readonly EventLocation[];
  values: GalleryFilterValues;
  onChange: (values: GalleryFilterValues) => void;
  onApply: () => void;
  onClear: () => void;
};

const selectClassName =
  "h-10 w-full cursor-pointer rounded-lg border border-line bg-canvas px-2 text-body transition-colors hover:border-navy";

export function EventFilters({
  copy,
  types,
  locations,
  values,
  onChange,
  onApply,
  onClear,
}: EventFiltersProps) {
  const formId = useId();
  const typeId = `${formId}-tipo`;
  const locationId = `${formId}-localizacao`;

  return (
    <form
      className="flex flex-col gap-6 py-6 lg:flex-row lg:items-end"
      onSubmit={(event) => {
        event.preventDefault();
        onApply();
      }}
    >
      <div className="flex w-full flex-col gap-0.5 lg:min-w-0 lg:flex-1 xl:w-63.5 xl:flex-none">
        <label htmlFor={typeId} className="text-label font-semibold text-text">
          {copy.type.label}
        </label>
        <select
          id={typeId}
          name="tipo"
          value={values.tipo}
          onChange={(event) => onChange({ ...values, tipo: event.target.value })}
          className={`${selectClassName} ${values.tipo ? "text-ink-soft" : "text-placeholder"}`}
        >
          <option value="">{copy.type.placeholder}</option>
          {types.map((type) => (
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex w-full flex-col gap-0.5 lg:min-w-0 lg:flex-1 xl:w-63.5 xl:flex-none">
        <label htmlFor={locationId} className="text-label font-semibold text-text">
          {copy.location.label}
        </label>
        <select
          id={locationId}
          name="localizacao"
          value={values.localizacao}
          onChange={(event) => onChange({ ...values, localizacao: event.target.value })}
          className={`${selectClassName} ${values.localizacao ? "text-ink-soft" : "text-placeholder"}`}
        >
          <option value="">{copy.location.placeholder}</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="inline-flex h-10 w-full max-w-50 shrink-0 cursor-pointer items-center justify-center rounded-full bg-sky-mid px-4 text-label font-semibold text-indigo-deep transition-colors hover:bg-sky-deep lg:w-auto lg:px-10"
      >
        {copy.applyLabel}
      </button>
      <button
        type="button"
        onClick={onClear}
        className="inline-flex h-10 w-full max-w-50 shrink-0 cursor-pointer items-center justify-center rounded-full border border-text bg-canvas px-4 text-label font-semibold text-text transition-colors hover:bg-sky lg:w-auto lg:px-10"
      >
        {copy.clearLabel}
      </button>
    </form>
  );
}
