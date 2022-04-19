export function jsonToFormData(object) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(object)) {
    formData.append(key, value);
  }
  return formData;
}

export const KOR_DATE_FORMAT = Intl.DateTimeFormat("ko-kr", {
  dateStyle: "long",
  timeZone: "Asia/Seoul",
});

/**
 * @param {string} unitName
 * @returns
 */
export function mapUnitName(unitName) {
  switch (unitName) {
    case "light_music_club":
    case "light_sound":
      return `[[파일:레오니로고.png|24x24픽셀|alt=레오니]]`;
    case "idol":
      return `[[파일:모모점로고.png|24x24픽셀|alt=모모점]]`;
    case "street":
      return `[[파일:비배스로고.png|24x24픽셀|alt=비비배스]]`;
    case "theme_park":
      return `[[파일:원더쇼로고.png|24x24픽셀|alt=원더쇼]]`;
    case "school_refusal":
      return `[[파일:니고로고.png|24x24픽셀|alt=니고]]`;
    case "vocaloid":
      return `[[파일:버싱로고.png|24x24픽셀|alt=버싱]]`;
    default:
      throw new Error(unitName);
  }
}

/**
 * @param {string} name
 */
export function matchesGlobalConvention(name) {
  // TODO: Maybe change to denylist?
  return /^[\x20-\x7F・×☆彡Ⅲ]*$/.test(name);
}

/** @param {string} name */
export function tryMatchingKoreanConvention(name) {
  const replaced = name
    .replace(/（/g, "(")
    .replace(/）/g, ")")
    .replace(/、/g, ", ");
  if (matchesGlobalConvention(replaced)) {
    return replaced;
  }
}
