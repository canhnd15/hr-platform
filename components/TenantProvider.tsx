"use client";

import { createContext, useContext } from "react";
import type { TenantConfig } from "@/lib/types";

const TenantContext = createContext<TenantConfig | null>(null);

export function TenantProvider({
  value,
  children,
}: {
  value: TenantConfig;
  children: React.ReactNode;
}) {
  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}

export function useTenant(): TenantConfig {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    throw new Error(
      "useTenant() called outside <TenantProvider>. Wrap the subtree in TenantProvider or read tenant data via getTenantBySlug() on the server."
    );
  }
  return ctx;
}

export function useOptionalTenant(): TenantConfig | null {
  return useContext(TenantContext);
}
