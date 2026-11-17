import { describe, it, expect } from "vitest";
import { footerLinks, heroActions } from "../index";

describe("heroActions", () => {
  it("leads a signed-out visitor to the catalogue, then to sign-up", () => {
    expect(heroActions(null)).toEqual({
      primary: { label: "Browse courses", to: "/courses" },
      secondary: { label: "Create an account", to: "/signup" },
    });
  });

  it("leads a signed-in visitor back to their dashboard, then to the catalogue", () => {
    expect(heroActions({ id: 5 })).toEqual({
      primary: { label: "Continue learning", to: "/dashboard" },
      secondary: { label: "Browse courses", to: "/courses" },
    });
  });
});

describe("footerLinks", () => {
  it("offers a signed-out visitor the catalogue, log in and sign up", () => {
    expect(footerLinks(null)).toEqual([
      { label: "Browse courses", to: "/courses" },
      { label: "Log in", to: "/login" },
      { label: "Sign up", to: "/signup" },
    ]);
  });

  it("offers a signed-in visitor the catalogue and their dashboard", () => {
    expect(footerLinks({ id: 5 })).toEqual([
      { label: "Browse courses", to: "/courses" },
      { label: "Dashboard", to: "/dashboard" },
    ]);
  });
});
