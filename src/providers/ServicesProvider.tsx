"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createMockServices } from "@/adapters/mock";
import type { Services } from "@/services/types";
import { useAuth } from "./AuthProvider";
import { useScenario } from "./scenario";

const ServicesContext = createContext<Services | null>(null);

/** The only place an adapter is imported (enforced by ESLint). */
export function ServicesProvider({ children }: { children: ReactNode }) {
  const scenario = useScenario();
  const { user } = useAuth();
  const actorId = user?.id;
  const { services } = useMemo(
    () => createMockServices({ scenario, ...(actorId === undefined ? {} : { actorId }) }),
    [scenario, actorId],
  );
  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}

export function useServices(): Services {
  const services = useContext(ServicesContext);
  if (services === null) throw new Error("useServices must be used inside ServicesProvider");
  return services;
}
