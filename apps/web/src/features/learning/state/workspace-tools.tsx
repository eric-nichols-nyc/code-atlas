"use client";
import { createContext, type ReactNode, useContext, useState } from "react";

const Tools = createContext<{
  tab: string;
  setTab: (tab: string) => void;
} | null>(null);
export function WorkspaceTools({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState("tutor");
  return <Tools.Provider value={{ tab, setTab }}>{children}</Tools.Provider>;
}
export function useWorkspaceTools() {
  const value = useContext(Tools);
  if (!value) throw new Error("Workspace tools required");
  return value;
}
