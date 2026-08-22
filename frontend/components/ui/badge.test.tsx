import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./badge";

describe("Badge", () => {
  it("renders children text", () => {
    render(<Badge>Ativo</Badge>);
    expect(screen.getByText("Ativo")).toBeInTheDocument();
  });

  it("uses neutral variant by default", () => {
    const { container } = render(<Badge>X</Badge>);
    const span = container.querySelector("span");
    expect(span).toHaveClass("bg-surface-container");
  });

  it("applies profit variant classes", () => {
    const { container } = render(<Badge variant="profit">+10%</Badge>);
    const span = container.querySelector("span");
    expect(span).toHaveClass("bg-primary");
  });

  it("applies alert variant classes", () => {
    const { container } = render(<Badge variant="alert">!</Badge>);
    const span = container.querySelector("span");
    expect(span).toHaveClass("bg-error");
  });

  it("applies warning variant classes", () => {
    const { container } = render(<Badge variant="warning">W</Badge>);
    const span = container.querySelector("span");
    expect(span).toHaveClass("bg-surface-container-high");
  });

  it("applies info variant classes", () => {
    const { container } = render(<Badge variant="info">i</Badge>);
    const span = container.querySelector("span");
    expect(span).toHaveClass("bg-surface-container");
  });

  it("accepts custom className and merges it", () => {
    const { container } = render(<Badge className="extra-class">Tag</Badge>);
    const span = container.querySelector("span");
    expect(span).toHaveClass("extra-class");
  });
});
