import { KOR_DATE_FORMAT } from "./lib/utilities.js";
import { WikiActionClient } from "./lib/wikiapi.js";
import latest from "./latest.json" assert { type: "json" };

async function getConfig() {
  try {
    return (await import("./config.json", { assert: { type: "json" } }))
      .default;
  } catch {
    return {
      access_token: Deno.env.get("MW_ACCESS_TOKEN"),
    };
  }
}

const config = await getConfig();
const client = new WikiActionClient(
  "https://femiwiki.com/rest.php/",
  config.access_token
);

const today = KOR_DATE_FORMAT.format(new Date());

const musicsResult = await client.edit("틀:프로세카 악곡 목록", {
  source: await Deno.readTextFile(
    new URL("./output/musics.wikitext", import.meta.url)
  ),
  comment: `${today} 프로세카봇 악곡 목록 업데이트`,
  latest: { id: latest.musics },
});
console.log(musicsResult);

const eventsResult = await client.edit("틀:프로세카 이벤트 일람", {
  source: await Deno.readTextFile(
    new URL("./output/events.wikitext", import.meta.url)
  ),
  comment: `${today} 프로세카봇 이벤트 일람 업데이트`,
  latest: { id: latest.events },
});
console.log(eventsResult);

const gachasResult = await client.edit("틀:프로세카 가챠 일람", {
  source: await Deno.readTextFile(
    new URL("./output/gachas.wikitext", import.meta.url)
  ),
  comment: `${today} 프로세카봇 가챠 일람 업데이트`,
  latest: { id: latest.gachas },
});
console.log(gachasResult);

await Deno.writeTextFile(
  "latest.json",
  JSON.stringify(
    {
      musics: musicsResult.latest.id,
      events: eventsResult.latest.id,
      gachas: gachasResult.latest.id,
    },
    null,
    2
  ) + "\n"
);

// await client.edit("사용자:사샤나즈/연습장", {
//   source: "Hello REST API!",
//   comment: "foo",
//   latest: {
//     id: 227791
//   }
// });
