import JSZip from "jszip";
import { attachmentHeader, csvStore, html, isAuthorized, listAllCsvKeys } from "./_shared.js";

export default async function handler(request) {
  const url = new URL(request.url);
  const query = Object.fromEntries(url.searchParams.entries());

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
  return new Response(buffer, {
    status: 200,
    headers: {
      "content-type": "application/zip",
      "content-disposition": attachmentHeader(`实验数据-${new Date().toISOString().slice(0, 10)}.zip`),
      "cache-control": "no-store"
    }
  });
};
