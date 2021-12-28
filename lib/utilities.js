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

export function mapUnitName(unitName, px = 24) {
  switch (unitName) {
    case "light_music_club":
    case "light_sound":
      return `[[파일:레오니로고.png|${px}px]]`;
    case "idol":
      return `[[파일:모모점로고.png|${px}px]]`;
    case "street":
      return `[[파일:비배스로고.png|${px}px]]`;
    case "theme_park":
      return `[[파일:원더쇼로고.png|${px}px]]`;
    case "school_refusal":
      return `[[파일:니고로고.png|${px}px]]`;
    case "vocaloid":
      return `[[파일:버싱로고.png|${px}px]]`;
    default:
      throw new Error(unitName);
  }
}
