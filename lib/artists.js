import chalk from "npm:chalk";
import musicsKo from "../sekai-master-db-kr-diff/musics.json" assert { type: "json" };

import artists from "../manual/artists.json" assert { type: "json" };
import { matchesGlobalConvention, tryMatchingKoreanConvention } from "./utilities.js";

/** @type {Map<string, string>} */
const artistOfficialTransliteration = new Map();

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
    artistOfficialTransliteration.get(name) ?? artists[name]?.transliteration;
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
  if (artists[original]) {
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

/**
 * @param {string} text
 * @param {string} url
 */
function maybeLinkToUrl(text, url) {
  if (url) {
    return `[${url} ${text}]`
  }
  return text;
}

/**
 * @param {string} name
 */
export function wikifyArtist(name) {
  if (!name) {
    return "";
  }
  let { transliteration, url } = artists[name] ?? {};
  if (!transliteration) {
    transliteration = artistOfficialTransliteration.get(name);
  }
  if (!transliteration && !matchesGlobalConvention(name)) {
    console.warn(`No transliteration for ${name}`);
  }
  if (!url) {
    console.warn(chalk.gray(`No profile URL for ${name}`));
  }
  return maybeLinkToUrl(transliteration ?? name, url);
}
