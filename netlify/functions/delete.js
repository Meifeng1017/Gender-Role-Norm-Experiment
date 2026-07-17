import { csvStore, html, isAuthorized, sanitizeFilename } from "./_shared.js";

export default async function handler(request) {
  const url = new URL(request.url);
  const query = Object.fromEntries(url.searchParams.entries());

  if (!isAuthorized(query)) {
    return html(401, "<h1>需要研究者密码</h1>");
  }

  if (request.method !== "POST") {
    return html(405, "<h1>只允许从下载页删除文件</h1>");
  }

  const form = await request.formData();
  const filename = sanitizeFilename(form.get("file"));

  if (!filename.endsWith(".csv")) {
    return html(400, "<h1>文件名无效</h1>");
  }

  await csvStore().delete(filename);

  return new Response("", {
    status: 303,
    headers: {
      location: `/.netlify/functions/files?key=${encodeURIComponent(query.key)}`
    }
  });
}
