const API_ENDPOINT = "/api/room";
const PLAYER_KEY = "singapore100OfficeTriviaPlayer";
const PARTICIPANT_KEY = "singapore100OfficeTriviaParticipant";
const POLL_MS = 1500;
const QUESTION_COUNT = 15;

const questions = [
  {
    category: "Milestone",
    question: "The celebration is for Singapore reaching which milestone?",
    answers: [
      "100 desks at CapitaSpring",
      "100 access cards issued by TWP",
      "100 employees in Singapore",
      "100 days since the Level 40 move"
    ],
    correct: 2,
    detail: "The milestone is the Singapore office reaching 100 employees."
  },
  {
    category: "Location",
    question: "Which address is the cleanest match for the Singapore office?",
    answers: [
      "88 Marina Boulevard, CapitaSpring",
      "80 Market Street, CapitaSpring",
      "88 Market Street, CapitaSpring",
      "88 Market Street, Marina One"
    ],
    correct: 2,
    detail: "The Singapore office address is 88 Market Street, CapitaSpring."
  },
  {
    category: "Hours",
    question: "Which operating-hours statement is most precise?",
    answers: [
      "9am to 6pm, Monday to Friday, including Singapore public holidays",
      "8am to 6pm, Monday to Friday, excluding Singapore public holidays",
      "9am to 6pm daily, as long as TWP reception is open",
      "9am to 6pm, Monday to Friday, excluding Singapore public holidays"
    ],
    correct: 3,
    detail: "The standard office window is 9am to 6pm, Monday to Friday, excluding Singapore public holidays."
  },
  {
    category: "Level 40",
    question: "Which provider name is the right one for the serviced-office layer?",
    answers: [
      "The Workplace Project",
      "CapitaSpring Work Project",
      "The Work Project",
      "The Working Platform"
    ],
    correct: 2,
    detail: "The Singapore office operates within The Work Project, often shortened to TWP."
  },
  {
    category: "Access",
    question: "Which access stack is the best match for the normal Singapore flow?",
    answers: [
      "CapitaStar@Work QR, OAI photo badge, printer PIN",
      "CapitaStar@Work QR, TWP badge, OAI photo badge",
      "TWP badge, Visitly pass, OAI laptop sticker",
      "Ground-floor QR, room booking, Slack profile"
    ],
    correct: 1,
    detail: "The normal stack is building QR, TWP badge, then OAI photo badge."
  },
  {
    category: "Visitors",
    question: "After the ground-floor lobby step, where should external visitors normally land?",
    answers: [
      "Level 40 TWP Reception",
      "Office 4003 without stopping",
      "The Level 21 event space",
      "The basement loading bay"
    ],
    correct: 0,
    detail: "Visitors go to Level 40 TWP Reception before being escorted to the OAI suite."
  },
  {
    category: "Capacity",
    question: "The Singapore office has 64 desks plus 48 additional seats. What is the total capacity?",
    answers: [
      "114",
      "112",
      "108",
      "116"
    ],
    correct: 1,
    detail: "64 plus 48 gives a total capacity of 112."
  },
  {
    category: "Pantry",
    question: "Which drink shows up as a popular item in both the 23 Mar and 27 Apr pantry insight weeks?",
    answers: [
      "Perrier Sparkling Water",
      "100Plus Sports Drink",
      "Dash Sparkling Raspberry Water",
      "Coke Zero"
    ],
    correct: 3,
    detail: "Coke Zero appears as a popular pantry item in both the 23 Mar and 27 Apr weekly pantry insights."
  },
  {
    category: "Rooms",
    question: "Which pair is the strongest clue for the main Singapore event-room names?",
    answers: [
      "Marina Bay and Botanic",
      "Straits and Marina Bay",
      "Straits and Kaya Toast",
      "Board Room and Merlion"
    ],
    correct: 1,
    detail: "Straits and Marina Bay are the main event-room names referenced in the playbook."
  },
  {
    category: "Food",
    question: "Which Singapore meal allowance timing set is the accurate one?",
    answers: [
      "Breakfast 7am-10am, lunch 10am-2pm, dinner 5pm-9pm",
      "Breakfast 8am-10am, lunch 10am-2pm, dinner 5pm-8pm",
      "Breakfast 7am-10am, lunch 11am-2pm, dinner 5pm-9pm",
      "Breakfast 8am-10am, lunch 10am-3pm, dinner 5pm-9pm"
    ],
    correct: 0,
    detail: "The updated Singapore allowance timing is breakfast 7am-10am, lunch 10am-2pm, and dinner 5pm-9pm."
  },
  {
    category: "Pantry",
    question: "Which vendor is tied to pantry shelves and chillers, not just office supplies or meal delivery?",
    answers: [
      "Deliveroo",
      "Lyreco",
      "Caterspot",
      "Prince Landscape"
    ],
    correct: 2,
    detail: "Caterspot is referenced for pantry shelves, chillers, snacks, fruit, beverages, and coffee."
  },
  {
    category: "Pantry",
    question: "Which snack was called out as popular in the 6 Apr-10 Apr pantry insight week?",
    answers: [
      "WantWant Rice Crackers",
      "Hey!Chips Corn Crisps",
      "Hello Panda Chocolate Biscuits",
      "Organic Pitted Dates"
    ],
    correct: 2,
    detail: "Hello Panda Chocolate Biscuits were called out as popular in the 6 Apr-10 Apr weekly pantry insights."
  },
  {
    category: "Safety",
    question: "Which AED location set is the precise one from the playbook?",
    answers: [
      "Office 4003, Straits, and Marina Bay",
      "Office 4011, Level 1 concierge, and TWP Reception Level 40",
      "Office 4003, Office 4013, and the loading dock",
      "Office 4003, Office 4011, and TWP Reception Level 40"
    ],
    correct: 3,
    detail: "AEDs are listed at Office 4003, Office 4011, and TWP Reception Level 40."
  },
  {
    category: "Norms",
    question: "Which room norm is the one to remember?",
    answers: [
      "Release booked rooms if plans change",
      "Release booked rooms only after the first 15 minutes",
      "Keep booked rooms if a meeting might return later",
      "Move rooms to a new booking instead of releasing them"
    ],
    correct: 0,
    detail: "The orientation lists releasing booked rooms if plans change as an office norm."
  },
  {
    category: "Access",
    question: "The CapitaStar@Work QR is mainly for which first barrier?",
    answers: [
      "OAI suite badge readers",
      "TWP meeting-room booking screens",
      "Ground floor lobby turnstiles",
      "The pantry chiller access log"
    ],
    correct: 2,
    detail: "The QR code is used at the ground floor lobby turnstiles before heading to Level 40."
  }
];

