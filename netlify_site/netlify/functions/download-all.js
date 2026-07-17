const JSZip = require("jszip");
const { attachmentHeader, csvStore, html, isAuthorized, listAllCsvKeys } = require("./_shared");

exports.handler = async function handler(event) {
  const query = event.queryStringParameters || {};

  if (!isAuthorized(query)) {
    return html(401, "<h1>需要研究者密码</h1>");
  }

  const store = csvStore();
  const files = (await listAllCsvKeys(store)).sort();

  const zip = new JSZip();
  for (const file of files) {
    const csv = await store.get(file);
    if (csv !== null) zip.file(file, csv);
  }

  const buffer = await zip.generateAsync({ type: "nodebuffer" });
  return {
    statusCode: 200,
    headers: {
      "content-type": "application/zip",
      "content-disposition": attachmentHeader(`实验数据-${new Date().toISOString().slice(0, 10)}.zip`),
      "cache-control": "no-store"
    },
    body: buffer.toString("base64"),
    isBase64Encoded: true
  };
};
