const state = {
  entries: [],
  favoritesOnly: false,
  batchItems: []
};

const form = document.getElementById("entry-form");
const entryIdInput = document.getElementById("entry-id");
const questionInput = document.getElementById("question");
const answerInput = document.getElementById("answer");
const askedByInput = document.getElementById("askedBy");
const answeredByInput = document.getElementById("answeredBy");
const statusInput = document.getElementById("status");
const isFavoriteInput = document.getElementById("isFavorite");
const saveBtn = document.getElementById("save-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const generateBatchBtn = document.getElementById("generate-batch-btn");
const batchBuilder = document.getElementById("batch-builder");
const batchItemList = document.getElementById("batch-item-list");
const saveBatchBtn = document.getElementById("save-batch-btn");
const clearBatchBtn = document.getElementById("clear-batch-btn");

const searchInput = document.getElementById("search");
const filterAnsweredByInput = document.getElementById("filterAnsweredBy");
const filterQuestionTypeInput = document.getElementById("filterQuestionType");
const sortInput = document.getElementById("sort");
const favoritesOnlyBtn = document.getElementById("favorites-only-btn");

const parseDetails = document.getElementById("parse-details");
const entryList = document.getElementById("entry-list");
const template = document.getElementById("entry-template");
const statsGrid = document.getElementById("stats-grid");

function debounce(fn, delayMs) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delayMs);
  };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function splitBatchQuestions(raw) {
  const lines = (raw || "")
    .replace(/\r/g, "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^(?:[-*]|\u2022)\s+/, "").replace(/^\d+[\).\-\s]+/, "").trim())
    .filter(Boolean);

  const questions = [];
  for (const line of lines) {
    if (line.includes("?")) {
      const segments = (line.match(/[^?]+\??/g) || []).map((part) => part.trim()).filter(Boolean);
      questions.push(...segments);
    } else {
      questions.push(line);
    }
  }

  return questions.filter(Boolean);
}

function renderBatchItems() {
  if (!state.batchItems.length) {
    batchBuilder.hidden = true;
    batchItemList.innerHTML = "";
    return;
  }

  batchBuilder.hidden = false;
  batchItemList.innerHTML = state.batchItems
    .map(
      (item, index) => `
      <article class="batch-item" data-index="${index}">
        <div class="batch-item-head">
          <p>Entry ${index + 1}</p>
          <button type="button" class="ghost batch-remove-btn" data-index="${index}">Remove</button>
        </div>
        <label for="batch-question-${index}">Question</label>
        <textarea id="batch-question-${index}" class="batch-question" data-index="${index}" placeholder="Question">${
          escapeHtml(item.question)
        }</textarea>
        <label for="batch-answer-${index}">Answer</label>
        <textarea id="batch-answer-${index}" class="batch-answer" data-index="${index}" placeholder="Answer">${
          escapeHtml(item.answer || "")
        }</textarea>
      </article>
    `
    )
    .join("");
}

function collectBatchInputsFromDom() {
  const questionNodes = batchItemList.querySelectorAll(".batch-question");
  const answerNodes = batchItemList.querySelectorAll(".batch-answer");

  const questionsByIndex = new Map();
  for (const node of questionNodes) {
    const index = Number(node.dataset.index);
    if (!Number.isNaN(index)) {
      questionsByIndex.set(index, node.value.trim());
    }
  }

  const answersByIndex = new Map();
  for (const node of answerNodes) {
    const index = Number(node.dataset.index);
    if (!Number.isNaN(index)) {
      answersByIndex.set(index, node.value.trim());
    }
  }

  state.batchItems = state.batchItems
    .map((item, index) => ({
      ...item,
      question: questionsByIndex.get(index) || "",
      answer: answersByIndex.get(index) || ""
    }));
}

function formatDate(value) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function buildQueryString() {
  const params = new URLSearchParams();
  if (searchInput.value.trim()) params.set("search", searchInput.value.trim());
  if (filterAnsweredByInput.value.trim()) params.set("answeredBy", filterAnsweredByInput.value.trim());
  if (filterQuestionTypeInput.value) params.set("questionType", filterQuestionTypeInput.value);
  if (sortInput.value) params.set("sort", sortInput.value);
  if (state.favoritesOnly) params.set("favoritesOnly", "true");
  return params.toString();
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Request failed.");
  }

  return response.json();
}

