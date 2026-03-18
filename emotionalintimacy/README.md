# Emotional Intimacy Q&A App

A local web app to capture question/answer reflections with your wife, including:

- dedicated text boxes for question and answer
- batch question input that generates separate question/answer rows
- automatic question parsing (normalization, type detection, topic detection)
- tracking who asked and who answered
- persistent server-side storage
- search, filter, sort, favorite, edit, delete
- stats dashboard and JSON export

## Run

```bash
npm install
npm start
```

Open: `http://localhost:3000`

## API Endpoints

- `POST /api/parse`
- `GET /api/entries`
- `POST /api/entries`
- `PUT /api/entries/:id`
- `PATCH /api/entries/:id/favorite`
- `DELETE /api/entries/:id`
- `GET /api/stats`
- `GET /api/export`

## Data Storage

Entries are saved server-side in `data/qa-db.json` (auto-created on first run).
