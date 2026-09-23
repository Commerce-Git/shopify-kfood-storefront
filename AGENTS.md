<!-- BEGIN:platform-direction -->
# Current platform direction

Start with [the shared platform index](docs/platform-analysis/README.md), then read [the goal and confirmed decisions](docs/platform-analysis/PROJECT_DIRECTION.md). Read the relevant module, journey, contract and evidence for the task; do not restart the entire analysis on each turn.

- Current business: Korean-manufactured products. K-Food is deferred; its older strategy documents are historical context. Do not reopen this decision without a new user request or concrete evidence affecting the current goal.
- Treat storefront and `../blank-seoul-admin` as one platform when assessing dependencies. This does not expand filesystem permissions or the bridge runner's scope.
- Evaluate proposals against artist sales/settlement, buyer trust and sustainable operating cost/workload. Distinguish confirmed policy, proposal, observed implementation and verified behavior.
- Preserve the overall module assessment when investigating a defect. Do not select the next implementation merely because a defect was found. Relate it to the goal, affected modules and acceptance criteria.
- Product category, market and metric proposals remain proposals until decided. Continue independent technical analysis while those decisions are pending.
- Record goal changes in PROJECT_DIRECTION, progress/next actions in the index, and task execution in agent-bridge. Past COMMAND/REPORT/REVIEW files are evidence of their own run, not authorization for the current task.
- The user applies Supabase SQL/migrations and performs Git push manually.
<!-- END:platform-direction -->

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:marketing-persona-rules -->
# 🧠 Russell Brunson Marketing Persona (UI/UX)

When designing commercial landing pages or promotional copy, use Russell Brunson's "DotCom Secrets" and "Sales Funnel" frameworks where they support the confirmed platform goals. Product discovery, account, order, support and operational screens must serve their own user journeys. Current product scope and user decisions take precedence over historical campaign examples.

1. **Clear objectives**: Give each screen a clear user objective and appropriate navigation. Apply sales funnels to relevant promotional journeys.
2. **Hook-Story-Offer**: For promotional pages, structure the message around:
   - **Hook**: Grab attention immediately within the hero section (e.g., bold claims, curiosity, pattern interrupt).
   - **Story**: Explain the verified value of the Korean-manufactured product and its maker.
   - **Offer**: Present clear product, price and service terms. Use guarantees, urgency or scarcity only when supported by actual policy or availability.
3. **Relevant offers**: Propose complementary products only when supported by the current catalog and journey. Treat order bumps and one-time offers as proposals, not mandatory features.
4. **Clear actions**: Button text must accurately describe the next action. Do not imply a purchase, subscription or guarantee beyond what the action actually does.
<!-- END:marketing-persona-rules -->

<!-- BEGIN:compliance-email-rules -->
# ⚖️ Legal & Privacy Compliance (CAN-SPAM / CCPA / GDPR)

When creating or modifying ANY email capture form, newsletter box, or waitlist component:
1. You MUST ALWAYS include the standardized `<EmailConsentNotice />` component directly below the submit button or input.
2. The disclosure must explicitly state "No spam. Unsubscribe anytime." and contain a clickable link to `/policies/privacy` opening in a new tab (`target="_blank" rel="noopener noreferrer"`).
3. NEVER write plain text spam assurances without the Privacy Policy link.
<!-- END:compliance-email-rules -->
