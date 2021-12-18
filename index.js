import musics from "./sekai-master-db-diff/musics.json" assert { type: "json" };
import musicsEn from "./sekai-master-db-en-diff/musics.json" assert { type: "json" };
import artistTranslation from "./artist-translation.json" assert { type: "json" };
import manualMetadata from "./manual-metadata.json" assert { type: "json" };

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
          const mv2d = manualMetadata[item.title]?.mv2d;
          if (mv2d) {
            return `[${mv2d} 2DMV]`
          }
          return "2DMV";
        }
        case "mv":
          return "3DMV";
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
  const mapped = musicsEn.find(
    (en) => en.assetbundleName === music.assetbundleName
  )?.title;
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

function linkYouTube(url) {
  return url ? `[${url} 유튜브]` : "";
}

function convertAsWikimediaTableRow(item) {
  return (
    `|-\n` +
    `|${maybeTranslateTitle(item.title)}\n` + // 제목
    `|lang=ja|${item.title}\n` + // 원제
    `|${maybeMapEnglishTitle(item)}\n` + // 영문제목
    `|${translateArtistOrAsIs(item.lyricist)}\n` + // 작사
    `|${translateArtistOrAsIs(item.composer)}\n` + // 작곡
    `|${translateArtistOrAsIs(item.arranger)}\n` + // 편곡
    `|${manualMetadata[item.title]?.illust || ""}\n` + // 일러스트
    `|${manualMetadata[item.title]?.movie || ""}\n` + // 영상
    `|${linkYouTube(manualMetadata[item.title]?.vocaloidOnly)}\n` + // 보컬로이드 버전
    `|${stringifyCategories(item)}\n` +
    `|${dateTimeFormat.format(item.publishedAt)}\n`
  );
}

musics.sort(sorter);

const dateTimeFormat = Intl.DateTimeFormat("ko-kr", { dateStyle: "long" });

await Deno.writeTextFile(
  "./output.wikitext",
  `{| class="wikitable sortable"
!제목
!원제
!영문제목
!작사
!작곡
!편곡
!일러스트
!영상
!보컬로이드 버전
!MV
!추가일
${musics.map(convertAsWikimediaTableRow).join("")}|}\n`
);
