import musicTags from "../sekai-master-db-diff/musicTags.json" assert { type: "json" };
import musicsEn from "../sekai-master-db-en-diff/musics.json" assert { type: "json" };
import artistTranslation from "../manual/artist-transliteration.json" assert { type: "json" };
import manualMetadata from "../manual/musics.json" assert { type: "json" };

import {
  matchesKoreanConvention,
  tryMatchingKoreanConvention,
} from "../lib/utilities.js";

/** @param {import("./types.d.ts").Music} music */
function isKakioroshi(music) {
  return music.seq >= 2000000 && music.seq < 3000000;
}

/** @param {string} title */
function tryTranslateTitle(title) {
  const replaced = tryMatchingKoreanConvention(title);
  if (replaced) {
    return replaced;
  }
  const translated = manualMetadata[title]?.titleKo;
  if (translated) {
    return translated;
  }
  console.warn(`No translation for title "${title}"`);
}

/**
 * @param {import("./types.d.ts").Music} music
 * @return {string | undefined}
 */
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
  if (matchesKoreanConvention(music.title)) {
    return music.title;
  }
}

/** @param {number} musicId */
function getMusicTag(musicId) {
  return musicTags
    .filter((tag) => tag.musicId === musicId)
    .map((tag) => tag.musicTag);
}

/**
 * @param {string} name
 * @returns {string}
 */
export function translateArtistOrAsIs(name) {
  if (!name || name === "-") {
    return "";
  }
  const replaced = tryMatchingKoreanConvention(name);
  if (replaced) {
    return replaced;
  }
  const translated = artistTranslation[name];
  if (!translated) {
    console.warn(`No translation for artist "${name}"`);
  }
  return translated || name;
}

// const ISO_DATE_FORMAT = Intl.DateTimeFormat("sv-SE", {
//   dateStyle: "short",
//   timeZone: "Asia/Tokyo",
// });

/** @param {import("./types.d.ts").Music} music */
export function getWikiableMusicData(music) {
  return {
    kakioroshi: isKakioroshi(music),
    titleKo: tryTranslateTitle(music.title),
    titleEn: maybeMapEnglishTitle(music),
    tags: getMusicTag(music.id),
    lyricist: translateArtistOrAsIs(music.lyricist),
    composer: translateArtistOrAsIs(music.composer),
    arranger: translateArtistOrAsIs(music.arranger),
  };
}
