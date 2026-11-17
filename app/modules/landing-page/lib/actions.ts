export type LandingViewer = { id: number } | null;

export type LandingLink = {
  label: string;
  to: string;
};

export type HeroActions = {
  primary: LandingLink;
  secondary: LandingLink;
};

const browseCourses: LandingLink = { label: "Browse courses", to: "/courses" };

export function heroActionsFor(viewer: LandingViewer): HeroActions {
  if (viewer) {
    return {
      primary: { label: "Continue learning", to: "/dashboard" },
      secondary: browseCourses,
    };
  }
  return {
    primary: browseCourses,
    secondary: { label: "Create an account", to: "/signup" },
  };
}

export function footerLinksFor(viewer: LandingViewer): LandingLink[] {
  const account: LandingLink[] = viewer
    ? [{ label: "Dashboard", to: "/dashboard" }]
    : [
        { label: "Log in", to: "/login" },
        { label: "Sign up", to: "/signup" },
      ];
  return [browseCourses, ...account];
}
