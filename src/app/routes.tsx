import { Route, Routes } from "react-router-dom";

import { ContentPage } from "../features/content/ContentPage";
import { HomePage } from "../features/search/HomePage";
import { SearchPage } from "../features/search/SearchPage";
import { AppShell } from "./AppShell";

export function AppRoutes() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/buscar" element={<SearchPage />} />
        <Route path="/contenido/:contentId" element={<ContentPage />} />
      </Routes>
    </AppShell>
  );
}
