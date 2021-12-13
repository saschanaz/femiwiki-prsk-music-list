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

function mapEnglishTitle(assetbundleName) {
  return musicsEn.find((music) => music.assetbundleName === assetbundleName)?.title || "";
}

function convertAsWikimediaTableRow(item) {
  return (
    `|-\n` +
    `|${item.title}\n` + // 원제
    `|${mapEnglishTitle(item.assetbundleName)}\n` + // 영문제목
    `|${translateArtist(item.lyricist)}\n` + // 작사
    `|${translateArtist(item.composer)}\n` + // 작곡
    `|${item.arranger === "-" ? "" : translateArtist(item.arranger)}\n` + // 편곡
    `|${stringifyCategories(item.categories)}\n` +
    `|${dateTimeFormat.format(item.publishedAt)}\n`
  );
}

/** @type {*[]} */
const musics = JSON.parse(
  await Deno.readTextFile("./sekai-master-db-diff/musics.json")
);
/** @type {*[]} */
const musicsEn = JSON.parse(
  await Deno.readTextFile("./sekai-master-db-en-diff/musics.json")
);
const artistTranslation = JSON.parse(
  await Deno.readTextFile("./artist-translation.json")
);
musics.sort(sorter);

const dateTimeFormat = Intl.DateTimeFormat('ko-kr', { dateStyle: 'long' });

await Deno.writeTextFile(
  "./output.wikitext",
  `{| class="wikitable sortable"
!제목
!영문제목
!작사
!작곡
!편곡
!MV
!추가일
${musics.map(convertAsWikimediaTableRow).join("")}|}\n`
);
