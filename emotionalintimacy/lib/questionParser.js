const QUESTION_PREFIX_REGEX = /^(q(uestion)?\s*:\s*)/i;
const WHITESPACE_REGEX = /\s+/g;

const QUESTION_WORDS = new Set(["who", "what", "when", "where", "why", "how"]);
const YES_NO_WORDS = new Set([
  "is",
  "are",
  "am",
  "do",
  "does",
  "did",
  "can",
  "could",
  "would",
  "should",
  "will",
  "have",
  "has",
  "had"
]);

const TOPIC_RULES = [
  { topic: "trust", keywords: ["trust", "honest", "lie", "faithful", "betray"] },
  { topic: "communication", keywords: ["talk", "listen", "communicat", "argue", "understand"] },
  { topic: "affection", keywords: ["love", "affection", "touch", "hug", "kiss", "intimate"] },
  { topic: "conflict", keywords: ["fight", "conflict", "upset", "frustrat", "hurt"] },
  { topic: "family", keywords: ["family", "parent", "kids", "child", "home"] },
  { topic: "future", keywords: ["future", "goal", "plan", "dream", "next year"] },
  { topic: "boundaries", keywords: ["boundary", "space", "need", "respect"] },
  { topic: "gratitude", keywords: ["appreciate", "grateful", "thank", "admire"] },
  { topic: "support", keywords: ["support", "help", "there for", "encourage"] },
  { topic: "finances", keywords: ["money", "budget", "spend", "save", "debt"] }
];

const INTIMACY_KEYWORDS = [
  "feel",
  "emotion",
  "love",
  "close",
  "connected",
  "trust",
  "afraid",
  "vulnerable",
  "intimate",
  "appreciate"
];

function sanitizeInput(value) {
  if (typeof value !== "string") {
    return "";
  }
  return value.replace(QUESTION_PREFIX_REGEX, "").replace(WHITESPACE_REGEX, " ").trim();
}

function detectQuestionType(text) {
  const candidate = (text || "").trim().toLowerCase();
  if (!candidate) {
    return "unknown";
  }

  const firstWord = candidate.split(/[^a-z']/i)[0];
  if (QUESTION_WORDS.has(firstWord)) {
    return firstWord;
  }
  if (YES_NO_WORDS.has(firstWord)) {
    return "yes_no";
  }
  if (candidate.endsWith("?")) {
    return "open";
  }
  return "statement";
}

function normalizeQuestion(text) {
  const sanitized = sanitizeInput(text);
  if (!sanitized) {
    return "";
  }

  const type = detectQuestionType(sanitized);
  const needsQuestionMark = type !== "statement" && !sanitized.endsWith("?");
  return needsQuestionMark ? `${sanitized}?` : sanitized;
}

function detectTopics(text) {
  const lower = (text || "").toLowerCase();
  if (!lower) {
    return [];
  }

  const topics = [];
  for (const rule of TOPIC_RULES) {
    if (rule.keywords.some((keyword) => lower.includes(keyword))) {
      topics.push(rule.topic);
    }
  }
  return topics;
}

function computeIntimacyScore(text) {
  const lower = (text || "").toLowerCase();
  if (!lower) {
    return 0;
  }

  let hitCount = 0;
  for (const keyword of INTIMACY_KEYWORDS) {
    if (lower.includes(keyword)) {
      hitCount += 1;
    }
  }
  return Number((Math.min(hitCount / INTIMACY_KEYWORDS.length, 1) * 100).toFixed(1));
}

function parseQuestion(rawQuestion) {
  const raw = typeof rawQuestion === "string" ? rawQuestion.trim() : "";
  const normalized = normalizeQuestion(raw);
  const type = detectQuestionType(normalized);
  const topics = detectTopics(normalized);
  const intimacyScore = computeIntimacyScore(normalized);

  return {
    raw,
    normalized,
    type,
    topics,
    intimacyScore,
    isQuestion: type !== "statement" && type !== "unknown"
  };
}

module.exports = {
  parseQuestion
};
