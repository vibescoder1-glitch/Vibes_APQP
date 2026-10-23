# Local Development

## Prerequisites

- Node.js 20.9 or newer
- npm
- Git

## Run locally

```bash
git clone https://github.com/vibescoder1-glitch/Vibes_APQP.git
cd Vibes_APQP
npm install
npm run dev
```

Open http://localhost:3000.

## Current MVP limitations

- Dashboard rows and action-item toggles use illustrative data stored only in browser memory.
- Creating a project modifies current page state; refreshing the page resets that change.
- Authentication, authorization, the PostgreSQL schema, document uploads, approval workflows and persistent APIs have not yet been implemented.
- Do not enter real customer, supplier, product or confidential plant data into this demo.
