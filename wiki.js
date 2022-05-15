import { WikiActionClient } from "./lib/wikiapi.js";

async function getConfig() {
  try {
    return (await import("./config.json", { assert: { type: "json" } }))
      .default;
  } catch {
    return {
      access_token: Deno.env.get("MW_ACCESSTOKEN"),
    };
  }
}

const MUSICS_PAGE_ID = 60469; // 틀:프로세카 악곡 목록
const EVENTS_PAGE_ID = 60676; // 틀:프로세카 이벤트 일람
const GACHAS_PAGE_ID = 61516; // 틀:프로세카 가챠 일람
// const PAGE_ID = 60430; // 사용자:사샤나즈/연습장

const config = await getConfig();
const client = new WikiActionClient(
  "https://femiwiki.com/rest.php/",
  config.access_token
);

await client.request("GET", "v1/page/페미위키")

// await client.csrf();

// await client.edit({
//   pageid: MUSICS_PAGE_ID,
//   text: await Deno.readTextFile(
//     new URL("./output/musics.wikitext", import.meta.url)
//   ),
//   bot: true,
// });

// await client.edit({
//   pageid: EVENTS_PAGE_ID,
//   text: await Deno.readTextFile(
//     new URL("./output/events.wikitext", import.meta.url)
//   ),
//   bot: true,
// });

// await client.edit({
//   pageid: GACHAS_PAGE_ID,
//   text: await Deno.readTextFile(
//     new URL("./output/gachas.wikitext", import.meta.url)
//   ),
//   bot: true,
// });