const state = {
  room: null,
  playerName: "Player",
  participantId: "",
  joined: false,
  questionIndex: 0,
  localAnswers: {},
  answerStorageKey: "",
  apiOnline: false,
  hostUnlocked: false,
  submitting: false
};

const els = {
  playerName: document.querySelector("#player-name"),
  playerBadge: document.querySelector("#player-badge"),
  hostCode: document.querySelector("#host-code"),
  join: document.querySelector("#join-button"),
  unlock: document.querySelector("#unlock-button"),
  hostActions: document.querySelector("#host-actions"),
  start: document.querySelector("#start-button"),
  reset: document.querySelector("#reset-button"),
  refresh: document.querySelector("#refresh-button"),
  category: document.querySelector("#category"),
  question: document.querySelector("#question"),
  answers: document.querySelector("#answers"),
  feedback: document.querySelector("#feedback"),
  checkpoints: document.querySelector("#checkpoint-grid"),
  roundLabel: document.querySelector("#round-label"),
  progressBar: document.querySelector("#progress-bar"),
  timer: document.querySelector("#timer-readout"),
  participantCount: document.querySelector("#participant-count"),
  responseCount: document.querySelector("#response-count"),
  roomStatus: document.querySelector("#room-status"),
  roomSubtitle: document.querySelector("#room-subtitle"),
  pulseGrid: document.querySelector("#pulse-grid"),
  stepJoin: document.querySelector("#step-join"),
  stepStart: document.querySelector("#step-start"),
  stepAnswer: document.querySelector("#step-answer")
};

