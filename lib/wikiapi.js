import { jsonToFormData } from "./utilities.js";
import {
  CookieJar,
  wrapFetch,
} from "https://deno.land/x/another_cookiejar@v4.0.0/mod.ts";

const cookieJar = new CookieJar();
const fetch = wrapFetch({ cookieJar });

const API_BASE = new URL("https://femiwiki.com/w/api.php");

export async function wikiRequest(action, params) {
  const res = await fetch(API_BASE, {
    method: "POST",
    body: jsonToFormData({ action, format: "json", ...params }),
  });
  const data = await res.json();
  if (data[action].result === "Failed") {
    throw new Error(`${action} failed`, { cause: data });
  }
  return data[action];
}
