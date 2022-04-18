import musicTags from "../sekai-master-db-diff/musicTags.json" assert { type: "json" };
import musicDifficulties from "../sekai-master-db-diff/musicDifficulties.json" assert { type: "json" };
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
  const manual = manualMetadata[title]?.titleKo;
  if (replaced) {
    if (manual) {
      console.warn(`titleKo is ignored for "${title}"`);
    }
    return replaced;
  }
  if (manual) {
    return manual;
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
 * @param {number} musicId
 * @return {import("./types.d.ts").MusicPlayRecord}
 */
function getMusicPlayInfo(musicId) {
  /** @type {*} */
  const result = {};
  const difficulties = musicDifficulties.filter(
    (tag) => tag.musicId === musicId
  );
  for (const d of difficulties) {
    result[d.musicDifficulty] = d;
  }
  return result;
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
    difficulties: getMusicPlayInfo(music.id),
  };
}