function setParsePreview(parse) {
  if (!parse || !parse.normalized) {
    parseDetails.textContent = "Type a question to see analysis...";
    return;
  }

  const topics = parse.topics.length ? parse.topics.join(", ") : "none";
  parseDetails.textContent = `Normalized: "${parse.normalized}" | type: ${parse.type} | topics: ${topics} | intimacy score: ${parse.intimacyScore}%`;
}

async function refreshParsePreview() {
  const question = questionInput.value.trim();
  if (!question) {
    setParsePreview(null);
    return;
  }

  const parse = await fetchJson("/api/parse", {
    method: "POST",
    body: JSON.stringify({ question })
  });
  setParsePreview(parse);
}

function clearForm() {
  form.reset();
  entryIdInput.value = "";
  askedByInput.value = "Me";
  answeredByInput.value = "Wife";
  statusInput.value = "answered";
  saveBtn.textContent = "Save Entry";
  cancelEditBtn.hidden = true;
  state.batchItems = [];
  renderBatchItems();
  setParsePreview(null);
}

function loadForm(entry) {
  entryIdInput.value = entry.id;
  questionInput.value = entry.question;
  answerInput.value = entry.answer;
  askedByInput.value = entry.askedBy;
  answeredByInput.value = entry.answeredBy;
  statusInput.value = entry.status;
  isFavoriteInput.checked = entry.isFavorite;
  saveBtn.textContent = "Update Entry";
  cancelEditBtn.hidden = false;
  setParsePreview(entry.parse);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderEntries() {
  entryList.innerHTML = "";
  if (!state.entries.length) {
    entryList.innerHTML = `<p>No entries match your filters yet.</p>`;
    return;
  }

  for (const entry of state.entries) {
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelector(".meta").textContent =
      `Asked by ${entry.askedBy} | Answered by ${entry.answeredBy} | ${entry.status} | ${formatDate(entry.createdAt)}`;
    node.querySelector(".type").textContent = `Type: ${entry.parse?.type || "unknown"} | Favorite: ${
      entry.isFavorite ? "yes" : "no"
    }`;
    node.querySelector(".question").textContent = entry.question;
    node.querySelector(".answer").textContent = entry.answer || "(No answer yet)";
    node.querySelector(".topics").textContent = `Topics: ${
      entry.parse?.topics?.length ? entry.parse.topics.join(", ") : "none detected"
    }`;

    const favoriteBtn = node.querySelector(".favorite-btn");
    favoriteBtn.textContent = entry.isFavorite ? "Unfavorite" : "Favorite";
    favoriteBtn.addEventListener("click", async () => {
      await fetchJson(`/api/entries/${entry.id}/favorite`, { method: "PATCH" });
      await refreshEntries();
      await refreshStats();
    });

    node.querySelector(".edit-btn").addEventListener("click", () => loadForm(entry));
    node.querySelector(".delete-btn").addEventListener("click", async () => {
      const ok = window.confirm("Delete this entry?");
      if (!ok) return;
      await fetchJson(`/api/entries/${entry.id}`, { method: "DELETE" });
      await refreshEntries();
      await refreshStats();
    });

    entryList.appendChild(node);
  }
}

function renderStats(stats) {
  const topResponder = Object.entries(stats.byResponder || {}).sort((a, b) => b[1] - a[1])[0];
  const topTopic = Object.entries(stats.byTopic || {}).sort((a, b) => b[1] - a[1])[0];

  const cards = [
    { label: "Total", value: stats.total ?? 0 },
    { label: "Answered", value: stats.answered ?? 0 },
    { label: "Pending", value: stats.pending ?? 0 },
    { label: "Favorites", value: stats.favorites ?? 0 },
    { label: "Top Responder", value: topResponder ? `${topResponder[0]} (${topResponder[1]})` : "n/a" },
    { label: "Top Topic", value: topTopic ? `${topTopic[0]} (${topTopic[1]})` : "n/a" }
  ];

  statsGrid.innerHTML = cards
    .map(
      (card) =>
        `<div class="stat-card"><p class="label">${card.label}</p><p class="value">${card.value}</p></div>`
    )
    .join("");
}

async function refreshEntries() {
  const query = buildQueryString();
  state.entries = await fetchJson(`/api/entries${query ? `?${query}` : ""}`);
  renderEntries();
}

async function refreshStats() {
  const stats = await fetchJson("/api/stats");
  renderStats(stats);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    question: questionInput.value,
    answer: answerInput.value,
    askedBy: askedByInput.value,
    answeredBy: answeredByInput.value,
    status: statusInput.value,
    isFavorite: isFavoriteInput.checked
  };

  const id = entryIdInput.value.trim();
  if (id) {
    await fetchJson(`/api/entries/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  } else {
    await fetchJson("/api/entries", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }

  clearForm();
  await refreshEntries();
  await refreshStats();
});

cancelEditBtn.addEventListener("click", clearForm);

generateBatchBtn.addEventListener("click", () => {
  const raw = questionInput.value.trim();
  const questions = splitBatchQuestions(raw);

  if (!questions.length) {
    window.alert("Paste one or more questions in the question box first.");
    return;
  }

  const startIndex = state.batchItems.length;
  const newItems = questions.map((question, offset) => ({
    question,
    answer: ""
  }));
  state.batchItems.push(...newItems);
  renderBatchItems();
  questionInput.value = "";
  setParsePreview(null);
});

batchItemList.addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (!target.classList.contains("batch-question") && !target.classList.contains("batch-answer")) return;
  collectBatchInputsFromDom();
});

batchItemList.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (!target.classList.contains("batch-remove-btn")) return;

  const index = Number(target.dataset.index);
  if (Number.isNaN(index)) return;
  collectBatchInputsFromDom();
  state.batchItems.splice(index, 1);
  renderBatchItems();
});

clearBatchBtn.addEventListener("click", () => {
  state.batchItems = [];
  renderBatchItems();
});

saveBatchBtn.addEventListener("click", async () => {
  collectBatchInputsFromDom();
  const items = state.batchItems.filter((item) => item.question.trim());
  if (!items.length) {
    window.alert("No batch entries to save.");
    return;
  }

  const askedBy = askedByInput.value;
  const answeredBy = answeredByInput.value;
  const status = statusInput.value;
  const isFavorite = isFavoriteInput.checked;

  await Promise.all(
    items.map((item) =>
      fetchJson("/api/entries", {
        method: "POST",
        body: JSON.stringify({
          question: item.question,
          answer: item.answer,
          askedBy,
          answeredBy,
          status,
          isFavorite
        })
      })
    )
  );

  state.batchItems = [];
  renderBatchItems();
  await refreshEntries();
  await refreshStats();
});

const debouncedFilterRefresh = debounce(async () => {
  await refreshEntries();
}, 250);

searchInput.addEventListener("input", debouncedFilterRefresh);
filterAnsweredByInput.addEventListener("input", debouncedFilterRefresh);
filterQuestionTypeInput.addEventListener("change", debouncedFilterRefresh);
sortInput.addEventListener("change", debouncedFilterRefresh);

favoritesOnlyBtn.addEventListener("click", async () => {
  state.favoritesOnly = !state.favoritesOnly;
  favoritesOnlyBtn.textContent = `Show Favorites Only: ${state.favoritesOnly ? "On" : "Off"}`;
  await refreshEntries();
});

questionInput.addEventListener(
  "input",
  debounce(async () => {
    await refreshParsePreview();
  }, 300)
);

async function init() {
  await refreshEntries();
  await refreshStats();
}

init().catch((error) => {
  console.error(error);
  entryList.innerHTML = `<p>${error.message}</p>`;
});
