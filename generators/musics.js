import musics from "../sekai-master-db-diff/musics.json" assert { type: "json" };
import musicsEn from "../sekai-master-db-en-diff/musics.json" assert { type: "json" };
import manualMetadata from "../manual/musics.json" assert { type: "json" };
import { getWikiableMusicData } from "../lib/musics.js";

import { KOR_DATE_FORMAT, mapUnitName } from "../lib/utilities.js";

import chalk from "npm:chalk";
import { wikifyArtist } from "../lib/artists.js";

/**
 * @param {import("../lib/types.d.ts").Music} a
 * @param {import("../lib/types.d.ts").Music} b
 * @returns
 */
function sorter(a, b) {
  const byPublishedAt = a.publishedAt - b.publishedAt;
  if (byPublishedAt !== 0) {
    return byPublishedAt;
  }
  return a.seq - b.seq;
}

/**
 * @param {import("../lib/types.d.ts").Music} item
 * @returns
 */
function stringifyCategories(item) {
  return item.categories
    .map((category) => {
      switch (category) {
        case "image":
          return; // (MV없음)
        case "original":
          return "원곡MV";
        case "mv_2d": {
          const { url, illust, movie } = manualMetadata[item.title]?.mv2d || {};
          const artists = [];
          if (illust) {
            artists.push(wikifyArtist(illust));
          }
          if (movie) {
            artists.push(wikifyArtist(movie));
          }
          if (!artists.length) {
            console.warn(chalk.gray(`No 2DMV artists for ${item.title}`));
          }
          const stringified = artists.length ? `(${artists.join(", ")})` : "";
          if (url) {
            return `[${url} 2DMV]${stringified}`;
          }
          console.warn(chalk.gray(`No 2DMV URL for ${item.title}`));
          return `2DMV${stringified}`;
        }
        case "mv": {
          const mv3d = manualMetadata[item.title]?.mv3d;
          if (mv3d) {
            return `[${mv3d} 3DMV]`;
          }
          console.warn(chalk.gray(`No 3DMV URL for ${item.title}`));
          return "3DMV";
        }
      }
    })
    .filter((i) => i)
    .join(" ");
}

/**
 * @param {string} title
 */
function linkToMusicPage(title) {
  // https://en.wikipedia.org/wiki/Wikipedia:Naming_conventions_(technical_restrictions)#Clashes_with_wiki_markup/HTML_syntax
  title = title.replaceAll("[", "【").replaceAll("]", "】");
  return `[[프로젝트_세카이_컬러풀_스테이지!_feat._하츠네_미쿠/악곡/${title}|${title}]]`;
}

/**
 * @param {string} translated
 * @param {string} original
 */
function maybeLinkToTranslatedTitle(translated, original) {
  if (translated) {
    return linkToMusicPage(translated);
  }
  return original;
}

/**
 * @param {object} params
 * @param {string} [params.type]
 * @param {string} [params.url]
 */
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

/**
 * @param {string[]} tags
 */
function getMusicTag(tags) {
  return tags
    .filter((tag) => !["all", "other"].includes(tag))
    .map(mapUnitName)
    .join("");
}

function hideIfAlreadyEnglish(matchesEnglishConvention) {
  if (matchesEnglishConvention) {
    return ' style="visibility:hidden"';
  }
  return "";
}

/** @param {boolean} isKakioroshi */
function dataKakiroshi(isKakioroshi) {
  return isKakioroshi ? "data-kakioroshi" : "";
}

/**
 * @param {import("../lib/types.d.ts").Music} item
 * @returns
 */
function convertAsWikimediaTableRow(item) {
  const wikiable = getWikiableMusicData(item);
  const titleMatchesEnglishConvention = item.title === wikiable.titleEn;
  return (
    `|-\n` +
    `|${dataKakiroshi(wikiable.kakioroshi)}|${maybeLinkToTranslatedTitle(
      wikiable.titleKo,
      item.title
    )}\n` + // 제목
    `|lang=ja${hideIfAlreadyEnglish(titleMatchesEnglishConvention)}|${
      item.title
    }\n` + // 원제
    `|${hideIfAlreadyEnglish(titleMatchesEnglishConvention)}|${
      wikiable.titleEn || ""
    }\n` + // 영문제목
    `|${getMusicTag(wikiable.tags)}\n` + // 분류
    `|${wikiable.kakioroshi ? "✔️" : ""}\n` + // 오리지널
    `|${wikiable.lyricist}\n` + // 작사
    `|${wikiable.composer}\n` + // 작곡
    `|${wikiable.arranger}\n` + // 편곡
    `|${stringifyCategories(item)}\n` +
    `|${wikifyArtist(
      manualMetadata[item.title]?.mv2d?.illust || ""
    )}\n` + // 일러스트
    `|${linkYouTube(manualMetadata[item.title]?.mvExternal)}\n` + // 게임 외 버전
    `|${formatReleaseDate(item)}\n`
  );
}

/**
 * @param {number[]} jaIds
 */
function optionalEnglishOnlyMusics(jaIds) {
  const globalOnlyMusics = musicsEn
    .filter((music) => !jaIds.includes(music.id))
    .filter((music) => music.publishedAt < Date.now());
  if (!globalOnlyMusics.length) {
    return "";
  }
  return `

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
${globalOnlyMusics.map(convertAsWikimediaTableRow).join("")}|}`;
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
  .join("")}|}${optionalEnglishOnlyMusics(ids)}</onlyinclude>
`
);
