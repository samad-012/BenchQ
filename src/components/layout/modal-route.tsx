"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export function ModalRoute({ children, className, labelledBy }: { children: React.ReactNode; className?: string; labelledBy?: string }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // We use showModal() to utilize the native backdrop
    if (!dialog.open) {
      dialog.showModal();
    }

    const handleClose = () => {
      router.back();
    };

    const handleCancel = (e: Event) => {
      e.preventDefault(); // Prevent default close, manually route back
      handleClose();
    };

    const handleBackdropClick = (e: MouseEvent) => {
      const rect = dialog.getBoundingClientRect();
      const inDialog =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (!inDialog) {
        handleClose();
      }
    };

    dialog.addEventListener("cancel", handleCancel);
    dialog.addEventListener("click", handleBackdropClick);

    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      dialog.removeEventListener("click", handleBackdropClick);
    };
  }, [router]);

  return (
    <dialog ref={dialogRef} className={cn("bq-dialog", className)} aria-labelledby={labelledBy}>
      <div className="absolute right-4 top-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Close">
          <X size={20} />
        </Button>
      </div>
      {children}
    </dialog>
  );
}
