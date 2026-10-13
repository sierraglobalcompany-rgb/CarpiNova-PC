import { createContext, useContext, type ReactNode } from "react";

import type { KnowledgeRepository } from "./types";

const KnowledgeContext = createContext<KnowledgeRepository | null>(null);

export function KnowledgeProvider({
  repository,
  children,
}: {
  repository: KnowledgeRepository;
  children: ReactNode;
}) {
  return (
    <KnowledgeContext.Provider value={repository}>
      {children}
    </KnowledgeContext.Provider>
  );
}

export function useKnowledge(): KnowledgeRepository {
  const repository = useContext(KnowledgeContext);
  if (!repository) {
    throw new Error("useKnowledge must be used inside KnowledgeProvider");
  }
  return repository;
}
