import { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";

import { KnowledgeProvider } from "../knowledge/KnowledgeContext";
import { loadKnowledge } from "../knowledge/loadKnowledge";
import type { KnowledgeRepository } from "../knowledge/types";
import { AppShell } from "./AppShell";
import { AppRoutes } from "./routes";

export const KNOWLEDGE_LOAD_ERROR =
  "No se pudo cargar CarpiNova Knowledge 1.0.0. Ejecuta la preparación del conocimiento y vuelve a intentar.";

type BootstrapState =
  | { status: "loading" }
  | { status: "ready"; repository: KnowledgeRepository }
  | { status: "error" };

export function Bootstrap({
  load = loadKnowledge,
}: {
  load?: typeof loadKnowledge;
}) {
  const [state, setState] = useState<BootstrapState>({ status: "loading" });

  useEffect(() => {
    let active = true;

    void load()
      .then((repository) => {
        if (active) {
          setState({ status: "ready", repository });
        }
      })
      .catch((error: unknown) => {
        console.error("CarpiNova Knowledge failed to load", error);
        if (active) {
          setState({ status: "error" });
        }
      });

    return () => {
      active = false;
    };
  }, [load]);

  if (state.status === "loading") {
    return (
      <AppShell>
        <p role="status">Cargando conocimiento de CarpiNova…</p>
      </AppShell>
    );
  }

  if (state.status === "error") {
    return (
      <AppShell>
        <section role="alert" aria-labelledby="knowledge-error-title">
          <h1 id="knowledge-error-title">CarpiNova no está disponible</h1>
          <p>{KNOWLEDGE_LOAD_ERROR}</p>
        </section>
      </AppShell>
    );
  }

  return (
    <KnowledgeProvider repository={state.repository}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </KnowledgeProvider>
  );
}
