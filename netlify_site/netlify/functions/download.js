const { attachmentHeader, csvStore, html, isAuthorized, sanitizeFilename } = require("./_shared");

exports.handler = async function handler(event) {
  const query = event.queryStringParameters || {};

  if (!isAuthorized(query)) {
    return html(401, "<h1>需要研究者密码</h1>");
  }

  const filename = sanitizeFilename(query.file);
  const csv = await csvStore().get(filename);

  if (csv === null) {
    return html(404, "<h1>文件不存在</h1>");
  }

  return {
    statusCode: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": attachmentHeader(filename),
      "cache-control": "no-store"
    },
    body: csv
  };
};
