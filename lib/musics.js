import musicTags from "../sekai-master-db-diff/musicTags.json" with { type: "json" };
import musicDifficulties from "../sekai-master-db-diff/musicDifficulties.json" with { type: "json" };
import musicsEn from "../sekai-master-db-en-diff/musics.json" with { type: "json" };
import musicsKo from "../sekai-master-db-kr-diff/musics.json" with { type: "json" };
import manualMetadata from "../manual/musics.json" with { type: "json" };

import {
  matchesGlobalConvention,
  tryMatchingKoreanConvention,
} from "../lib/utilities.js";
import { mapArtistsOrAsIs } from "./artists.js";

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
