import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
  it("renders children text", () => {
    render(<Button>Clique aqui</Button>);
    expect(screen.getByText("Clique aqui")).toBeInTheDocument();
  });

  it("renders a real <button> element", () => {
    render(<Button>OK</Button>);
    expect(screen.getByRole("button")).toBeInstanceOf(HTMLButtonElement);
  });

  it("applies default variant classes", () => {
    render(<Button>X</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-brand");
  });

  it("applies outline variant classes", () => {
    render(<Button variant="outline">X</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-surfaceContainer-lowest");
  });

  it("applies ghost variant classes", () => {
    render(<Button variant="ghost">X</Button>);
    expect(screen.getByRole("button")).toHaveClass("hover:bg-surfaceContainer-high");
  });

  it("applies destructive variant classes", () => {
    render(<Button variant="destructive">X</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-error");
  });

  it("applies size sm classes", () => {
    render(<Button size="sm">X</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-8");
  });

  it("applies size lg classes", () => {
    render(<Button size="lg">X</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-12");
  });

  it("applies size icon classes", () => {
    render(<Button size="icon">X</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-10 w-10");
  });

  it("fires onClick handler when clicked", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("respects disabled prop", () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Disabled</Button>);
    const btn = screen.getByRole("button") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("merges custom className", () => {
    render(<Button className="my-class">X</Button>);
    expect(screen.getByRole("button")).toHaveClass("my-class");
  });

  it("forwards type=submit", () => {
    render(<Button type="submit">Enviar</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });
});
