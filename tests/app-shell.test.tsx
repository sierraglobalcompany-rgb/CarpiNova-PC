import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppShell } from "../src/app/AppShell";

describe("AppShell", () => {
  it("renders the CarpiNova banner and main content", () => {
    render(
      <AppShell>
        <p>Contenido de prueba</p>
      </AppShell>
    );

    expect(screen.getByRole("banner")).toHaveTextContent("CarpiNova");
    expect(screen.getByRole("main")).toHaveTextContent("Contenido de prueba");
  });
});
