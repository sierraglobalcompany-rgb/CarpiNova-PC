import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-brand">CarpiNova</div>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}