function buildCheckpoints() {
  els.checkpoints.innerHTML = questions
    .map((_, index) => `<span class="checkpoint" data-checkpoint="${index}">${index + 1}</span>`)
    .join("");
}

function loadInitialState() {
  state.playerName = loadLocal(PLAYER_KEY) || "Player";
  state.participantId = loadLocal(PARTICIPANT_KEY) || "";
  els.playerName.value = state.playerName === "Player" ? "" : state.playerName;
  state.joined = Boolean(state.participantId && els.playerName.value.trim());
  render();
}

function loadLocal(key) {
  try {
    return localStorage.getItem(key) || "";
  } catch {
    return "";
  }
}

function saveLocal(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Local storage is optional.
  }
}

function answerKey() {
  if (!state.participantId || !state.room?.startedAt) return "";
  return `singapore100Answers:${state.participantId}:${state.room.startedAt}`;
}

function syncAnswerStorage() {
  const key = answerKey();
  if (!key || key === state.answerStorageKey) return;

  state.answerStorageKey = key;
  try {
    state.localAnswers = JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    state.localAnswers = {};
  }
  state.questionIndex = firstUnansweredQuestion();
}

function saveAnswers() {
  if (!state.answerStorageKey) return;
  try {
    localStorage.setItem(state.answerStorageKey, JSON.stringify(state.localAnswers));
  } catch {
    // Local answer memory is optional.
  }
}

async function apiRequest(method = "GET", payload = null) {
  const url = method === "GET" && state.participantId
    ? `${API_ENDPOINT}?participantId=${encodeURIComponent(state.participantId)}`
    : API_ENDPOINT;
  const options = {
    method,
    headers: { accept: "application/json" }
  };
  if (payload) {
    options.headers["content-type"] = "application/json";
    options.body = JSON.stringify(payload);
  }

  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Room API unavailable");
  }
  return data;
}

async function pollRoom() {
  try {
    const data = await apiRequest("GET");
    state.apiOnline = true;
    applyRoom(data.room);
  } catch {
    state.apiOnline = false;
    render();
  }
}

function applyRoom(room) {
  state.room = room;
  if (room?.status === "active") {
    syncAnswerStorage();
  }
  render();
}

function getName() {
  const name = els.playerName.value.trim().replace(/\s+/g, " ").slice(0, 24);
  return name || "Player";
}

async function joinRoom() {
  const name = getName();
  if (name === "Player" && !els.playerName.value.trim()) {
    setFeedback("Type your name before joining.", true);
    return;
  }

  state.playerName = name;
  saveLocal(PLAYER_KEY, name);

  setFeedback("Joining room...", true);

  try {
    const data = await apiRequest("POST", {
      action: "join",
      name,
      participantId: state.participantId
    });
    state.apiOnline = true;
    state.participantId = data.participantId;
    state.joined = true;
    saveLocal(PARTICIPANT_KEY, state.participantId);
    applyRoom(data.room);
    setFeedback(`${name} joined. Wait for the host to start.`, true);
  } catch (error) {
    state.apiOnline = false;
    setFeedback(`${error.message}. Deploy to Vercel to enable phone sync.`, true);
    render();
  }
}

async function unlockHost() {
  const code = els.hostCode.value.trim();
  if (!code) {
    setFeedback("Enter the host code to unlock host controls.", true);
    return;
  }

  setFeedback("Checking host code...", true);
  try {
    const data = await apiRequest("POST", { action: "verify", code });
    state.apiOnline = true;
    state.hostUnlocked = true;
    renderHostControls();
    applyRoom(data.room);
    setFeedback("Host controls unlocked. You can start or reset the room.", true);
  } catch (error) {
    state.hostUnlocked = false;
    renderHostControls();
    setFeedback(error.message, true);
  }
}

function requireHostUnlock() {
  if (state.hostUnlocked) return true;
  setFeedback("Unlock host controls with the host code first.", true);
  renderHostControls();
  return false;
}

