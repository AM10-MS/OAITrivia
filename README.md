# Singapore 100 Office Trivia Static

A dependency-free version of the Singapore 100 Office Trivia game. Open `index.html` directly, or serve this folder with any static web host.

The question bank is based on non-sensitive Singapore office facts from the Singapore site playbook and APAC workplace orientation: location, access flow, desk capacity, operating hours, room names, food timing, pantry rhythm, visitor flow, safety basics, and office norms.

This version is designed as a Vercel-hosted live-room experience:

- participants enter a name and join
- the host enters `OAI123456` and starts when the room is ready
- everyone gets 5 minutes to answer on their own phone
- answer choices are intentionally close and confusing
- scores and rankings stay hidden during the game
- when time ends, everyone can see the final participant leaderboard
- the host screen still shows aggregate response counts during play

Use **Demo Mode** from the host panel when opening `index.html` locally. It simulates players, responses, and the 5-minute timer so you can preview the flow before deploying.

## Vercel note

The app includes `api/room.js` for live phone sync. For reliable state across Vercel serverless instances, add Vercel KV / Upstash environment variables:

- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

Without those, the API falls back to in-memory state, which can work for quick tests but is not guaranteed across serverless cold starts.
