# Which notification vendor fits Cadence?

Answers GitHub issue #2 (veermaniperen/cohort-005-project). Scope: **in-app Notifications only** (email stays on Postmark). Recipients: Students, Instructors, Platform Admins, Team Admins. Stack: React 19, React Router 8 framework mode (Node loaders/actions), SQLite/Drizzle, Tailwind + shadcn/Radix.

**Pricing and free-tier limits were checked on 2026-11-11.** npm versions were checked the same day.

## Recommendation: Novu

Novu fits best. Its ready-made `<Inbox />` is the only one we checked that takes **Tailwind class strings for every element**. It also has render props that let us swap in our own shadcn-built pieces, and headless hooks if we outgrow the component. It supports React 19. The per-user security is simple: an HMAC computed in a loader. The Inbox has live updates and a built-in preferences screen. Novu is open source and runs under Docker Compose, so we can run the real thing offline. Its paid entry price ($30/mo) is also the lowest. The main risk is the **free plan's 5-workflow cap**, which we will hit fast with four roles and many event types (see Risks).

The runner-up is **Knock**, which is the most polished and mature. Its React feed is built on Knock's own Telegraph design system plus `rnf-` CSS. We would theme it through `--rnf-*` CSS variables and class overrides, not Tailwind. Its paid step is also steep ($0 then $250/mo).

## Comparison

| Criterion | Novu | Knock | Courier | MagicBell | SuprSend |
|---|---|---|---|---|---|
| React 19 SDK | `@novu/react` 3.19.2, peer `react ^18 \|\| ^19` [npm] | `@knocklabs/react` 0.15.1, peer `react ^17\|\|^18\|\|^19`; `next`/TanStack peers optional [npm] | `@trycourier/courier-react` 9.3.5, peer `react >=18` [npm] | `@magicbell/react` 1.14.0 [npm] | `@suprsend/react` 1.5.0, peer `react >=16.8` [npm] |
| Server SDK (Node loaders/actions) | `@novu/api` [npm] | `@knocklabs/node` [npm] | Courier Node SDK / REST | REST + `magicbell-js` | SuprSend Node SDK |
| Ready-made inbox | Yes, `<Inbox />` | Yes, `NotificationFeedPopover` etc. | Yes, `<CourierInbox />` (web components underneath) | Yes, `FloatingInbox` / `Inbox` | Yes, drop-in Inbox |
| Styling | `appearance.variables` + `appearance.elements`, which take **Tailwind classes**, style objects, CSS modules or callbacks; `renderNotification/Subject/Body/Avatar/Bell` | `--rnf-*` CSS variables, `rnf-` classes, `renderItem`, `colorMode` | `CourierInboxTheme` object; `renderListItem/Header/EmptyState/...` slots | CSS variables (`--magicbell-*`), override class names, `ItemComponent` | `theme` object, `notificationComponent`, `bellComponent`, etc. |
| Headless | `useNotifications`, `useCounts`, `usePreferences`, `useNovu` | `useNotifications`, `useNotificationStore`, `usePreferences` | `useCourier()` client | Not on the React page | `useFeedClient`, `useFeedData` |
| Per-user security | HMAC-SHA256(secret, subscriberId) as `subscriberHash` | RS256 JWT user token (`signUserToken`) | Backend-minted JWT with inbox scopes | Backend-minted user JWT | Signed JWT user token |
| Live updates | WebSocket (socket.io / partysocket) | WebSocket (Phoenix channels) | WebSocket (`listenForUpdates()`) | WebSocket (`reconnecting-websocket`) | Socket (`socketHost`) |
| Per-user settings | Inbox Preferences UI; global / per-workflow / per-channel; "critical" workflows | PreferenceSet (categories / workflows / channel types); hosted page or `usePreferences` | Preference center | `UserPreferences` component | Preferences (separate docs) |
| Local dev / tests | **Self-hostable via Docker Compose**; Development environment | Development environment + branches; no local emulator found | No local emulator found | No local emulator found | No local emulator found |
| Free tier | 10k workflow runs/mo, **5 workflows**, 2 envs, 3 members, 24h activity retention | 10k messages/mo, 500 guide recipients; unlimited profiles | 10k sends/mo | **1,000 deliveries/mo**, 1 project | 10k notifications/mo; inbox **with SuprSend branding** |
| Paid at scale | Pro from $30/mo (30k+), $1.20/1k over; Team from $250/mo (250k+) | Starter $250/mo (50k), then $0.005/msg | Pay-as-you-go $0.005/send | Startup $249/mo (50k), then $0.0025 | Essentials $100/mo (50k), $2/1k; Business $250/mo, $5/1k |

