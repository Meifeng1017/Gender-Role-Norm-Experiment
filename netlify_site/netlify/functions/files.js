const { csvStore, escapeHtml, html, isAuthorized, listAllCsvKeys } = require("./_shared");

exports.handler = async function handler(event) {
  const query = event.queryStringParameters || {};

  if (!isAuthorized(query)) {
    return html(401, "<h1>需要研究者密码</h1><p>请在网址后面加上正确的 key。</p>");
  }

  const store = csvStore();
  const files = (await listAllCsvKeys(store))
    .sort()
    .reverse();

  const keyParam = encodeURIComponent(query.key);
  const items = files.length
    ? files.map((file) => {
        const href = `/.netlify/functions/download?key=${keyParam}&file=${encodeURIComponent(file)}`;
        return `<li><a href="${href}">下载</a> ${escapeHtml(file)}</li>`;
      }).join("")
    : "<li>暂时还没有收到 CSV 文件。</li>";

  const zipHref = `/.netlify/functions/download-all?key=${keyParam}`;
  return html(200, `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>已收到的数据文件</title>
  <style>
    body{font-family:Arial,"Microsoft YaHei",sans-serif;max-width:820px;margin:32px auto;padding:0 18px;color:#222}
    h1{font-size:22px;margin:0 0 18px}
    ul{list-style:none;padding:0;margin:0 0 22px}
    li{padding:9px 0;border-bottom:1px solid #eee;word-break:break-all}
    a{color:#1264d8;text-decoration:none;margin-right:8px}
    .zip{display:inline-block;background:#111;color:#fff;padding:9px 14px;border-radius:6px}
  </style>
</head>
<body>
  <h1>已收到的数据文件</h1>
  <ul>${items}</ul>
  <a class="zip" href="${zipHref}">下载全部 ZIP</a>
</body>
</html>`);
};
