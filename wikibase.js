import musics from "./sekai-master-db-diff/musics.json" with { type: "json" };

import { WikiActionClient } from "./lib/wikiapi.js";
import { getWikiableMusicData } from "./lib/musics.js";

async function getConfig() {
  return (await import("./config.json", { assert: { type: "json" } })).default;
}

const config = await getConfig();
const client = new WikiActionClient("https://femiwiki.com/w/api.php");
await client.login("사샤나즈", config.lgname, config.lgpassword);

// const result = await client.request("wbgetentities", {
//   ids: "Q145",
// });
// await Deno.writeTextFile("output.json", JSON.stringify(result, null, 2));

/**
 * @param {string} name
 * @param {string} datatype
 * @param {object} value
 * @param {string} valuetype
 */
function createWikibaseProperty(name, datatype, value, valuetype) {
  return {
    mainsnak: {
      snaktype: "value",
      property: name,
      datavalue: { value, type: valuetype },
      datatype,
    },
    type: "statement",
    rank: "normal",
  };
}

/**
 * @param {string} name
 * @param {number} amount
 */
function createWikibaseQuantityProperty(name, amount) {
  return createWikibaseProperty(
    name,
    "quantity",
    {
      amount: `+${amount}`,
      unit: "1",
    },
    "quantity"
  );
}

/**
 * @param {string} name
 * @param {string} value
 */
function createWikibaseStringProperty(name, value) {
  return createWikibaseProperty(name, "string", value, "string");
}

/**
 * @param {string} name
 * @param {string} itemName
 */
function createWikibaseItemProperty(name, itemName) {
  return createWikibaseProperty(
    name,
    "wikibase-item",
    {
      "entity-type": "item",
      id: itemName,
    },
    "wikibase-entityid"
  );
}

/**
 * @param {import("./lib/types.d.ts").MusicTag} unit
 */
function mapUnitNameToItem(unit) {
  switch (unit) {
    case "vocaloid":
      return "Q146";
    case "light_music_club":
      return "Q147";
    case "idol":
      return "Q148";
    case "street":
      return "Q149";
    case "theme_park":
      return "Q150";
    case "school_refusal":
      return "Q151";
  }
  throw new Error("Failed to map unit name to item");
}

/**
 * @param {import("./lib/types.d.ts").MusicTag} unit
 */
function createWikibasePrskUnitProperty(unit) {
  /** @type {string} */
  const unitItem = mapUnitNameToItem(unit);
  return createWikibaseItemProperty("P74", unitItem);
}

/**
 * @param {string} name
 * @param {string} text
 * @param {string} language
 */
function createWikibaseLanguageProperty(name, language, text) {
  return createWikibaseProperty(
    name,
    "monolingualtext",
    { text, language },
    "monolingualtext"
  );
}

const ISO_DATE_FORMAT = Intl.DateTimeFormat("sv-SE", {
  dateStyle: "short",
  timeZone: "Asia/Tokyo",
});

/**
 * @param {string} name
 * @param {Date} date
 * @returns
 */
function createWikibaseTimeProperty(name, date) {
  return createWikibaseProperty(
    name,
    "time",
    {
      // XXX: Can the raw UTC time be used instead?
      time: `+${ISO_DATE_FORMAT.format(date)}T00:00:00Z`,
      timezone: 0,
      before: 0,
      after: 0,
      precision: 11,
      calendarmodel: "http://www.wikidata.org/entity/Q1985727",
    },
    "time"
  );
}

/** @param {import("./lib/types.d.ts").Music} music */
function createWikibaseData(music) {
  const wikiable = getWikiableMusicData(music);
  return {
    claims: [
      createWikibaseQuantityProperty(
        "P65",
        wikiable.difficulties.easy.playLevel
      ),
      createWikibaseQuantityProperty(
        "P66",
        wikiable.difficulties.normal.playLevel
      ),
      createWikibaseQuantityProperty(
        "P67",
        wikiable.difficulties.hard.playLevel
      ),
      createWikibaseQuantityProperty(
        "P68",
        wikiable.difficulties.expert.playLevel
      ),
      createWikibaseQuantityProperty(
        "P69",
        wikiable.difficulties.master.playLevel
      ),

      createWikibaseStringProperty("P70", wikiable.lyricist),
      createWikibaseStringProperty("P71", wikiable.composer),
      createWikibaseStringProperty("P72", wikiable.arranger),

      createWikibaseItemProperty("P75", wikiable.kakioroshi ? "Q153" : "Q152"),

      ...wikiable.tags
        .filter((tag) => !["all", "other"].includes(tag))
        .map(createWikibasePrskUnitProperty),

      createWikibaseLanguageProperty("P42", "ja", music.title),
      ...(wikiable.titleEn
        ? [createWikibaseLanguageProperty("P42", "en", wikiable.titleEn)]
        : []),

      createWikibaseTimeProperty("P20", new Date(music.publishedAt)),
    ],

    ...(wikiable.titleKo
      ? {
          sitelinks: {
            femiwiki: {
              site: "femiwiki",
              title: `프로젝트 세카이 컬러풀 스테이지! feat. 하츠네 미쿠/악곡/${wikiable.titleKo}`,
              badges: [],
            },
          },
        }
      : {}),

    labels: {
      ja: {
        language: "ja",
        value: music.title,
      },
      ...(wikiable.titleKo
        ? {
            ko: {
              language: "ko",
              value: wikiable.titleKo,
            },
          }
        : {}),
      ...(wikiable.titleEn
        ? {
            en: {
              language: "en",
              value: wikiable.titleEn,
            },
          }
        : {}),
    },
  };
}

for (const music of musics) {
  if (music.id !== 116) {
    continue; // for now
  }
  const result = await client.request("wbeditentity", {
    id: "Q145",
    // new: "item",
    data: JSON.stringify(createWikibaseData(music)),
    token: client.csrftoken,
  });
  console.log(JSON.stringify(result, null, 2));
}
// const result = musics
//   .map(createWikibaseData)
//   .map((d) => JSON.stringify(d, null, 2))
//   .join("\n");
// Deno.writeTextFile("data.json", result);

// const result = await client.request("wbeditentity", {
//   id: "Q145",
//   // new: "item",
//   title:
//     "프로젝트 세카이 컬러풀 스테이지! feat. 하츠네 미쿠/악곡/Tell Your World",
//   data: JSON.stringify({
//     claims: [],
//   }),
// });
// ({
//   claims: [
//     {
//       mainsnak: {
//         snaktype: "value",
//         property: "P56",
//         datavalue: { value: "ExampleString", type: "string" },
//       },
//       type: "statement",
//       rank: "normal",
//     },
//   ],
// });
