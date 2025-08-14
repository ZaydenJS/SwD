#!/usr/bin/env node
import fetch from "node-fetch";
import { google } from "googleapis";

const ORIGIN = process.env.ORIGIN || "https://goswd.com";

async function submitViaPing(sitemapUrl) {
  const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(
    sitemapUrl
  )}`;
  const res = await fetch(pingUrl);
  if (!res.ok) throw new Error(`Ping failed ${res.status}`);
  console.log("[submit] Ping OK:", sitemapUrl);
}

async function submitViaSearchConsole(siteUrl, sitemapUrl) {
  const json = process.env.GSC_SERVICE_ACCOUNT_JSON;
  if (!json) throw new Error("GSC_SERVICE_ACCOUNT_JSON not set");
  const creds = JSON.parse(json);
  const jwt = new google.auth.JWT(creds.client_email, null, creds.private_key, [
    "https://www.googleapis.com/auth/webmasters",
  ]);
  await jwt.authorize();
  const webmasters = google.webmasters({ version: "v3", auth: jwt });
  await webmasters.sitemaps.submit({ siteUrl, feedpath: sitemapUrl });
  console.log("[submit] GSC API OK:", sitemapUrl);
}

async function main() {
  const sitemapUrl = `${ORIGIN}/sitemap.xml`;
  try {
    // Prefer GSC API if creds provided
    if (process.env.GSC_SERVICE_ACCOUNT_JSON && process.env.SITE_URL) {
      await submitViaSearchConsole(process.env.SITE_URL, sitemapUrl);
    } else {
      await submitViaPing(sitemapUrl);
    }
  } catch (e) {
    console.warn(
      "Primary sitemap submit failed, trying ping fallback...",
      e.message
    );
    try {
      await submitViaPing(sitemapUrl);
    } catch (e2) {
      console.error("Sitemap submission failed", e2.message);
      process.exit(1);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
