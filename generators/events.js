import events from "../sekai-master-db-diff/events.json" assert { type: "json" };

import { KOR_DATE_FORMAT } from "../lib/utilities.js";

/** @param {typeof events[number]} event */
function eventToWikitext(event) {
  return (
    `|-\n` +
    `|lang=ja|${event.name}\n` +
    `|${KOR_DATE_FORMAT.format(event.startAt)}\n` +
    `|${KOR_DATE_FORMAT.format(event.closedAt)}\n`
  );
}

await Deno.writeTextFile(
  "./output/events.wikitext",
  `{| class="wikitable sortable"
!원제
!시작일
!종료일
${events.map(eventToWikitext).join("")}|}
`
);
