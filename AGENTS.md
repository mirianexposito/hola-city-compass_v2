<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.

<!-- LOVABLE:END -->

## Application structure

- Keep each content screen in its own TanStack file route with leaf metadata so navigation and previews remain independent.
- Keep one AccountProvider Auth listener validating identity with getUser; account and administration screens live under the client-only _authenticated gate, while the home, Mi Zaragoza, Descubre planes, Conoce gente, Información útil, sign-in, password recovery and the onboarding questionnaire remain public, preventing unauthenticated content and loader access.
- The public onboarding ends with account creation (name, email, password); the create_city_profile trigger stores the display name from signup metadata, and CityProvider saves the browser's guest answers to the new account on first sign-in, never overwriting a saved profile.
- Reuse Cloud Auth for email verification, password credentials, persistent sessions and recovery; Google/Lovable retain public same-origin broker callbacks, and allowlisted return paths prevent open redirects.
- Store privileges in owner-readable user_roles with no client writes; authorize every administration function through the caller's has_role RPC before dynamically importing the privileged client, so UI or metadata changes cannot grant access.
- Keep account settings and the administrator directory in separate authenticated routes; use RLS for personal names, Cloud Auth for confirmed email/password changes, and a transactional RPC for role changes so private questionnaire answers stay owner-only and the final administrator is protected.
- Mount CityProvider and the city navigation within the authenticated layout and the public home and onboarding pages only, so private profile reads and local state never render on public authentication pages.
- Keep guest state and per-account state in separate validated localStorage scopes; CityProvider loads and explicitly saves questionnaire answers through owner-only profile CRUD when signed in, while conversations, favorites and itinerary remain browser-local to prevent account data leaking to guests.
- Discard account-owned local state when entering no-login mode so a previous account's answers never become a shared browser profile.
- Store synthetic questionnaire samples in the separate shared demo_profiles CRUD sandbox, with fictional-only RLS and a database constraint and no account references; public CRUD is limited to examples and must never overwrite browser preferences or private owner profiles.
- Keep the simulated assistant as one conversation and pass its full history and profile to a browser-safe adapter; inference remains unconnected and deterministic.
- Reuse usePilarChat on the public home and the dedicated chat so both share scoped history and reply behavior; ignore pending replies after unmount or account changes to prevent cross-account writes.
- Fetch fixed Zaragoza weather from Open-Meteo in a public read-only server function, validate its response and prime TanStack Query from the dashboard loader; this avoids exposing profile data and keeps provider failures from blocking the city experience.
- Fetch the fixed municipal library and civic-center directories through a public read-only server function with validated paginated JSON and independent source failures; prime Query inside the authenticated information route, filter locally without sending profile data upstream, and render municipal HTML only as text with official attribution and record dates.
- Generate seven-day plans from recommendation constraints and store per-day assignments and completion; use practical-resource tasks when no eligible activity exists rather than fabricating availability.
- Keep personalization, filters and simulated assistant logic in the browser-safe city-logic module; isolate its reply contract so a later service can replace the simulator.
- Keep activity and official-resource data in city-data and use uploaded asset pointers; do not hotlink photographs or present unconfirmed activities as bookable events.
- Use semantic styles in the global stylesheet and named Button variants so presentation stays consistent across all screens.
- Scope newcomer-home presentation under arrival-home and reuse existing questionnaire, chat and activity controls so other screens and shared navigation remain unchanged.
- Reuse NeighborhoodSelect for onboarding and profile editing with one grouped city-data catalog; this keeps location choices consistent without free-text entry.
- Define questionnaire steps in the browser-safe questionnaire module and reuse CustomAnswerChoice for goals and desired activities; free answers stay in existing preference arrays alongside preset selections without changing storage or recommendation contracts.
- Keep questionnaire navigation in OnboardingFlow using the shared step catalog and CityProvider answers; returning from registration to the actual questions must preserve other answers and unsubmitted registration fields.
- Compose the existing simulated chat using AI Elements conversation, markdown messages and prompt-input primitives; no model streaming is connected because this MVP explicitly uses deterministic local replies.
