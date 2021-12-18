import config from "./config.json" assert { type: "json" };
import { WikiActionClient } from "./lib/wikiapi.js";

// const PAGE_ID = 60469; // 틀:프로세카 악곡 목록
const PAGE_ID = 60430; // 사용자:사샤나즈/연습장

const client = new WikiActionClient("https://femiwiki.com/w/api.php");
await client.login("사샤나즈", config.lgname, config.lgpassword);

await client.edit({
  pageid: PAGE_ID,
  text: await Deno.readTextFile("./output.wikitext"),
});
