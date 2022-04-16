import events from "../sekai-master-db-diff/events.json" assert { type: "json" };
import eventStoryUnits from "../sekai-master-db-diff/eventStoryUnits.json" assert { type: "json" };
import eventTranslation from "../manual/events-translation.json" assert { type: "json" };

import { KOR_DATE_FORMAT, mapUnitName, tryMatchingKoreanConvention } from "../lib/utilities.js";

/** @param {string} title */
function translateTitleOrAsIs(title) {
  const replaced = tryMatchingKoreanConvention(title);
  if (replaced) {
    return replaced;
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
  const started = Date.now() > event.startAt;

  return (
    `|-\n` +
    `|${translateTitleOrAsIs(event.name)}\n` +
    `|lang=ja|${event.name}\n` +
    `|${started ? key.map(mapUnitName).join("") : ""}\n` +
    `|${started ? sub.map(mapUnitName).join("") : ""}\n` +
    `|${KOR_DATE_FORMAT.format(event.startAt)}\n` +
    `|${KOR_DATE_FORMAT.format(event.aggregateAt)}\n`
  );
}

await Deno.writeTextFile(
  new URL("../output/events.wikitext", import.meta.url),
  `아래 표는 프로세카봇이 자동 생성하였습니다. 수동 편집할 경우 곧 덮어씌워지게 되므로
편집이 필요할 경우 [[틀토론:프로세카 이벤트 일람]] 또는
[https://github.com/saschanaz/femiwiki-prsk-music-list/issues 코드 저장소]에 문의해 주세요.

[[프로세카/이벤트]] 문서에서 일부 추가 정보를 볼 수 있습니다.

<onlyinclude><templatestyles src="프로세카 이벤트 일람/styles.css" />
{| class="wikitable sortable prsk-event-list"
!제목
!원제
!키스토리 출연
!서브 출연
!시작일
!종료일
${events.map(eventToWikitext).join("")}|}</onlyinclude>
`
);
