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
