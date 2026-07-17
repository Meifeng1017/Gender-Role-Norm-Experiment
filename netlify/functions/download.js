import { attachmentHeader, csvStore, html, isAuthorized, sanitizeFilename } from "./_shared.js";

export default async function handler(request) {
  const url = new URL(request.url);
  const query = Object.fromEntries(url.searchParams.entries());

  if (!isAuthorized(query)) {
    return html(401, "<h1>需要研究者密码</h1>");
  }

  const filename = sanitizeFilename(query.file);
  const csv = await csvStore().get(filename);

  if (csv === null) {
    return html(404, "<h1>文件不存在</h1>");
  }

  return new Response(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": attachmentHeader(filename),
      "cache-control": "no-store"
    }
  });
};
