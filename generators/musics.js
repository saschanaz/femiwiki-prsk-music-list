import musics from "../sekai-master-db-diff/musics.json" assert { type: "json" };
import musicsEn from "../sekai-master-db-en-diff/musics.json" assert { type: "json" };
import manualMetadata from "../manual/musics.json" assert { type: "json" };
import { translateArtistOrAsIs, getWikiableMusicData } from "../lib/musics.js";

import {
  KOR_DATE_FORMAT,
  mapUnitName,
  matchesKoreanConvention,
} from "../lib/utilities.js";

function sorter(a, b) {
  const byPublishedAt = a.publishedAt - b.publishedAt;
  if (byPublishedAt !== 0) {
    return byPublishedAt;
  }
  return a.seq - b.seq;
}

function stringifyCategories(item) {
  return item.categories
    .map((category) => {
      switch (category) {
        case "image":
          return; // (MV없음)
        case "original":
          return "원곡MV";
        case "mv_2d": {
          const { url, illust } = manualMetadata[item.title]?.mv2d || {};
          const translated = illust ? `(${translateArtistOrAsIs(illust)})` : "";
          if (url) {
            return `[${url} 2DMV${translated}]`;
          }
          return `2DMV${translated}`;
        }
        case "mv": {
          const mv3d = manualMetadata[item.title]?.mv3d;
          if (mv3d) {
            return `[${mv3d} 3DMV]`;
          }
          return "3DMV";
        }
      }
    })
    .filter((i) => i)
    .join(" ");
}

function linkToMusicPage(title) {
  return `[[프로젝트_세카이_컬러풀_스테이지!_feat._하츠네_미쿠/악곡/${title}|${title}]]`;
}

function maybeLinkToTranslatedTitle(translated, original) {
  if (translated) {
    return linkToMusicPage(translated);
  }
  return original;
}

function linkYouTube({ type, url } = {}) {
  return url ? `[${url} ${type} 버전]` : "";
}

function formatReleaseDate(item) {
  const { announcement, releaseDateOverride } =
    manualMetadata[item.title] || {};
  if (manualMetadata[item.title]?.releaseDateOverride) {
    return `[${announcement} ${releaseDateOverride}]`;
  }
  const formatted = `${KOR_DATE_FORMAT.format(item.publishedAt)} 추가`;
  if (announcement) {
    return `[${announcement} ${formatted}]`;
  }
  return formatted;
}

function getMusicTag(tags) {
  return tags
    .filter((tag) => !["all", "other"].includes(tag))
    .map(mapUnitName)
    .join("");
}

function hideIfAlreadyEnglish(title) {
  if (matchesKoreanConvention(title)) {
    return ' style="visibility:hidden"';
  }
  return "";
}

/** @param {boolean} isKakioroshi */
function dataKakiroshi(isKakioroshi) {
  return isKakioroshi ? "data-kakioroshi" : "";
}

function convertAsWikimediaTableRow(item) {
  const wikiable = getWikiableMusicData(item);
  return (
    `|-\n` +
    `|${dataKakiroshi(wikiable.kakioroshi)}|${maybeLinkToTranslatedTitle(
      wikiable.titleKo,
      item.title
    )}\n` + // 제목
    `|lang=ja${hideIfAlreadyEnglish(item.title)}|${item.title}\n` + // 원제
    `|${hideIfAlreadyEnglish(item.title)}|${wikiable.titleEn || ""}\n` + // 영문제목
    `|${getMusicTag(wikiable.tags)}\n` + // 분류
    `|${wikiable.kakioroshi ? "✔️" : ""}\n` + // 오리지널
    `|${wikiable.lyricist}\n` + // 작사
    `|${wikiable.composer}\n` + // 작곡
    `|${wikiable.arranger}\n` + // 편곡
    `|${stringifyCategories(item)}\n` +
    `|${translateArtistOrAsIs(
      manualMetadata[item.title]?.mv2d?.illust || ""
    )}\n` + // 일러스트
    `|${linkYouTube(manualMetadata[item.title]?.mvExternal)}\n` + // 게임 외 버전
    `|${formatReleaseDate(item)}\n`
  );
}

musics.sort(sorter);

const ids = musics.map((item) => item.id);

await Deno.writeTextFile(
  new URL("../output/musics.wikitext", import.meta.url),
  `아래 표는 프로세카봇이 자동 생성하였습니다. 수동 편집할 경우 곧 덮어씌워지게 되므로
편집이 필요할 경우 [[틀토론:프로세카 악곡 목록]] 또는
[https://github.com/saschanaz/femiwiki-prsk-music-list/issues 코드 저장소]에 문의해 주세요.

[[프로세카/악곡]] 문서에서 일부 추가 정보를 볼 수 있습니다.

<onlyinclude><templatestyles src="프로세카 악곡 목록/styles.css" />
{| class="prsk-music-table sortable"
!제목
!원제
!영문 제목
!분류
!오리지널
!작사
!작곡
!편곡
!MV
!2DMV 일러스트
!게임 외 MV
!추가일
${musics
  .filter((music) => music.publishedAt < Date.now())
  .map(convertAsWikimediaTableRow)
  .join("")}|}

=== 영문 버전 전용 악곡 ===
<templatestyles src="프로세카 악곡 목록/styles.css" />
{| class="prsk-music-table sortable"
!제목
!원제
!영문 제목
!분류
!오리지널
!작사
!작곡
!편곡
!MV
!2DMV 일러스트
!게임 외 MV
!추가일
${musicsEn
  .filter((music) => !ids.includes(music.id))
  .filter((music) => music.publishedAt < Date.now())
  .map(convertAsWikimediaTableRow)
  .join("")}|}</onlyinclude>
`
);
