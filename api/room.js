const HOST_CODE = process.env.HOST_CODE || "OAI123456";
const ROOM_KEY = "singapore-100-office-trivia-room";
const QUESTION_COUNT = 15;
const DURATION_MS = 5 * 60 * 1000;
const PARTICIPANT_STALE_MS = 10 * 60 * 1000;
const CORRECT_ANSWERS = Array.from({ length: QUESTION_COUNT }, () => 0);

function makeEmptyRoom() {
  return {
    status: "lobby",
    startedAt: null,
    durationMs: DURATION_MS,
    participants: {},
    answers: {},
    updatedAt: Date.now(),
  };
}

function getMemoryRoom() {
  if (!globalThis.__singapore100TriviaRoom) {
    globalThis.__singapore100TriviaRoom = makeEmptyRoom();
  }
  return globalThis.__singapore100TriviaRoom;
}

function setMemoryRoom(room) {
  globalThis.__singapore100TriviaRoom = room;
}

function hasKv() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function kvCommand(command) {
  const response = await fetch(process.env.KV_REST_API_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(command),
  });

  if (!response.ok) {
    throw new Error(`KV command failed with ${response.status}`);
  }

  return response.json();
}

async function loadRoom() {
  if (!hasKv()) return getMemoryRoom();

  const data = await kvCommand(["GET", ROOM_KEY]);
  if (!data?.result) return makeEmptyRoom();

  try {
    return JSON.parse(data.result);
  } catch {
    return makeEmptyRoom();
  }
}

async function saveRoom(room) {
  room.updatedAt = Date.now();

  if (!hasKv()) {
    setMemoryRoom(room);
    return;
  }

  await kvCommand(["SET", ROOM_KEY, JSON.stringify(room), "EX", "86400"]);
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("cache-control", "no-store");
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function sanitizeName(value) {
  return String(value || "Player")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 24) || "Player";
}

function makeId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function normalizeRoom(room) {
  const now = Date.now();
  const normalized = room && typeof room === "object" ? room : makeEmptyRoom();
  normalized.participants ||= {};
  normalized.answers ||= {};
  normalized.durationMs ||= DURATION_MS;

  if (normalized.status === "active" && normalized.startedAt && now >= normalized.startedAt + normalized.durationMs) {
    normalized.status = "ended";
  }

  if (normalized.status !== "ended") {
    Object.entries(normalized.participants).forEach(([id, participant]) => {
      if (!participant?.lastSeen || now - participant.lastSeen > PARTICIPANT_STALE_MS) {
        delete normalized.participants[id];
      }
    });
  }

  return normalized;
}

function elapsedFromStart(room, timestamp) {
  if (!room.startedAt || !timestamp) return null;
  return Math.max(0, timestamp - room.startedAt);
}

function buildLeaderboard(room) {
  const participants = Object.values(room.participants || {});
  const answers = room.answers || {};
  const participantIds = new Set([
    ...participants.map((participant) => participant.id),
    ...Object.keys(answers),
  ]);

  const rows = Array.from(participantIds).map((participantId) => {
    const participant = room.participants?.[participantId] || {};
    const answerRow = answers[participantId] || { participantId, responses: {} };
    const responses = Object.values(answerRow.responses || {});
    const answeredAtValues = responses
      .map((response) => response.answeredAt)
      .filter((answeredAt) => Number.isFinite(answeredAt));
    const lastAnsweredAt = answeredAtValues.length ? Math.max(...answeredAtValues) : null;
    const correct = responses.filter((response) => response.correct).length;
    const answered = responses.length;
    const finishedInMs = answered >= QUESTION_COUNT ? elapsedFromStart(room, lastAnsweredAt) : null;

    return {
      participantId,
      name: sanitizeName(answerRow.name || participant.name),
      correct,
      answered,
      finishedInMs,
      lastAnswerInMs: elapsedFromStart(room, lastAnsweredAt),
      joinedAt: participant.joinedAt || 0,
    };
  });

  rows.sort((left, right) => {
    const leftFinished = left.finishedInMs ?? Number.MAX_SAFE_INTEGER;
    const rightFinished = right.finishedInMs ?? Number.MAX_SAFE_INTEGER;
    const leftLast = left.lastAnswerInMs ?? Number.MAX_SAFE_INTEGER;
    const rightLast = right.lastAnswerInMs ?? Number.MAX_SAFE_INTEGER;

    return (
      right.correct - left.correct ||
      right.answered - left.answered ||
      leftFinished - rightFinished ||
      leftLast - rightLast ||
      left.joinedAt - right.joinedAt ||
      left.name.localeCompare(right.name)
    );
  });

  return rows.map((row, index) => ({
    rank: index + 1,
    name: row.name,
    correct: row.correct,
    answered: row.answered,
    finishedInMs: row.finishedInMs,
    lastAnswerInMs: row.lastAnswerInMs,
  }));
}

