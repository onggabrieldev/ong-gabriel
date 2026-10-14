"use client";

import { type RefObject, useEffect } from "react";

export function useCloseOnBackdrop(dialogRef: RefObject<HTMLDialogElement | null>) {
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    function onClick(this: HTMLDialogElement, event: MouseEvent) {
      const rect = this.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (!inside) {
        this.close();
      }
    }

    dialog.addEventListener("click", onClick);
    return () => dialog.removeEventListener("click", onClick);
  }, [dialogRef]);
}
