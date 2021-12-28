import events from "../sekai-master-db-diff/events.json" assert { type: "json" };
import eventStoryUnits from "../sekai-master-db-diff/eventStoryUnits.json" assert { type: "json" };

import { KOR_DATE_FORMAT, mapUnitName } from "../lib/utilities.js";

/** @param {typeof events[number]} event */
function eventToWikitext(event) {
  const units = eventStoryUnits
    .filter((e) => e.eventStoryId === event.id)
    .map((e) => mapUnitName(e.unit));

  return (
    `|-\n` +
    `|lang=ja|${event.name}\n` +
    `|${units.join("")}\n` +
    `|${KOR_DATE_FORMAT.format(event.startAt)}\n` +
    `|${KOR_DATE_FORMAT.format(event.closedAt)}\n`
  );
}

await Deno.writeTextFile(
  "./output/events.wikitext",
  `{| class="wikitable sortable"
!원제
!관련 유닛
!시작일
!종료일
${events.map(eventToWikitext).join("")}|}
`
);