async function startRoom() {
  if (!requireHostUnlock()) return;

  const code = els.hostCode.value.trim();
  if (!code) {
    setFeedback("Host code required before the room can start.", true);
    return;
  }

  setFeedback("Starting the 5-minute room...", true);
  try {
    const data = await apiRequest("POST", { action: "start", code });
    state.localAnswers = {};
    state.answerStorageKey = "";
    applyRoom(data.room);
    setFeedback("Room started. Everyone has 5 minutes.", true);
  } catch (error) {
    setFeedback(error.message, true);
  }
}

async function resetRoom() {
  if (!requireHostUnlock()) return;

  const code = els.hostCode.value.trim();
  if (!code) {
    setFeedback("Enter the host code to reset the room.", true);
    return;
  }

  setFeedback("Resetting room...", true);
  try {
    const data = await apiRequest("POST", { action: "reset", code });
    state.localAnswers = {};
    state.answerStorageKey = "";
    state.questionIndex = 0;
    applyRoom(data.room);
    setFeedback("Room reset. Ask everyone to join again.", true);
  } catch (error) {
    setFeedback(error.message, true);
  }
}

async function submitAnswer(answerIndex) {
  if (state.submitting || !isActive() || !state.joined) return;
  const questionIndex = state.questionIndex;
  const current = questions[questionIndex];
  if (!current || Object.prototype.hasOwnProperty.call(state.localAnswers, questionIndex)) return;

  state.submitting = true;
  state.localAnswers[questionIndex] = answerIndex;
  saveAnswers();
  render();

  try {
    const data = await apiRequest("POST", {
      action: "answer",
      participantId: state.participantId,
      name: state.playerName,
      questionIndex,
      answerIndex,
      correct: answerIndex === current.correct
    });
    applyRoom(data.room);
    state.questionIndex = firstUnansweredQuestion();
    setFeedback("Answer saved. Keep going.", true);
  } catch (error) {
    setFeedback(`Saved on this phone, but sync failed: ${error.message}`, true);
  } finally {
    state.submitting = false;
    state.questionIndex = firstUnansweredQuestion();
    render();
  }
}

function isActive() {
  return state.room?.status === "active" && remainingMs() > 0;
}

function remainingMs() {
  if (!state.room?.startedAt) return state.room?.durationMs || 5 * 60 * 1000;
  return Math.max(0, state.room.startedAt + state.room.durationMs - Date.now());
}

function firstUnansweredQuestion() {
  for (let index = 0; index < questions.length; index += 1) {
    if (!Object.prototype.hasOwnProperty.call(state.localAnswers, index)) return index;
  }
  return questions.length;
}

function answeredCount() {
  return Object.keys(state.localAnswers).length;
}

function setFeedback(message, isEmpty = false) {
  els.feedback.textContent = message;
  els.feedback.classList.toggle("empty", isEmpty);
}

function render() {
  renderHeader();
  renderHostControls();
  renderSteps();
  renderCheckpoints();
  renderPulse();
  renderQuestion();
}

function renderHostControls() {
  els.hostActions.hidden = !state.hostUnlocked;
  els.start.disabled = !state.hostUnlocked;
  els.reset.disabled = !state.hostUnlocked;
  els.unlock.disabled = state.hostUnlocked;
  els.unlock.textContent = state.hostUnlocked ? "Unlocked" : "Unlock";
}

