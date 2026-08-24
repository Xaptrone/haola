# AI operating layer

AI is how work gets done. It is not a help widget.

## Surfaces that use AiWorkspace

- Guest campaign prompt on the landing (ephemeral workspace)
- Business onboarding and campaign create (business workspace)
- Creator blank canvas, virtual KOL create, content production (creator studio)
- QC results, revision checklists, approvals (cards inside review)

## Context object (permission-clipped)

```ts
type AiContext = {
  workspaceId: string | 'guest'
  workspaceKind: 'guest' | 'creator' | 'business' | 'manager'
  userId?: string
  role: 'anonymous' | 'creator' | 'business' | 'manager' | 'admin'
  restaurantId?: string
  creatorId?: string
  kolId?: string
  campaignId?: string
  stage: string
  knownFacts: Record<string, { value: unknown; provenance: Provenance }>
  missingFacts: string[]
  priorDecisions: string[]
}
```

## Clarify protocol

If a fact is required and missing (outlet, price scope, visit/taste, bookings vs awareness, promo window), ask one short question with 2–3 chips. Do not invent.

## Output

Short sentence + **action card(s)**. Card types: avatar proposal, AMF score, campaign brief, recommended KOL, content-angle, QC report, revision checklist, approval, payment summary, restaurant setup.

Actions depend on role + stage: Accept, Edit, Regenerate, Compare, Submit, Approve, Request revision, Save draft.

## Provenance

Every field and card shows: User | Verified | AI suggestion | Predicted | Manager decision.

AMF and match scores are Predicted. Factor breakdown is inspectable for authorised roles.

## Drafts

Persist after every turn. Guest drafts promote into the business workspace on register.

## Guest vs signed-in

Guest may generate a sample brief + KOL recommendations. Publishing, paying, and assigning a restaurant that is not yet verified require a business workspace.
