import musicTags from "../sekai-master-db-diff/musicTags.json" assert { type: "json" };
import musicDifficulties from "../sekai-master-db-diff/musicDifficulties.json" assert { type: "json" };
import musicsEn from "../sekai-master-db-en-diff/musics.json" assert { type: "json" };
import musicsKo from "../sekai-master-db-kr-diff/musics.json" assert { type: "json" };
import artistTransliteration from "../manual/artist-transliteration.json" assert { type: "json" };
import manualMetadata from "../manual/musics.json" assert { type: "json" };

import {
  matchesGlobalConvention,
  tryMatchingKoreanConvention,
} from "../lib/utilities.js";

/** @type {Map<string, string>} */
const artistOfficialTransliteration = new Map();

/** @param {import("./types.d.ts").Music} music */
function isKakioroshi(music) {
  return music.seq >= 2000000 && music.seq < 3000000;
}

/**
 * @param {import("./types.d.ts").Music} music
 * @return {string | undefined}
 */
function maybeMapKoreanTitle(music) {
  const { title } = music;
  const ko = musicsKo.find((ko) => ko.id === music.id);
  const mapped = !ko
    ? tryMatchingKoreanConvention(title)
    : !ko.infos[0] // May not exist if no translation is needed
    ? title
    : ko.infos[0].title;
  const manual = manualMetadata[title]?.titleKo;
  if (mapped) {
    if (manual) {
      console.warn(`titleKo is ignored for "${title}"`);
    }
    return mapped;
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
  if (matchesGlobalConvention(music.title)) {
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

/** @param {string} name */
function trimName(name) {
  if (!name || name === "-" || name === "ー") {
    return "";
  }
  return name;
}

/**
 * @param {string} name
 * @returns {string}
 */
export function transliterateArtistOrAsIs(name) {
  if (!trimName(name)) {
    return "";
  }
  const replaced = tryMatchingKoreanConvention(name);
  if (replaced) {
    return replaced;
  }
  const transliterated =
    artistOfficialTransliteration.get(name) ?? artistTransliteration[name];
  if (!transliterated) {
    console.warn(`No translation for artist "${name}"`);
  }
  return transliterated || name;
}

/**
 * @param {string} original
 * @param {string} transliterated
 */
function recordTransliterationForReuse(original, transliterated) {
  if (artistTransliteration[original]) {
    console.warn(`artist-transliteration is ignored for ${original}`);
  }
  artistOfficialTransliteration.set(original, transliterated);
}

/**
 * @typedef {object} Artists
 * @property {string} lyricist
 * @property {string} composer
 * @property {string} arranger
 *
 * @param {import("./types.d.ts").Music} music
 * @return {Artists}
 */
export function mapArtistsOrAsIs(music) {
  const info = musicsKo.find((ko) => ko.id === music.id)?.infos[0];
  if (info) {
    recordTransliterationForReuse(music.lyricist, info.lyricist);
    recordTransliterationForReuse(music.composer, info.composer);
    recordTransliterationForReuse(music.arranger, info.arranger);
    return {
      lyricist: trimName(info.lyricist),
      composer: trimName(info.composer),
      arranger: trimName(info.arranger),
    };
  }
  return {
    lyricist: transliterateArtistOrAsIs(music.lyricist),
    composer: transliterateArtistOrAsIs(music.composer),
    arranger: transliterateArtistOrAsIs(music.arranger),
  };
}

/** @param {import("./types.d.ts").Music} music */
export function getWikiableMusicData(music) {
  return {
    kakioroshi: isKakioroshi(music),
    titleKo: maybeMapKoreanTitle(music),
    titleEn: maybeMapEnglishTitle(music),
    tags: getMusicTag(music.id),
    ...mapArtistsOrAsIs(music),
    difficulties: getMusicPlayInfo(music.id),
  };
}