function renderHeader() {
  const room = state.room;
  const timeLeft = remainingMs();
  const duration = room?.durationMs || 5 * 60 * 1000;
  const elapsed = room?.startedAt ? Math.min(duration, Math.max(0, Date.now() - room.startedAt)) : 0;
  const progress = room?.status === "active" ? (elapsed / duration) * 100 : room?.status === "ended" ? 100 : 0;

  els.timer.textContent = formatTime(timeLeft);
  els.progressBar.style.width = `${Math.min(100, progress)}%`;
  els.participantCount.textContent = String(room?.participantCount || 0);
  els.responseCount.textContent = String(room?.responseCount || 0);

  if (!state.apiOnline) {
    els.roomStatus.textContent = "Sync offline";
    els.roomSubtitle.textContent = "This file preview cannot sync phones. Deploy to Vercel for live play.";
    els.roundLabel.textContent = "Waiting for API";
  } else if (room?.status === "active") {
    els.roomStatus.textContent = "Room active";
    els.roomSubtitle.textContent = "Phones are answering. Timer is live.";
    els.roundLabel.textContent = `Time left ${formatTime(timeLeft)}`;
  } else if (room?.status === "ended") {
    els.roomStatus.textContent = "Time ended";
    els.roomSubtitle.textContent = "The 5-minute answering window is closed.";
    els.roundLabel.textContent = "Room complete";
  } else {
    els.roomStatus.textContent = "Lobby waiting";
    els.roomSubtitle.textContent = "Host unlocks with the host code, then everyone gets 5 minutes.";
    els.roundLabel.textContent = "Room waiting";
  }

  els.playerBadge.textContent = state.joined
    ? `${state.playerName} joined`
    : "Waiting for name";
}

function renderSteps() {
  const status = state.room?.status || "lobby";
  els.stepJoin.classList.toggle("active", status === "lobby");
  els.stepStart.classList.toggle("active", status === "lobby" && state.joined);
  els.stepAnswer.classList.toggle("active", status === "active");
}

function renderCheckpoints() {
  document.querySelectorAll(".checkpoint").forEach((checkpoint, index) => {
    const answered = Object.prototype.hasOwnProperty.call(state.localAnswers, index);
    checkpoint.classList.toggle("active", isActive() && index === state.questionIndex);
    checkpoint.classList.toggle("done", answered);
  });
}

function renderQuestion() {
  if (!state.apiOnline) {
    els.category.textContent = "Sync unavailable";
    els.question.textContent = "Deploy this folder to Vercel, then share the Vercel link with everyone.";
    els.answers.innerHTML = "";
    return;
  }

  if (state.room?.status === "lobby") {
    els.category.textContent = "Lobby";
    els.question.textContent = "Everyone enters their name. Host enters code and starts when ready.";
    els.answers.innerHTML = "";
    setFeedback(state.joined ? "You are in. Waiting for host start." : "Join with your name before the host starts.", true);
    return;
  }

  if (state.room?.status === "ended" || remainingMs() <= 0) {
    els.category.textContent = "Final ranking";
    els.question.textContent = "The 5-minute window is closed. Here is the participant leaderboard.";
    els.answers.innerHTML = endStateMarkup();
    setFeedback("Ranking is based on correct answers. Faster completion breaks ties.", true);
    return;
  }

  if (!state.joined) {
    els.category.textContent = "Join required";
    els.question.textContent = "Type your name and join to answer on this device.";
    els.answers.innerHTML = "";
    setFeedback("Host has started. Join now if you are playing from this phone.", true);
    return;
  }

  const index = firstUnansweredQuestion();
  state.questionIndex = index;

  if (index >= questions.length) {
    els.category.textContent = "Submitted";
    els.question.textContent = "All answers submitted.";
    els.answers.innerHTML = endStateMarkup();
    setFeedback("Nice. Your phone has submitted all 15 answers. Leaderboard unlocks when the timer ends.", true);
    return;
  }

  const current = questions[index];
  els.category.textContent = current.category;
  els.question.textContent = current.question;
  els.answers.innerHTML = current.answers
    .map((answer, answerIndex) => `
      <button class="answer" type="button" data-answer="${answerIndex}" ${state.submitting ? "disabled" : ""}>
        <span class="answer-letter">${String.fromCharCode(65 + answerIndex)}</span>
        <span>${escapeHtml(answer)}</span>
      </button>
    `)
    .join("");
  setFeedback(`Question ${index + 1} of ${questions.length}. Choose carefully; the options are intentionally close.`, true);
}