function publicRoom(room) {
  const participants = Object.values(room.participants || {})
    .map((participant) => ({
      id: participant.id,
      name: participant.name,
      joinedAt: participant.joinedAt,
      lastSeen: participant.lastSeen,
    }))
    .sort((left, right) => left.joinedAt - right.joinedAt);

  const answerRows = Object.values(room.answers || {});
  const answersByQuestion = Array.from({ length: QUESTION_COUNT }, (_, questionIndex) => {
    const answers = answerRows
      .map((row) => row.responses?.[questionIndex])
      .filter(Boolean);
    return {
      questionIndex,
      total: answers.length,
      correct: answers.filter((answer) => answer.correct).length,
      choices: answers.reduce((counts, answer) => {
        counts[answer.answerIndex] = (counts[answer.answerIndex] || 0) + 1;
        return counts;
      }, {}),
    };
  });

  return {
    status: room.status,
    startedAt: room.startedAt,
    durationMs: room.durationMs,
    now: Date.now(),
    participants,
    participantCount: participants.length,
    responseCount: answerRows.reduce((count, row) => count + Object.keys(row.responses || {}).length, 0),
    completedCount: answerRows.filter((row) => Object.keys(row.responses || {}).length >= QUESTION_COUNT).length,
    answersByQuestion,
    leaderboard: room.status === "ended" ? buildLeaderboard(room) : [],
    storage: hasKv() ? "kv" : "memory",
  };
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;

  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });
}

module.exports = async function handler(req, res) {
  try {
    let room = normalizeRoom(await loadRoom());

    if (req.method === "GET") {
      const participantId = String(req.query.participantId || "");
      if (participantId && room.participants[participantId]) {
        room.participants[participantId].lastSeen = Date.now();
        await saveRoom(room);
      }
      return json(res, 200, { room: publicRoom(room) });
    }

    if (req.method !== "POST") {
      return json(res, 405, { error: "Method not allowed" });
    }

    const body = await readBody(req);
    const action = String(body.action || "");

    if (action === "join") {
      const id = String(body.participantId || "") || makeId();
      const name = sanitizeName(body.name);
      room.participants[id] = {
        id,
        name,
        joinedAt: room.participants[id]?.joinedAt || Date.now(),
        lastSeen: Date.now(),
      };
      if (!room.answers[id]) {
        room.answers[id] = { participantId: id, name, responses: {} };
      } else {
        room.answers[id].name = name;
      }
      await saveRoom(room);
      return json(res, 200, { participantId: id, room: publicRoom(room) });
    }

    if (action === "start") {
      if (String(body.code || "") !== HOST_CODE) {
        return json(res, 403, { error: "Invalid host code" });
      }
      room.status = "active";
      room.startedAt = Date.now();
      room.durationMs = DURATION_MS;
      room.answers = {};
      await saveRoom(room);
      return json(res, 200, { room: publicRoom(room) });
    }

    if (action === "reset") {
      if (String(body.code || "") !== HOST_CODE) {
        return json(res, 403, { error: "Invalid host code" });
      }
      room = makeEmptyRoom();
      await saveRoom(room);
      return json(res, 200, { room: publicRoom(room) });
    }

    if (action === "answer") {
      room = normalizeRoom(room);
      if (room.status !== "active") {
        return json(res, 409, { error: "Room is not active", room: publicRoom(room) });
      }

      const participantId = String(body.participantId || "");
      if (!participantId) {
        return json(res, 400, { error: "participantId is required" });
      }

      const name = sanitizeName(body.name);
      const questionIndex = Number.parseInt(body.questionIndex, 10);
      const answerIndex = Number.parseInt(body.answerIndex, 10);

      if (!Number.isInteger(questionIndex) || questionIndex < 0 || questionIndex >= QUESTION_COUNT) {
        return json(res, 400, { error: "Invalid question index" });
      }
      if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex > 3) {
        return json(res, 400, { error: "Invalid answer index" });
      }

      const correct = answerIndex === CORRECT_ANSWERS[questionIndex];

      room.participants[participantId] = {
        id: participantId,
        name,
        joinedAt: room.participants[participantId]?.joinedAt || Date.now(),
        lastSeen: Date.now(),
      };
      room.answers[participantId] ||= { participantId, name, responses: {} };
      room.answers[participantId].name = name;
      room.answers[participantId].responses[questionIndex] = {
        answerIndex,
        correct,
        answeredAt: Date.now(),
      };

      await saveRoom(room);
      return json(res, 200, { room: publicRoom(room) });
    }

    return json(res, 400, { error: "Unknown action" });
  } catch (error) {
    return json(res, 500, { error: error instanceof Error ? error.message : "Unexpected error" });
  }
};
