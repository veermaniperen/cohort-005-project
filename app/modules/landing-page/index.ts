import {
  footerLinksFor,
  heroActionsFor,
  type HeroActions,
  type LandingLink,
  type LandingViewer,
} from "./lib/actions";

export type { HeroActions, LandingLink, LandingViewer };

/** The two calls to action in the landing page hero, for this visitor. */
export function heroActions(viewer: LandingViewer): HeroActions {
  return heroActionsFor(viewer);
}

/** The links in the landing page footer, for this visitor. */
export function footerLinks(viewer: LandingViewer): LandingLink[] {
  return footerLinksFor(viewer);
}
