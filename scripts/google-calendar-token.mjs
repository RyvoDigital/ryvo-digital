#!/usr/bin/env node
// One-time: get a refresh token for hello@ryvodigital.com so the site can read
// free/busy and create booking events. Run from the repo root:
//
//   node scripts/google-calendar-token.mjs
//
// It reads GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET from .env.local,
// opens Google's consent screen (sign in as hello@), catches the answer on a
// local loopback port, and writes GOOGLE_OAUTH_REFRESH_TOKEN into .env.local.
// It never prints the token or the secret.

import { createServer } from "node:http";
import { readFileSync, writeFileSync } from "node:fs";
import { exec } from "node:child_process";

const ENV = ".env.local";
const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events", // create the booking event
  "https://www.googleapis.com/auth/calendar.freebusy", // read busy times only
  "https://www.googleapis.com/auth/gmail.send", // send the booking notification email from hello@
];
const PORT = 53682;
const REDIRECT = `http://127.0.0.1:${PORT}/callback`;

const env = readFileSync(ENV, "utf8");
const get = (k) => env.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1]?.trim().replace(/^["']|["']$/g, "");
const clientId = get("GOOGLE_OAUTH_CLIENT_ID");
const clientSecret = get("GOOGLE_OAUTH_CLIENT_SECRET");
if (!clientId || !clientSecret) {
  console.error(`Add GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET to ${ENV} first.`);
  process.exit(1);
}

const state = Math.random().toString(36).slice(2);
const auth = new URL("https://accounts.google.com/o/oauth2/v2/auth");
auth.search = new URLSearchParams({
  client_id: clientId,
  redirect_uri: REDIRECT,
  response_type: "code",
  scope: SCOPES.join(" "),
  access_type: "offline",
  prompt: "consent",
  login_hint: "hello@ryvodigital.com",
  state,
}).toString();

const server = createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT);
  if (url.pathname !== "/callback") { res.writeHead(404).end(); return; }
  if (url.searchParams.get("state") !== state || !url.searchParams.get("code")) {
    res.writeHead(400).end("Something went wrong. Close this tab and run the script again.");
    return;
  }
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code: url.searchParams.get("code"), client_id: clientId, client_secret: clientSecret, redirect_uri: REDIRECT, grant_type: "authorization_code" }),
  });
  const json = await r.json();
  if (!json.refresh_token) {
    res.writeHead(500).end("No refresh token returned. Close this tab and run the script again.");
    console.error(`Token exchange failed (${r.status}${json.error ? `: ${json.error}` : ""}).`);
    server.close();
    process.exitCode = 1;
    return;
  }
  const line = `GOOGLE_OAUTH_REFRESH_TOKEN=${json.refresh_token}`;
  const current = readFileSync(ENV, "utf8");
  const next = /^GOOGLE_OAUTH_REFRESH_TOKEN=.*$/m.test(current)
    ? current.replace(/^GOOGLE_OAUTH_REFRESH_TOKEN=.*$/m, line)
    : `${current.replace(/\n?$/, "\n")}${line}\n`;
  writeFileSync(ENV, next);
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" }).end("Done. The token is saved in .env.local. You can close this tab.");
  console.log(`Saved GOOGLE_OAUTH_REFRESH_TOKEN to ${ENV} (not shown). Add it to Vercel by hand.`);
  server.close();
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("Opening Google's consent screen. Sign in as hello@ryvodigital.com.");
  console.log(`If no browser opens, visit this address:\n${auth}`);
  exec(`${process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open"} "${auth}"`);
});
