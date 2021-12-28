import musics from "./sekai-master-db-diff/musics.json" assert { type: "json" };
import musicTags from "./sekai-master-db-diff/musicTags.json" assert { type: "json" };
import musicsEn from "./sekai-master-db-en-diff/musics.json" assert { type: "json" };
import artistTranslation from "./name-translations/artists.json" assert { type: "json" };
import manualMetadata from "./manual-metadata.json" assert { type: "json" };

import { KOR_DATE_FORMAT, mapUnitName } from "./lib/utilities.js";

function sorter(a, b) {
  const byPublishedAt = a.publishedAt - b.publishedAt;
  if (byPublishedAt !== 0) {
    return byPublishedAt;
  }
  return a.seq - b.seq;
}

/**
 * @param {string} name
 * @returns {string}
 */
function translateArtistOrAsIs(name) {
  if (name === "-") {
    return "";
  }
  if (name.match(/^[\x20-\x7F]*$/)) {
    return name;
  }
  const translated = artistTranslation[name];
  if (!translated) {
    console.warn(`No translation for artist "${name}"`);
  }
  return translated || name;
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

function maybeTranslateTitle(title) {
  if (title.match(/^[\x20-\x7F]*$/)) {
    return title;
  }
  const translated = manualMetadata[title]?.titleKo;
  if (!translated) {
    console.warn(`No translation for title "${title}"`);
  }
  return translated || "";
}

function maybeMapEnglishTitle(music) {
  const mapped = musicsEn.find((en) => en.id === music.id)?.title;
  const manual = manualMetadata[music.title]?.titleEn;
  if (mapped) {
    if (manual) {
      console.warn(`titleEn is ignored for "${music.title}"`);
    }
    return mapped;
  }
  if (manual) {
    return manual;
  }
  if (music.title.match(/^[\x20-\x7F]*$/)) {
    return music.title;
  }
  return "";
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

function getMusicTag(item) {
  return musicTags
    .filter((tag) => tag.musicId === item.id)
    .map((tag) => tag.musicTag)
    .filter((tag) => !["all", "other"].includes(tag))
    .map(mapUnitName)
    .join("");
}

function hideIfAlreadyEnglish(title) {
  if (title.match(/^[\x20-\x7F]*$/)) {
    return ' style="visibility:hidden"';
  }
  return "";
}

function isKakioroshi(item) {
  return item.seq >= 2000000;
}

function dataKakiroshi(item) {
  if (isKakioroshi(item)) {
    return "data-kakioroshi";
  }
  return "";
}

function convertAsWikimediaTableRow(item) {
  return (
    `|-\n` +
    `|${dataKakiroshi(item)}|${maybeTranslateTitle(item.title)}\n` + // 제목
    `|lang=ja${hideIfAlreadyEnglish(item.title)}|${item.title}\n` + // 원제
    `|${hideIfAlreadyEnglish(item.title)}|${maybeMapEnglishTitle(item)}\n` + // 영문제목
    `|${getMusicTag(item)}\n` + // 분류
    `|${isKakioroshi(item) ? "✔️" : ""}\n` + // 오리지널
    `|${translateArtistOrAsIs(item.lyricist)}\n` + // 작사
    `|${translateArtistOrAsIs(item.composer)}\n` + // 작곡
    `|${translateArtistOrAsIs(item.arranger)}\n` + // 편곡
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
  "./output.wikitext",
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
${musics.map(convertAsWikimediaTableRow).join("")}|}

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
  .filter((en) => !ids.includes(en.id))
  .map(convertAsWikimediaTableRow)
  .join("")}|}</onlyinclude>
`
);
