import { Route, Routes } from "react-router-dom";

import { AppShell } from "./AppShell";
import { HomePage } from "../features/search/HomePage";
import { SearchPage } from "../features/search/SearchPage";

export function AppRoutes() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/buscar" element={<SearchPage />} />
      </Routes>
    </AppShell>
  );
}
