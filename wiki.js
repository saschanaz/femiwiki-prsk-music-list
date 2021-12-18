import config from "./config.json" assert { type: "json" };
import { jsonToFormData } from "./lib/utilities.js";
import {
  CookieJar,
  wrapFetch,
} from "https://deno.land/x/another_cookiejar@v4.0.0/mod.ts";

const cookieJar = new CookieJar();
const fetch = wrapFetch({ cookieJar });

// const PAGE_ID = 60469; // 틀:프로세카 악곡 목록
const PAGE_ID = 60430; // 사용자:사샤나즈/연습장

const API_BASE = new URL("https://femiwiki.com/w/api.php");

const loginRes = await fetch(
  `${API_BASE}?action=query&format=json&meta=tokens&type=login`
);
const {
  query: {
    tokens: { logintoken: lgtoken },
  },
} = await loginRes.json();

await fetch(API_BASE, {
  method: "POST",
  body: jsonToFormData({
    action: "login",
    format: "json",
    lgname: `사샤나즈@${config.lgname}`,
    lgpassword: config.lgpassword,
    lgtoken,
  }),
}).then(async (res) => {
  const data = await res.json();
  if (data.login.result === "Failed") {
    throw new Error("Login failed");
  }
});

const crsfRes = await fetch(
  `${API_BASE}?action=query&format=json&meta=tokens&type=csrf`
);
const {
  query: {
    tokens: { csrftoken },
  },
} = await crsfRes.json();
console.log(csrftoken);

// const res = await fetch(API_BASE, {
//   method: "POST",
//   body: jsonToFormData({
//     action: "checktoken",
//     format: "json",
//     type: "csrf",
//     token: csrftoken,
//   }),
// });

// console.log(await res.json());

const res2 = await fetch(API_BASE, {
  method: "POST",
  body: jsonToFormData({
    action: "edit",
    format: "json",
    pageid: PAGE_ID,
    text: await Deno.readTextFile("./output.wikitext"),
    token: csrftoken,
  }),
});

console.log(await res2.json());
