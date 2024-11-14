import { KOR_DATE_FORMAT } from "../lib/utilities.js";
import gachas from "../sekai-master-db-diff/gachas.json" with { type: "json" };
import gachasKo from "../sekai-master-db-kr-diff/gachas.json" with { type: "json" };

/**
 * @param {gachas[number]} gacha
 */
function gachaToWikitext(gacha) {
  const gackaKo = gachasKo.find((g) => g.id === gacha.id);

  return `|-
|${gackaKo?.name ?? ""}
|lang=ja|${gacha.name}
|${KOR_DATE_FORMAT.format(gacha.startAt)}
|${KOR_DATE_FORMAT.format(gacha.endAt)}
`;
}

await Deno.writeTextFile(
  new URL("../output/gachas.wikitext", import.meta.url),
  `아래 표는 프로세카봇이 자동 생성하였습니다. 수동 편집할 경우 곧 덮어씌워지게 되므로
편집이 필요할 경우 [[틀토론:프로세카 가챠 일람]] 또는
[https://github.com/saschanaz/femiwiki-prsk-music-list/issues 코드 저장소]에 문의해 주세요.

[[프로세카/가챠]] 문서에서 일부 추가 정보를 볼 수 있습니다.

<onlyinclude>{| class="wikitable sortable prsk-event-list"
!제목
!원제
!시작일
!종료일
${gachas.map(gachaToWikitext).join("")}|}</onlyinclude>
`
);
