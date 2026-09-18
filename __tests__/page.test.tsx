import { render, screen } from "@testing-library/react";
import Home from "@/app/page";
import { SCANNER_DEMO_LABELS } from "@/components/landing/scanner-demo";

describe("Landing page", () => {
  it("renders brand-first hero, workflow demo, and truck experience", () => {
    const { container } = render(<Home />);

    expect(container.querySelector("h1")?.textContent).toMatch(
      /AI inventory scanning built for movers/i,
    );
    expect(screen.getByRole("heading", { name: /see it in action/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /see exactly how your stuff fits/i })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /try (the scanner|it with your camera)/i }).length).toBeGreaterThan(0);
    expect(SCANNER_DEMO_LABELS.length).toBeGreaterThan(0);
  });
});