## Findings by criterion, with sources

### 1. SDK fit for React 19 / React Router 8

- No vendor publishes React Router–specific guidance. All of them use the same pattern: a client-side provider and component, plus a server SDK called from loaders and actions. In Cadence, a loader would mint the per-user token or hash and pass it to the client, and actions or services would trigger workflows.
- Novu: `@novu/react@3.19.2` declares peer `react ^18.0.0 || ^19.0.0`. It has conditional exports, so the server import resolves to `dist/esm/server/index.js`, which is SSR-safe in a framework-mode loader. Source: `npm view @novu/react peerDependencies exports` (https://www.npmjs.com/package/@novu/react).
- Knock: `@knocklabs/react@0.15.1` declares peer `react ^17 || ^18 || ^19`. Its `next` and `@tanstack/react-router` peers are marked optional. Source: https://www.npmjs.com/package/@knocklabs/react (`peerDependenciesMeta`).
- Courier: `@trycourier/courier-react` v9 is for "React 18+". It renders client-side only (the docs say to add `'use client'` in Next.js). Sources: https://www.courier.com/docs/platform/inbox/inbox-overview and https://www.courier.com/docs/sdk-libraries/courier-react-web.
- MagicBell: `@magicbell/react` (https://www.magicbell.com/docs/libraries/react). The older `@magicbell/magicbell-react` (peer `react >=18.3.1`) still exists on npm.
- SuprSend: the old `@suprsend/react-inbox` is end-of-support. Use `@suprsend/react` instead. Source: https://docs.suprsend.com/docs/inbox-react.

### 2. Ready-made inbox and how far it can be styled

- **Novu.** `appearance.variables` sets global values (`colorPrimary`, `colorBackground`, `borderRadius`, ...). `appearance.elements` styles each element, and "the value can be either a style object or a set of CSS classes", including **Tailwind classes**, CSS modules and callback functions. Source: https://docs.novu.co/platform/inbox/configuration/styling. The published types include `renderNotification`, `renderSubject`, `renderBody`, `renderAvatar`, `renderBell` and `renderDefaultActions`. The bundle contains no `attachShadow`, so global Tailwind reaches the inbox. Source: inspected `@novu/js@3.19.2` and `@novu/react@3.19.2` tarballs from npm. Note that the Inbox UI is written in Solid.js and mounted into React (`solid-js` is a dependency of `@novu/js`, per `npm view @novu/js dependencies`). That is invisible in use but adds bundle weight.
- **Knock.** It ships `@knocklabs/react/dist/index.css`. You override `--rnf-*` CSS variables or replace the CSS entirely ("All feed classes are unique and start with `rnf-`"). `renderItem` overrides each row, and `colorMode="dark"` switches to dark mode. Source: https://docs.knock.app/in-app-ui/react/feed. The component depends on Knock's Telegraph design system (`@telegraph/*`), `@radix-ui/react-dialog` and `lucide-react`. Source: `npm view @knocklabs/react dependencies`.
- **Courier.** You theme it through `CourierInboxTheme` and can replace parts of it. Source: https://www.courier.com/docs/platform/inbox/inbox-overview. The React wrapper exposes `renderListItem`, `renderHeader`, `renderEmptyState`, `renderLoadingState`, `renderErrorState`, `renderMenuButton` and `renderPaginationItem`. Source: inspected `@trycourier/courier-react-components@2.3.5`. Underneath, it is a set of custom elements. The main `CourierInbox` and list are in light DOM, but the unread badge and option menu use **shadow DOM**, so Tailwind cannot reach them and only the theme object can style them. Source: `attachShadow` calls in `@trycourier/courier-ui-inbox@2.7.4` (`CourierUnreadCountBadge`, `CourierInboxOptionMenu`).
- **MagicBell.** It ships stylesheets with "predefined class names" you can override, plus CSS variables such as `--magicbell-bg-default`. `FloatingInbox` takes `ButtonComponent`/`InboxComponent` and `Inbox` takes `ItemComponent`. Source: https://www.magicbell.com/docs/libraries/react.
- **SuprSend.** It has a `theme` object, `themeType` (dark or light), and component slots (`notificationComponent`, `bellComponent`, `badgeComponent`, `headerRightComponent`, `noNotificationsComponent`, ...). Toasts are no longer part of the Inbox. Source: https://docs.suprsend.com/docs/react-in-app-feed. On the free plan the inbox carries SuprSend branding (https://www.suprsend.com/pricing).

### 3. Headless / API-only option

- Novu: `useNotifications` (pagination, live updates), `useCounts`, `useNovu`, plus `novu.on()` events. Source: https://docs.novu.co/platform/inbox/headless-mode. `usePreferences` and `useSchedule` are also exported (inspected the `@novu/react` tarball).
- Knock: `useKnockClient`, `useNotifications`, `useNotificationStore`. With headless use you must call `markAllAsSeen()` yourself. Source: https://docs.knock.app/in-app-ui/react/headless/feed. `@knocklabs/react-core` also exports `usePreferences` and `useKnockFeed` (inspected the tarball).
- Courier: `useCourier()` returns `auth`, `inbox`, `preferences`, ..., which you can use to "build your own UI". Source: https://www.courier.com/docs/sdk-libraries/courier-react-web.
- SuprSend: `useFeedClient`, `useFeedData`. Source: https://docs.suprsend.com/docs/react-sdk-headless-feed.
- MagicBell: the React page does not document hooks (https://www.magicbell.com/docs/libraries/react). The `magicbell-js` client is available.

### 4. Free tier and paid pricing (checked 2026-11-11)

- Novu: Free tier is $0 with 10,000 workflow runs/mo, 5 workflows, 2 environments, 3 team members, 24h activity-feed retention and unlimited subscribers. Pro starts at $30/mo (30k+ runs, $1.20 per 1k over, 20 workflows, 7-day retention). Team starts at $250/mo (250k+ runs, 100 workflows, 90-day retention). Source: https://novu.co/pricing. The page does not define a "workflow run".
- Knock: Free tier is $0 with up to 10,000 messages and 500 guide recipients. Starter is $250/mo with 50,000 messages, then $0.005 each. A message is "a single message delivered to a single user on a single channel", and messages suppressed by preferences are not billed. Source: https://knock.app/pricing.
- Courier: The Developer plan is free with 10,000 sends/mo. Business is $0.005 per send. The page says pricing is "based on notifications sent, not team size or channels" and does not say whether Inbox is limited on the free plan. Source: https://www.courier.com/pricing.
- MagicBell: Builder is free with **1,000 deliveries/mo** and 1 project. Startup is $249/mo with 50,000 deliveries, then $0.0025 each. Deliveries are counted per channel. Source: https://www.magicbell.com/pricing.
- SuprSend: Free tier is $0 with 10,000 notifications/mo and the inbox shows SuprSend branding. Essentials is $100/mo with 50k, then $2 per 1k. Business is $250/mo with 50k, then $5 per 1k. Source: https://www.suprsend.com/pricing.

### 5. Securing the inbox per user

- Novu: turn on "Security HMAC encryption" on the In-App integration. The server computes `HMAC-SHA256(NOVU_SECRET_KEY, subscriberId)` (lowercase hex) and passes it as `subscriberHash`. Without it the Inbox won't load. Source: https://docs.novu.co/platform/inbox/prepare-for-production. The hash never expires, so revoking access means rotating the secret.
- Knock: in "enhanced security mode", requests that use only the public key are rejected. The server signs an RS256 JWT (`sub` = user id) with `signUserToken` from `@knocklabs/node` (default lifetime 3600s), and `onUserTokenExpiring` refreshes it. Source: https://docs.knock.app/in-app-ui/security-and-authentication.
- Courier: the backend mints a JWT with scopes `inbox:read:messages` and `inbox:write:events`, and the client calls `signIn({ userId, jwt })`. Source: https://www.courier.com/docs/sdk-libraries/courier-react-web.
- MagicBell: user JWTs are "generated on your backend using the Secret Key and the API Key" and sent as `Authorization: Bearer <jwt>`. Source: https://www.magicbell.com/docs/api/authentication.
- SuprSend: "Inbox authentication has been upgraded from HMAC `subscriber_id` to signed JWT user tokens". Source: https://docs.suprsend.com/docs/inbox-react.

All five fit Cadence the same way: the root or layout loader reads the session user and returns a token or hash to the client.

### 6. Local dev and tests without the real service

- None of the vendors documents an official in-process mock or emulator for their SDK. In every case the practical approach for Vitest is the same: put the vendor SDK behind a Cadence service module and `vi.mock` it. That follows the project's existing route → service pattern and the `~/db` mocking convention.
- **Novu is the only one that can run fully offline.** The community edition self-hosts with Docker Compose (API, worker, WebSocket service, dashboard, MongoDB, Redis) via the setup script, with the dashboard at `http://localhost:4000`. Source: https://docs.novu.co/community/self-hosting-novu/deploy-with-docker. Some cloud-only features are not available self-hosted. Source: https://docs.novu.co/community/self-hosting-novu/overview.
- Knock offers a development environment plus "branches" to isolate each developer's changes, but no local runtime. Source: https://docs.knock.app/concepts/environments.
- I found no documented local emulator for Courier, MagicBell or SuprSend. Each has dev or staging environments in the cloud.

### 7. Live updates and per-user settings

- Novu: `useNotifications` handles "live updates". Source: https://docs.novu.co/platform/inbox/headless-mode. The transport is WebSocket (`socket.io-client`, `partysocket` dependencies of `@novu/js`). Preferences come at three levels (workflow channel > subscriber global > subscriber per-workflow), and "critical" workflows are hidden from the preferences screen and always delivered in-app. Sources: https://docs.novu.co/platform/inbox/configuration/preferences and https://docs.novu.co/platform/concepts/preferences.
- Knock: a real-time socket (`phoenix` dependency of `@knocklabs/client`), plus `auto_manage_socket_connection` for inactive tabs. Source: https://docs.knock.app/in-app-ui/react/feed. Preferences use a PreferenceSet with `categories`, `workflows`, `channel_types` and `channels`, and a hosted page or a custom UI built on the API. Source: https://docs.knock.app/preferences/overview.
- Courier: WebSocket via `inbox.listenForUpdates()`, with read state synced across devices. It has a preference center. Sources: https://www.courier.com/docs/sdk-libraries/courier-react-web and https://www.courier.com/docs/platform/inbox/inbox-overview.
- MagicBell: WebSocket (`reconnecting-websocket` dependency of `@magicbell/react`). The `UserPreferences` component "lets users toggle notification channels per category". Source: https://www.magicbell.com/docs/libraries/react.
- SuprSend: socket with a reachability state machine (ONLINE/CONNECTING/DEGRADED/...). Source: https://docs.suprsend.com/docs/react-in-app-feed.

## Why Novu over Knock

1. **Styling fit.** Of the five, only Novu takes Tailwind class strings per element, and its render props let us drop in shadcn components. Knock can be made to look like Cadence, but through a separate CSS-variable and class layer on top of its own Telegraph design system.
2. **Offline dev.** Novu can run under Docker. Knock is cloud only.
3. **Cost curve.** Novu goes from free to $30/mo; Knock goes from free to $250/mo.
4. **Parity elsewhere.** Both support React 19, have headless hooks with `usePreferences`, use WebSockets and offer per-user preferences.

## Risks and open questions

- **Novu free plan allows only 5 workflows.** Cadence will likely need one workflow per Notification type (enrolment, new lesson, review, team invite, ...). Five will run out early in development. Pro ($30/mo) raises it to 20, or self-hosting avoids the cap during development.
- Novu's 24h activity-feed retention on the free plan makes debugging delivery harder.
- Novu's `subscriberHash` does not expire, unlike Knock's or SuprSend's JWTs.
- Novu's Inbox is Solid.js under the hood. Before committing, check its bundle size and whether React 19 SSR hydration in RR8 framework mode is clean.
- Not evaluated in depth: Engagespot, Pingram/NotificationAPI, and Stream's feeds product.
- Suggested next step: a throwaway prototype (see the `prototype` skill) of Novu `<Inbox />` styled with Cadence's Tailwind tokens in one RR8 route, with Knock as a fallback spike.
