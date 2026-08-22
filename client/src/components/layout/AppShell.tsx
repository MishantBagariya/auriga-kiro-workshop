import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-16 items-center border-b border-slate-200 bg-white px-4 md:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            T
          </div>
          <span className="ml-2 text-lg font-semibold text-slate-900">TaskFlow</span>
        </header>
        <main className="flex-1 px-4 py-6 pb-20 md:px-8 md:py-8 md:pb-8">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
