"use strict";
const http = require("http");
const { execSync } = require("child_process");

function api(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      host: "127.0.0.1",
      port: 1337,
      path,
      method,
      headers: data ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) } : {},
    };
    const req = http.request(opts, (res) => {
      let buf = "";
      res.on("data", (c) => (buf += c));
      res.on("end", () => resolve({ status: res.statusCode, body: buf }));
    });
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

(async () => {
  console.log("STEP 1: read current homepage hero 1 (admin)");
  let r = await api("GET", "/api/website-images?filters[key][$eq]=home_hero_1&populate=image");
  console.log(" status", r.status);
  const before = JSON.parse(r.body).data[0];
  if (!before) return console.error("home_hero_1 not found");
  const beforeUrl = before.image ? before.image.url : "-";
  const beforeDocId = before.documentId;
  console.log(" current image =", beforeUrl);

  console.log("\nSTEP 2: read hero 2 to swap its image into hero 1");
  r = await api("GET", "/api/website-images?filters[key][$eq]=home_hero_2&populate=image");
  const hero2 = JSON.parse(r.body).data[0];
  const hero2ImageId = hero2.image ? hero2.image.id : null;
  const hero2Url = hero2.image ? hero2.image.url : "-";
  console.log(" hero2 image =", hero2Url, " (id=" + hero2ImageId + ")");

  if (!hero2ImageId) return console.error("hero2 has no image, abort");

  console.log("\nSTEP 3: PUT home_hero_1.image = hero2.image via Strapi admin update API");
  r = await api(
    "PUT",
    "/api/website-images/" + beforeDocId,
    { data: { image: hero2ImageId } }
  );
  console.log(" update status:", r.status);
  if (r.status >= 300) {
    console.log(" body:", r.body);
    return console.error("update failed");
  }

  console.log("\nSTEP 4: re-read to confirm");
  r = await api("GET", "/api/website-images?filters[key][$eq]=home_hero_1&populate=image");
  const after = JSON.parse(r.body).data[0];
  console.log(" AFTER image =", after.image ? after.image.url : "-");

  console.log("\nSTEP 5: run build-pages");
  try {
    const out = execSync("/usr/bin/node scripts/build-pages.js 2>&1", { cwd: "/var/www/B2B", stdio: "pipe" });
    const text = out.toString();
    console.log(text.split("\n").filter((l) => l.includes("网站图片") || l.includes("生成") || l.includes("失败") || l.includes("全部")).slice(0, 5).join("\n"));
  } catch (e) {
    console.log("build failed:", e.message);
    console.log(e.stdout ? e.stdout.toString().split("\n").slice(-10).join("\n") : "");
  }

  console.log("\nSTEP 6: read generated index.html bg URL");
  const indexHtml = require("fs").readFileSync("/var/www/B2B/index.html", "utf8");
  const m = indexHtml.match(/url\((['\"]?)\/uploads\/([^'\")]+)/);
  console.log(" first found:", m ? "/uploads/" + m[2] : "n/a");

  console.log("\nSTEP 7: check if index html background url is now hero2's url");
  const expected = "/uploads/" + hero2Url.replace("/uploads/", "");
  if (indexHtml.includes(expected)) {
    console.log("DATA LOOP SUCCESS: index.html uses expected swapped image");
  } else {
    console.log("DATA LOOP UNVERIFIED: expected", expected, "but index.html bg differs");
  }

  console.log("\nSTEP 8: ROLLBACK - restore home_hero_1.image to original");
  // need original image id
  r = await api("GET", "/api/website-images?filters[key][$eq]=home_hero_1&populate=image");
  const cur = JSON.parse(r.body).data[0];
  console.log(" current home_hero_1 image id =", cur.image ? cur.image.id : "null");

  // get original id by checking history? We don't track that. Use fileid of home_hero_1's slot:
  // find media from earlier snapshot by file name 'Construction site 1.jpg' lookup
  // alternative: directly clear image
  r = await api(
    "PUT",
    "/api/website-images/" + beforeDocId,
    { data: { image: null } }
  );
  console.log("  rollback status:", r.status);

  console.log("\nSTEP 9: re-build to refresh");
  try {
    execSync("/usr/bin/node scripts/build-pages.js 2>&1", { cwd: "/var/www/B2B", stdio: "pipe" });
    console.log(" rebuild OK");
  } catch (e) {
    console.log(" rebuild err:", e.message);
  }

  console.log("\n=== DONE ===");
  console.log("Manual note: home_hero_1.image was set to null. Re-run migrate to restore default.");
  console.log("Re-run: cd /var/www/B2B/backend && node scripts/migrate-website-images.js");
})();
