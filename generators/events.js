import events from "../sekai-master-db-diff/events.json" with { type: "json" };
import eventsKr from "../sekai-master-db-kr-diff/events.json" with { type: "json" };
import eventStoryUnits from "../sekai-master-db-diff/eventStoryUnits.json" with { type: "json" };
import eventTranslation from "../manual/events-translation.json" with { type: "json" };

import {
  KOR_DATE_FORMAT,
  mapUnitName,
  tryMatchingKoreanConvention,
} from "../lib/utilities.js";

/** @param {typeof events[number]} event */
function translateTitleOrAsIs(event) {
  const mapped = eventsKr.find((en) => en.id === event.id);
  const manual = eventTranslation[event.name];
  if (mapped && mapped.startAt < new Date().valueOf()) {
    if (manual) {
      console.warn(`titleKo is ignored for "${event.name}"`);
    }
    return mapped.name;
  }
  const replaced = tryMatchingKoreanConvention(event.name);
  if (replaced) {
    return replaced;
  }
  if (!manual) {
    console.warn(`No translation for event "${event.name}"`);
  }
  return manual || event.name;
}

/**
 * @typedef {import("../lib/types.d.ts").EventStoryUnit} EventStoryUnit
 * @param {EventStoryUnit[]} units */
function computeRelatedUnits(units) {
  /** @type {Record<string, EventStoryUnit>} */
  const record = {};
  for (const info of units) {
    if (!record[info.unit] || record[info.unit].seq < info.seq) {
      record[info.unit] = info;
    }
  }
  /** @type {string[]} */
  const key = [];
  /** @type {string[]} */
  const sub = [];
  for (const info of Object.values(record)) {
    if (info.eventStoryUnitRelation === "main") {
      key.push(info.unit);
    } else if (info.eventStoryUnitRelation === "sub") {
      sub.push(info.unit);
    } else {
      throw new Error(
        `Unexpected story unit relation: ${info.eventStoryUnitRelation}`
      );
    }
  }
  return { key, sub };
}

/** @param {typeof events[number]} event */
function isEventAnnounced(event) {
  return Date.now() + 60 * 60 * 24 > event.startAt;
}

/** @param {typeof events[number]} event */
function eventToWikitext(event) {
  const units = eventStoryUnits.filter((e) => e.eventStoryId === event.id);
  const { key, sub } = computeRelatedUnits(units);
  const started = Date.now() > event.startAt;

  return (
    `|-\n` +
    `|${translateTitleOrAsIs(event)}\n` +
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
${events.filter(isEventAnnounced).map(eventToWikitext).join("")}|}</onlyinclude>
`
);
