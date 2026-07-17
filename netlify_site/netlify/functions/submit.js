const { csvStore, json, uniqueCsvKey } = require("./_shared");

exports.handler = async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "access-control-allow-methods": "POST, OPTIONS",
        "access-control-allow-headers": "content-type"
      },
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "method_not_allowed" });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (error) {
    return json(400, { ok: false, error: "invalid_json" });
  }

  const csv = String(payload.csv || "");
  const subjectCode = String(payload.subject_code || payload.participant_id || "").trim();

  if (!subjectCode) {
    return json(400, { ok: false, error: "missing_subject_code" });
  }

  if (!csv || !csv.includes("被试编号") || !csv.includes("实验组")) {
    return json(400, { ok: false, error: "invalid_csv" });
  }

  const store = csvStore();
  const filename = await uniqueCsvKey(store, payload.filename);

  await store.set(filename, csv, {
    metadata: {
      subject_code: subjectCode,
      participant_id: String(payload.participant_id || ""),
      group: String(payload.group || ""),
      group_display: String(payload.group_display || ""),
      group_label: String(payload.group_label || ""),
      session_id: String(payload.session_id || ""),
      submitted_at: String(payload.submitted_at || "")
    }
  });

  return json(200, { ok: true, filename });
};
