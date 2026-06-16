# Singapore 100 Office Trivia Static

A dependency-free version of the Singapore 100 Office Trivia game. Open `index.html` directly, or serve this folder with any static web host.

The question bank is based on non-sensitive Singapore office facts from the Singapore site playbook and APAC workplace orientation: location, access flow, desk capacity, operating hours, room names, food timing, pantry rhythm, visitor flow, safety basics, and office norms.

This version is designed as a Vercel-hosted live-room experience:

- participants enter a name and join
- the host enters `OAI123456`, unlocks host controls, and starts when the room is ready
- everyone gets 5 minutes to answer on their own phone
- answer choices are intentionally close and confusing
- scores and rankings stay hidden during the game
- when all joined players finish or time ends, everyone can see the final participant leaderboard
- the host screen still shows aggregate response counts during play

## Vercel Redis / Upstash note

The app includes `api/room.js` for live phone sync. For reliable state across Vercel serverless instances, connect an Upstash Redis database through Vercel Marketplace or add REST credentials manually.

The API accepts either pair:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

or:

- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

Without Redis credentials, the API falls back to in-memory state, which can work for quick tests but is not guaranteed across serverless cold starts.
