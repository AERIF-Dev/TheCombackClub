# Implementation and verification report

## Public access and authentication update — October 27, 2026

The owner requested public access; Sites access is now public. Homepage and demo require no sign-in. Header and onboarding use top-level Continue with ChatGPT links to the platform path. The platform handles sign-out. Persistent member records are keyed by trusted authenticated identity; repeated callbacks reuse the same member. The account name is returned only to that member, with email fallback kept out of public profile defaults. Demo scope and member authorization remain separate. Older owner-private references below describe the first release.

Final hosted verification: the owner completed real ChatGPT sign-in. The authenticated account label and member profile loaded, a temporary bio change persisted after reload, and the original bio was restored and rechecked. Sign-out returned to the public homepage, and the signed-out browser entered Marcus's isolated demo. All 34 integration checks also passed against the public production URL without service credentials, including direct/circle matching, proposal approvals, persistence, isolation, and impact accounting. TypeScript, the production build, and all 8 unit tests passed.

ChatGPT plan-backed inference is not enabled. The [official remotely hosted-app route](https://developers.openai.com/siwc/token-sharing-open-source) requires requesting access through the [interest form](https://openai.com/form/sign-in-with-chatgpt-interest/), selecting **Sign in and ChatGPT plan use for AI requests**. The local open-source OAuth flow and Codex app-server example do not establish approval for this hosted Site. No Codex credentials were accessed.

No production environment variables or standard authorized provider keys were configured when inspected. Real inference remains unavailable. To enable the existing server adapter, configure an authorized `OPENAI_API_KEY` as a Sites secret and an eligible `OPENAI_MODEL`, redeploy, and verify a successful skill-understanding response with recorded latency. API billing is separate from a ChatGPT subscription. Rule-based suggestions remain explicitly labeled as non-AI output.

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
- All 34 HTTP integration checks also passed against the published Sites-managed D1 database using supported service access and isolated fictional demo sessions. This verifies hosted persistence, approvals, authorization, concurrency protection, and completed-hour accounting. The test client's cookie jar explicitly retains the application session alongside Sites' separate access mechanism.
- Official branding visually checked on the homepage and member dashboard after integration; original logo checksum matches the supplied file. Metadata, full logo, and compact exchange-symbol crops are included in the release.
- Visual inspection at narrow (~497 px) and desktop (~1236 px) widths. Native dialog behavior, readable cards, horizontal mobile navigation, and circle visualization checked.

## Limits and honest status

- Live AI inference was not configured or tested with a real credential. It is visibly unavailable; no fallback is counted as model output. AI-assisted proposal metrics are zero because proposal drafting is deterministic.
- The production member identity handshake is now verified through the owner's real ChatGPT sign-in, as recorded above. The initial owner-private release was changed to public at the owner's explicit request. GitHub history preserves the original implementation commit.
- This is a hackathon MVP, not a fully moderated public marketplace: no staffed report review, notifications, private messaging, reputation, vetting, or uploads. No payments or exact addresses.
- Matching supports the explicit task taxonomy in `lib/model.ts`; unknown specialized skills may require a new synonym or task entry. Approximate hours and schedules need participant confirmation. Travel is neighborhood-level, not a distance estimate.
- Proposed scopes cannot be edited after others have begun approving; cancel and create a new listing/match for materially revised commitments. A previously proposed exact match is not proposed again, preserving duplicate prevention.
- Availability is Morning, Evening, Weekend, or Flexible; no calendar integration. Demo records expire for authentication after 30 days, but automatic background deletion is not implemented. Reset deletes the current demo records.
- The matching/search snapshot is designed for this small community. Before a large public launch, add pagination, indexed queries, storage quotas, session cleanup, and broader abuse controls.
- Google Fonts are optional external presentation assets; system-font fallbacks keep the application usable if fonts cannot load.

## Historical attribution

The app references [Unity in Our Community TimeBank](https://www.southwestdetroittimebank.org/) as inspiration and links the [Michigan Alliance of Timebanks](https://mitimebanks.org/join-a-timebank/). It makes no claim of official affiliation or invented organizational history.
