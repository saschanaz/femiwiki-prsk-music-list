import events from "../sekai-master-db-diff/events.json" assert { type: "json" };
import eventStoryUnits from "../sekai-master-db-diff/eventStoryUnits.json" assert { type: "json" };
import eventTranslation from "./events-translation.json" assert { type: "json" };

import { KOR_DATE_FORMAT, mapUnitName, isAsciiOnly } from "../lib/utilities.js";

/** @param {string} title */
function translateTitleOrAsIs(title) {
  if (isAsciiOnly(title)) {
    return title;
  }
  const translated = eventTranslation[title];
  if (!translated) {
    console.warn(`No translation for event "${title}"`);
  }
  return translated || title;
}

/** @param {typeof events[number]} event */
function eventToWikitext(event) {
  const units = eventStoryUnits.filter((e) => e.eventStoryId === event.id);
  const key = units
    .filter((e) => e.eventStoryUnitRelation === "main")
    .map((e) => e.unit);
  const sub = units
    .filter((e) => e.eventStoryUnitRelation === "sub")
    .map((e) => e.unit);

  return (
    `|-\n` +
    `|${translateTitleOrAsIs(event.name)}\n` +
    `|lang=ja|${event.name}\n` +
    `|${key.map(mapUnitName).join("")}\n` +
    `|${sub.map(mapUnitName).join("")}\n` +
    `|${KOR_DATE_FORMAT.format(event.startAt)}\n` +
    `|${KOR_DATE_FORMAT.format(event.closedAt)}\n`
  );
}

await Deno.writeTextFile(
  "./output/events.wikitext",
  `{| class="wikitable sortable"
!제목
!원제
!키스토리 출연
!서브 출연
!시작일
!종료일
${events.map(eventToWikitext).join("")}|}
`
);
