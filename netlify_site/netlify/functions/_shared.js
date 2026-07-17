const { getStore } = require("@netlify/blobs");

const STORE_NAME = "experiment-csv-files";

function csvStore() {
  return getStore(STORE_NAME);
}

function json(statusCode, data) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    },
    body: JSON.stringify(data)
  };
}

function html(statusCode, body) {
  return {
    statusCode,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store"
    },
    body
  };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isAuthorized(query) {
  const expected = process.env.ADMIN_KEY;
  return Boolean(expected && query.key === expected);
}

function sanitizeFilename(name) {
  const cleaned = String(name || "")
    .replace(/[\\/:*?"<>|\x00-\x1F]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 180);
  return cleaned.endsWith(".csv") ? cleaned : `${cleaned || "data"}.csv`;
}

function attachmentHeader(filename) {
  return `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

async function uniqueCsvKey(store, requestedName) {
  const base = sanitizeFilename(requestedName);
  const stem = base.replace(/\.csv$/i, "");
  let candidate = base;
  for (let i = 1; i <= 50; i += 1) {
    const existing = await store.get(candidate);
    if (existing === null) return candidate;
    candidate = `${stem}-${Date.now()}-${i}.csv`;
  }
  return `${stem}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}.csv`;
}

async function listAllCsvKeys(store) {
  const keys = [];
  let cursor;

  do {
    const result = await store.list(cursor ? { cursor } : undefined);
    keys.push(...(result.blobs || []).map((blob) => blob.key).filter((key) => key.endsWith(".csv")));
    cursor = result.cursor;
  } while (cursor);

  return keys;
}

module.exports = {
  attachmentHeader,
  csvStore,
  escapeHtml,
  html,
  isAuthorized,
  json,
  listAllCsvKeys,
  sanitizeFilename,
  uniqueCsvKey
};
