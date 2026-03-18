const fs = require("fs/promises");
const path = require("path");

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "qa-db.json");

const EMPTY_DB = {
  entries: []
};

let writeQueue = Promise.resolve();

async function ensureDbFile() {
  await fs.mkdir(DB_DIR, { recursive: true });

  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify(EMPTY_DB, null, 2), "utf8");
  }
}

async function readDb() {
  await ensureDbFile();
  const raw = await fs.readFile(DB_FILE, "utf8");
  const parsed = JSON.parse(raw || "{}");
  if (!Array.isArray(parsed.entries)) {
    return { entries: [] };
  }
  return parsed;
}

async function writeDb(db) {
  await ensureDbFile();

  writeQueue = writeQueue.then(async () => {
    const tempFile = `${DB_FILE}.tmp`;
    await fs.writeFile(tempFile, JSON.stringify(db, null, 2), "utf8");
    await fs.rename(tempFile, DB_FILE);
  });

  await writeQueue;
}

async function listEntries() {
  const db = await readDb();
  return db.entries;
}

async function replaceEntries(entries) {
  await writeDb({ entries });
}

module.exports = {
  listEntries,
  replaceEntries
};
