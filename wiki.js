import config from "./config.json" assert { type: "json" };
import { wikiRequest } from "./lib/wikiapi.js";

// const PAGE_ID = 60469; // 틀:프로세카 악곡 목록
const PAGE_ID = 60430; // 사용자:사샤나즈/연습장

const {
  tokens: { logintoken: lgtoken },
} = await wikiRequest("query", {
  meta: "tokens",
  type: "login",
});

await wikiRequest("login", {
  lgname: `사샤나즈@${config.lgname}`,
  lgpassword: config.lgpassword,
  lgtoken,
});

const {
  tokens: { csrftoken },
} = await wikiRequest("query", {
  meta: "tokens",
  type: "csrf",
});

await wikiRequest("edit", {
  pageid: PAGE_ID,
  text: await Deno.readTextFile("./output.wikitext"),
  token: csrftoken,
});
