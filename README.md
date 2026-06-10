# PolicyQuest

PolicyQuest is a classroom-ready public policy co-design simulation built with Next.js. It helps student teams work through a realistic policy mission: review evidence, assume confidential stakeholder roles, negotiate constraints, respond to events, build a service improvement proposal, and pitch a policy recommendation.

The app is designed for public policy, public administration, governance, global health policy, and co-design workshops.

## Current Features

- Clean homepage with a direct mission start
- Country context selection for Qatar, the United Kingdom, and Pakistan
- Policy challenge selection across health, education, and environment themes
- Evidence packs grounded in source-based policy context
- Confidential stakeholder role assignment with QR role access
- Printable confidential role cards and role packs
- Co-design workspace with four stages:
  - Understand Experiences
  - Imagine the Ideal
  - Create New Ideas
  - Make Decisions
- Resource tokens, constraints, and policy event cards
- Stakeholder voting with support, support with changes, and oppose options
- Realistic assessment that stays pending until meaningful gameplay decisions are recorded
- Final policy brief, reflection report, facilitator assessment, and progress summary
- Final cabinet pitch page with reviewer scoring
- Local browser storage for session continuity

## Policy Challenges

PolicyQuest currently includes:

- Mental Health Services Access
- Maternal Health Services Access
- Vaccine Hesitancy
- School Dropout Prevention
- Climate Adaptation

## Scoring Approach

PolicyQuest does not show default scores on first load. Assessment remains pending until teams have made enough meaningful decisions, including evidence use, resource allocation, constraint selection, event response, stakeholder voting, and written final outputs.

When ready, the simulation generates traceable 1-5 scores for:

- Inclusion
- Feasibility
- Impact
- Equity
- Sustainability

The overall policy score is shown only after the required gameplay actions are complete.

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Build for production:

```bash
npm run build
```

## Deployment

PolicyQuest is intended to deploy on Vercel as a standard Next.js App Router project. No backend, login, database, or external AI service is required for Version 1. Session data is stored locally in the browser.

Before deploying, confirm that the installed Next.js version matches the version in `package.json` and that `npm run build` passes.
