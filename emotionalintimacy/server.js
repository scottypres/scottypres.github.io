const path = require("path");
const crypto = require("crypto");
const express = require("express");

const { parseQuestion } = require("./lib/questionParser");
const { listEntries, replaceEntries } = require("./lib/store");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(process.cwd(), "public")));

function applyFilters(entries, query) {
  const search = (query.search || "").trim().toLowerCase();
  const answeredBy = (query.answeredBy || "").trim().toLowerCase();
  const askedBy = (query.askedBy || "").trim().toLowerCase();
  const questionType = (query.questionType || "").trim().toLowerCase();
  const favoritesOnly = (query.favoritesOnly || "").trim().toLowerCase() === "true";
  const sort = (query.sort || "desc").trim().toLowerCase();

  let filtered = [...entries];

  if (search) {
    filtered = filtered.filter((entry) => {
      const haystack = [
        entry.question,
        entry.answer,
        entry.askedBy,
        entry.answeredBy,
        ...(entry.parse?.topics || [])
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(search);
    });
  }

  if (answeredBy) {
    filtered = filtered.filter((entry) => (entry.answeredBy || "").toLowerCase() === answeredBy);
  }

  if (askedBy) {
    filtered = filtered.filter((entry) => (entry.askedBy || "").toLowerCase() === askedBy);
  }

  if (questionType) {
    filtered = filtered.filter((entry) => (entry.parse?.type || "").toLowerCase() === questionType);
  }

  if (favoritesOnly) {
    filtered = filtered.filter((entry) => entry.isFavorite);
  }

  filtered.sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return sort === "asc" ? aTime - bTime : bTime - aTime;
  });

  return filtered;
}

function buildStats(entries) {
  const byResponder = {};
  const byAsker = {};
  const byType = {};
  const byTopic = {};

  for (const entry of entries) {
    const responder = entry.answeredBy || "Unknown";
    byResponder[responder] = (byResponder[responder] || 0) + 1;

    const asker = entry.askedBy || "Unknown";
    byAsker[asker] = (byAsker[asker] || 0) + 1;

    const type = entry.parse?.type || "unknown";
    byType[type] = (byType[type] || 0) + 1;

    for (const topic of entry.parse?.topics || []) {
      byTopic[topic] = (byTopic[topic] || 0) + 1;
    }
  }

  const answered = entries.filter((entry) => entry.status === "answered").length;
  const pending = entries.filter((entry) => entry.status !== "answered").length;
  const favorites = entries.filter((entry) => entry.isFavorite).length;

  return {
    total: entries.length,
    answered,
    pending,
    favorites,
    byResponder,
    byAsker,
    byType,
    byTopic
  };
}

function normalizeEntryInput(payload) {
  const question = (payload.question || "").trim();
  const answer = (payload.answer || "").trim();
  const askedBy = (payload.askedBy || "Me").trim();
  const answeredBy = (payload.answeredBy || "Wife").trim();
  const status = (payload.status || (answer ? "answered" : "pending")).trim().toLowerCase();
  const isFavorite = Boolean(payload.isFavorite);

  if (!question) {
    return { error: "Question is required." };
  }

  const parse = parseQuestion(question);

  return {
    data: {
      question: parse.normalized || question,
      answer,
      askedBy,
      answeredBy,
      status: status === "answered" ? "answered" : "pending",
      isFavorite,
      parse
    }
  };
}

app.post("/api/parse", (req, res) => {
  const question = (req.body?.question || "").trim();
  const parse = parseQuestion(question);
  res.json(parse);
});

app.get("/api/entries", async (req, res, next) => {
  try {
    const entries = await listEntries();
    const filtered = applyFilters(entries, req.query);
    res.json(filtered);
  } catch (error) {
    next(error);
  }
});

app.get("/api/stats", async (req, res, next) => {
  try {
    const entries = await listEntries();
    res.json(buildStats(entries));
  } catch (error) {
    next(error);
  }
});

app.get("/api/export", async (req, res, next) => {
  try {
    const entries = await listEntries();
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", "attachment; filename=emotional-intimacy-qa-export.json");
    res.send(JSON.stringify(entries, null, 2));
  } catch (error) {
    next(error);
  }
});

app.post("/api/entries", async (req, res, next) => {
  try {
    const { data, error } = normalizeEntryInput(req.body || {});
    if (error) {
      return res.status(400).json({ error });
    }

    const entries = await listEntries();
    const now = new Date().toISOString();
    const entry = {
      id: crypto.randomUUID(),
      ...data,
      createdAt: now,
      updatedAt: now
    };

    entries.push(entry);
    await replaceEntries(entries);
    return res.status(201).json(entry);
  } catch (error) {
    return next(error);
  }
});

app.put("/api/entries/:id", async (req, res, next) => {
  try {
    const { data, error } = normalizeEntryInput(req.body || {});
    if (error) {
      return res.status(400).json({ error });
    }

    const entries = await listEntries();
    const index = entries.findIndex((entry) => entry.id === req.params.id);
    if (index < 0) {
      return res.status(404).json({ error: "Entry not found." });
    }

    entries[index] = {
      ...entries[index],
      ...data,
      updatedAt: new Date().toISOString()
    };

    await replaceEntries(entries);
    return res.json(entries[index]);
  } catch (error) {
    return next(error);
  }
});

app.patch("/api/entries/:id/favorite", async (req, res, next) => {
  try {
    const entries = await listEntries();
    const entry = entries.find((item) => item.id === req.params.id);
    if (!entry) {
      return res.status(404).json({ error: "Entry not found." });
    }

    if (typeof req.body?.isFavorite === "boolean") {
      entry.isFavorite = req.body.isFavorite;
    } else {
      entry.isFavorite = !entry.isFavorite;
    }
    entry.updatedAt = new Date().toISOString();

    await replaceEntries(entries);
    return res.json(entry);
  } catch (error) {
    return next(error);
  }
});

app.delete("/api/entries/:id", async (req, res, next) => {
  try {
    const entries = await listEntries();
    const index = entries.findIndex((entry) => entry.id === req.params.id);
    if (index < 0) {
      return res.status(404).json({ error: "Entry not found." });
    }

    const [removed] = entries.splice(index, 1);
    await replaceEntries(entries);
    return res.json({ deleted: removed.id });
  } catch (error) {
    return next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Unexpected server error." });
});

app.listen(PORT, () => {
  console.log(`Emotional intimacy app is running at http://localhost:${PORT}`);
});
