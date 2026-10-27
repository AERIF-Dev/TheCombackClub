# Implementation and verification report

## Shipped behavior

- Responsive official Detroit heritage identity: warm cream, forest green, burnt orange, soft sage, and retro display typography; homepage, how-it-works, featured exchanges, circles, mission/history, privacy guidance, and functional navigation. The supplied logo is preserved unchanged, with clean symbol crops for compact branding and favicon, plus branded metadata/social-preview defaults.
- Durable relational D1 schema, generated migrations, transactional per-session seed data, 15 fictional residents, four direct matches, two valid three-way circles, and unmatched examples.
- Guest demo with participant switching, isolated session data, refresh persistence, and safe session-scoped reset. Demo bearer cookies are HTTP-only, SameSite=Lax, Secure over HTTPS, and stored as hashes server-side; member IDs do not reveal a usable bearer token.
- Separate real-member accounts through Sites identity, editable profiles and listings, search/category/neighborhood/type filtering, member details, and block/report records.
- Deterministic task/synonym matching, category validation, compatible meeting modes, overlapping availability, effort bounds, duplicate-cycle canonicalization, blocked-neighbor exclusion, and reservation of listings already used in exchanges. No probabilistic or generic-category-only match acceptance.
- Direct and circle proposals with immutable listing snapshots, editable scope before proposal, per-participant approvals, explicit start, individual completion confirmation, cancellation, and exactly-once completed-hour accounting. A unique database reservation prevents concurrent proposals from double-booking a listing.
- Agreement details are returned only to participants. Real identity is always server-derived. Demo switching accepts only fictional members in the current session. Mutation endpoints validate input and same-origin requests.
- Impact metrics use persisted records, separate demo/real scopes, and no fabricated value or cash-savings claims.
- A reviewed skill-suggestion workflow with a labeled rule provider, server-only optional OpenAI provider, bounded requests, output validation, error fallback, and persisted provider/latency/error metrics. Match explanations, fairness cautions, and proposal drafts are deterministic.

## Verification completed

- TypeScript strict check and production Vinext build.
- 8 initial matching unit tests: valid seed graph, required Marcus circle, distinct cycles/unmatched members, synonyms, rejection of generic categories, incompatible schedule/location/effort/scope/inactive listings, prior-match/block exclusion, and rule-based offer/need parsing.
- 34 HTTP integration checks against the running local D1-backed application, including writes, fresh-request persistence, ownership, session isolation, direct/circle approvals, invalid lifecycle transitions, duplicate prevention, cancellation, private agreements, current listing snapshots, concurrent reservations, exactly-once six-hour completion, reset, origin validation, and fallback labeling.
- Browser walkthrough: enter demo, inspect the circle visualization, create proposal, switch participants, approve as Jasmine and Derek, explicitly start, confirm completion as all three, inspect six persisted hours, and reload.
- Browser checks for profile editing, creating an offer, searching network listings, neighborhood filtering, and the Sites starter's local member sign-in flow.
- Visual inspection at narrow (~497 px) and desktop (~1236 px) widths. Native dialog behavior, readable cards, horizontal mobile navigation, and circle visualization checked.

## Limits and honest status

- Live AI inference was not configured or tested with a real credential. It is visibly unavailable; no fallback is counted as model output. AI-assisted proposal metrics are zero because proposal drafting is deterministic.
- The real production identity handshake still depends on Sites dispatch and user access. Local sign-in was tested with the supplied simulator. Publication status and any hosted checks are recorded by the final handoff, not inferred from a local build.
- This is a hackathon MVP, not a fully moderated public marketplace: no staffed report review, notifications, private messaging, reputation, vetting, or uploads. No payments or exact addresses.
- Matching supports the explicit task taxonomy in `lib/model.ts`; unknown specialized skills may require a new synonym or task entry. Approximate hours and schedules need participant confirmation. Travel is neighborhood-level, not a distance estimate.
- Proposed scopes cannot be edited after others have begun approving; cancel and create a new listing/match for materially revised commitments. A previously proposed exact match is not proposed again, preserving duplicate prevention.
- Availability is Morning, Evening, Weekend, or Flexible; no calendar integration. Demo records expire for authentication after 30 days, but automatic background deletion is not implemented. Reset deletes the current demo records.
- The matching/search snapshot is designed for this small community. Before a large public launch, add pagination, indexed queries, storage quotas, session cleanup, and broader abuse controls.
- Google Fonts are optional external presentation assets; system-font fallbacks keep the application usable if fonts cannot load.

## Historical attribution

The app references [Unity in Our Community TimeBank](https://www.southwestdetroittimebank.org/) as inspiration and links the [Michigan Alliance of Timebanks](https://mitimebanks.org/join-a-timebank/). It makes no claim of official affiliation or invented organizational history.
