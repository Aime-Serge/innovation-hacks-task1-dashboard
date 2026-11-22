import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WelcomePage } from "@/features/welcome/WelcomePage";
import LoginRoute from "@/app/(auth)/login/page";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";

describe("the public front door", () => {
  it("the welcome page greets the visitor and offers login and sign-up", () => {
    render(<WelcomePage />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Welcome to DevDash" }),
    ).toBeInTheDocument();
    const main = screen.getByRole("main");
    // Both welcome actions open login; registration is available from that screen.
    expect(
      within(screen.getByRole("banner")).getByRole("link", { name: "Login" }),
    ).toHaveAttribute("href", "/login");
    expect(within(main).queryByRole("link", { name: "Login" })).toBeNull();
    expect(within(main).getByRole("link", { name: "Join" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(2);
  });

  it("keeps Login in the header and Join in the main section", () => {
    render(<WelcomePage />);
    expect(within(screen.getByRole("banner")).getByRole("link", { name: "Login" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(within(screen.getByRole("main")).getByRole("link", { name: "Join" })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("the login page welcomes the visitor back and links home", () => {
    render(
      <ThemeProvider>
        <AuthProvider>
          <LoginRoute />
        </AuthProvider>
      </ThemeProvider>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Welcome back" })).toBeInTheDocument();
    expect(screen.getByText("Log in to pick up where you left off.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "DevDash home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
  });
});
