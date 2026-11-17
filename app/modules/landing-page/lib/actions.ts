export type LandingViewer = { id: number } | null;

export type LandingLink = {
  label: string;
  to: string;
};

export type HeroActions = {
  primary: LandingLink;
  secondary: LandingLink;
};

const browseCourses: LandingLink = { label: "Browse Courses", to: "/courses" };

export function heroActionsFor(viewer: LandingViewer): HeroActions {
  if (viewer) {
    return {
      primary: { label: "Continue Learning", to: "/dashboard" },
      secondary: browseCourses,
    };
  }
  return {
    primary: browseCourses,
    secondary: { label: "Create an Account", to: "/signup" },
  };
}

export function footerLinksFor(viewer: LandingViewer): LandingLink[] {
  const account: LandingLink[] = viewer
    ? [{ label: "Dashboard", to: "/dashboard" }]
    : [
        { label: "Log In", to: "/login" },
        { label: "Sign Up", to: "/signup" },
      ];
  return [browseCourses, ...account];
}