function renderPulse() {
  const room = state.room;
  if (!room?.answersByQuestion?.length) {
    els.pulseGrid.innerHTML = Array.from({ length: QUESTION_COUNT }, (_, index) => `
      <div class="pulse-cell">
        <span>Q${index + 1}</span>
        <strong>0</strong>
      </div>
    `).join("");
    return;
  }

  els.pulseGrid.innerHTML = room.answersByQuestion
    .map((row) => {
      const suffix = room.status === "ended" ? `${row.correct}/${row.total}` : row.total;
      return `
        <div class="pulse-cell">
          <span>Q${row.questionIndex + 1}</span>
          <strong>${suffix}</strong>
        </div>
      `;
    })
    .join("");
}

function endStateMarkup() {
  const answered = answeredCount();
  const roomEnded = state.room?.status === "ended" || remainingMs() <= 0;
  return `
    <div class="end-state">
      <strong>${answered}/${questions.length}</strong>
      <span>Your submitted answers on this device.</span>
      <span>${roomEnded ? "Final participant ranking is below." : "Leaderboard unlocks after the 5-minute window closes."}</span>
    </div>
    ${roomEnded ? leaderboardMarkup(state.room?.leaderboard || []) : leaderboardLockedMarkup()}
  `;
}

function leaderboardLockedMarkup() {
  return `
    <section class="leaderboard locked" aria-label="Locked leaderboard">
      <div class="leaderboard-head">
        <span>Leaderboard</span>
        <strong>Hidden during play</strong>
      </div>
      <p>Scores stay private until the room ends, so everyone can answer without watching the ranking move.</p>
    </section>
  `;
}

function leaderboardMarkup(rows) {
  if (!rows.length) {
    return `
      <section class="leaderboard" aria-label="Final leaderboard">
        <div class="leaderboard-head">
          <span>Leaderboard</span>
          <strong>No submissions yet</strong>
        </div>
      </section>
    `;
  }

  return `
    <section class="leaderboard" aria-label="Final leaderboard">
      <div class="leaderboard-head">
        <span>Leaderboard</span>
        <strong>Final ranking</strong>
      </div>
      <div class="leaderboard-list">
        ${rows.map(leaderboardRowMarkup).join("")}
      </div>
    </section>
  `;
}

function leaderboardRowMarkup(row) {
  const topRank = row.rank <= 3 ? " top-rank" : "";
  return `
    <div class="leaderboard-row${topRank}">
      <span class="rank">#${row.rank}</span>
      <span class="leader-name">${escapeHtml(row.name)}</span>
      <span class="leader-score">${row.correct}/${questions.length}</span>
      <span class="leader-meta">${row.answered}/${questions.length} answered - ${leaderboardTimeLabel(row)}</span>
    </div>
  `;
}

function leaderboardTimeLabel(row) {
  if (Number.isFinite(row.finishedInMs)) return `Finished ${formatDuration(row.finishedInMs)}`;
  if (Number.isFinite(row.lastAnswerInMs)) return `Last answer ${formatDuration(row.lastAnswerInMs)}`;
  return "No answers";
}

function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[character]);
}

els.answers.addEventListener("click", (event) => {
  const button = event.target.closest(".answer");
  if (!button) return;
  submitAnswer(Number(button.dataset.answer));
});

els.playerName.addEventListener("input", () => {
  state.playerName = getName();
  saveLocal(PLAYER_KEY, state.playerName);
  renderHeader();
});
els.hostCode.addEventListener("input", () => {
  if (!state.hostUnlocked) return;
  state.hostUnlocked = false;
  renderHostControls();
  setFeedback("Host controls locked because the code changed.", true);
});
els.join.addEventListener("click", joinRoom);
els.unlock.addEventListener("click", unlockHost);
els.start.addEventListener("click", startRoom);
els.reset.addEventListener("click", resetRoom);
els.refresh.addEventListener("click", pollRoom);

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    if (document.activeElement === els.hostCode) {
      unlockHost();
      return;
    }
    if (!state.joined) {
      joinRoom();
    }
  }
});

buildCheckpoints();
loadInitialState();
pollRoom();
setInterval(pollRoom, POLL_MS);
setInterval(render, 1000);
