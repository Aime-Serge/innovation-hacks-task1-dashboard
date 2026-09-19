"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Toast as RadixToast } from "radix-ui";
import { t } from "@/i18n";
import { Icon } from "./Icon";
import { IconButton } from "./IconButton";

type ToastTone = "success" | "error";
type ToastItem = { id: number; tone: ToastTone; message: string };
type ToastApi = { notify: (tone: ToastTone, message: string) => void };

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (api === null) throw new Error("useToast must be used inside ToastProvider");
  return api;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const notify = useCallback((tone: ToastTone, message: string) => {
    setItems((current) => [...current, { id: Date.now() + Math.random(), tone, message }]);
  }, []);
  const api = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={api}>
      <RadixToast.Provider duration={5000} label={t("toast.region")}>
        {children}
        {items.map((item) => (
          <RadixToast.Root
            key={item.id}
            type={item.tone === "error" ? "foreground" : "background"}
            onOpenChange={(open) => {
              if (!open) setItems((current) => current.filter((entry) => entry.id !== item.id));
            }}
            className={`flex items-start gap-3 rounded-md border p-3 shadow-md ${
              item.tone === "error"
                ? "border-danger bg-danger-bg text-danger"
                : "border-success bg-success-bg text-success"
            }`}
          >
            <RadixToast.Description className="flex-1 text-sm">
              {item.message}
            </RadixToast.Description>
            <RadixToast.Close asChild>
              <IconButton label={t("common.dismiss")}>
                <Icon name="x" />
              </IconButton>
            </RadixToast.Close>
          </RadixToast.Root>
        ))}
        <RadixToast.Viewport className="fixed inset-x-4 bottom-4 z-50 flex flex-col gap-2 sm:left-auto sm:w-80" />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
}
