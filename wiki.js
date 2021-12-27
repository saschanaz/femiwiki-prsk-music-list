import { WikiActionClient } from "./lib/wikiapi.js";

async function getConfig() {
  try {
    return (await import("./config.json", { assert: { type: "json" } }))
      .default;
  } catch {
    return {
      lgname: Deno.env.get("MW_LGNAME"),
      lgpassword: Deno.env.get("MW_LGPASSWORD"),
    };
  }
}

const PAGE_ID = 60469; // 틀:프로세카 악곡 목록
// const PAGE_ID = 60430; // 사용자:사샤나즈/연습장

const config = await getConfig();
const client = new WikiActionClient("https://femiwiki.com/w/api.php");
await client.login("사샤나즈", config.lgname, config.lgpassword);

await client.edit({
  pageid: PAGE_ID,
  text: await Deno.readTextFile("./output.wikitext"),
  bot: true,
});
