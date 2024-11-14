import chalk from "npm:chalk";
import musicsKo from "../sekai-master-db-kr-diff/musics.json" with { type: "json" };

import artists from "../manual/artists.json" with { type: "json" };
import { tryMatchingKoreanConvention } from "./utilities.js";

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
function transliterateArtistOrAsIs(name) {
  if (!trimName(name)) {
    return "";
  }
  const official = artistOfficialTransliteration.get(name);
  if (official) {
    return official;
  }
  const replaced = tryMatchingKoreanConvention(name);
  if (replaced) {
    return replaced;
  }
  const transliterated = artists[name]?.transliteration;
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
  if (!trimName(original) || !trimName(transliterated)) {
    return;
  }
  if (artists[original]) {
    console.warn(`artist-transliteration is ignored for ${original}`);
  }
  if (
    artistOfficialTransliteration.has(original) &&
    artistOfficialTransliteration.get(original) !== transliterated
  ) {
    console.warn(
      chalk.gray`The official transliteration has a conflict: ${original} -> ${artistOfficialTransliteration.get(
        original
      )} / ${transliterated}`
    );
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
  }
  return {
    lyricist: wikifyArtist(music.lyricist),
    composer: wikifyArtist(music.composer),
    arranger: wikifyArtist(music.arranger),
  };
}

/**
 * @param {string} text
 * @param {string} url
 */
function maybeLinkToUrl(text, url) {
  if (url) {
    return `[${url} ${text}]`;
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
  const { url } = artists[name] ?? {};
  if (!url) {
    console.warn(chalk.gray(`No profile URL for ${name}`));
  }
  const transliteration = transliterateArtistOrAsIs(name);
  return maybeLinkToUrl(transliteration, url);
}
