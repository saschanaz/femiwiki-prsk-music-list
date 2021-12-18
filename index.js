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
function translateArtist(name) {
  if (name.match(/^[\x20-\x7F]*$/)) {
    return name;
  }
  const translated = artistTranslation[name];
  if (!translated) {
    throw new Error(`No translation for artist "${name}"`);
  }
  return translated;
}

function stringifyCategories(categories) {
  return categories
    .map((category) => {
      switch (category) {
        case "image":
          return; // (MV없음)
        case "original":
          return "원곡MV";
        case "mv_2d":
          return "2DMV";
        case "mv":
          return "3DMV";
      }
    })
    .filter((i) => i)
    .join(" ");
}

function translateTitle(title) {
  if (title.match(/^[\x20-\x7F]*$/)) {
    return title;
  }
  const translated = manualMetadata[title]?.titleKo;
  if (!translated) {
    throw new Error(`No translation for title "${title}"`);
  }
  return translated;
}

function mapEnglishTitle(music) {
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

function convertAsWikimediaTableRow(item) {
  return (
    `|-\n` +
    `|${translateTitle(item.title)}\n` + // 제목
    `|${mapEnglishTitle(item)}\n` + // 영문제목
    `|${translateArtist(item.lyricist)}\n` + // 작사
    `|${translateArtist(item.composer)}\n` + // 작곡
    `|${item.arranger === "-" ? "" : translateArtist(item.arranger)}\n` + // 편곡
    `|lang=ja|${item.title}\n` + // 원제
    `|${stringifyCategories(item.categories)}\n` +
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
!MV
!추가일
${musics.map(convertAsWikimediaTableRow).join("")}|}\n`
);
