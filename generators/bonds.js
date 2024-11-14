import bonds from "../sekai-master-db-diff/bonds.json" with { type: "json" };
import bondsHonerWords from "../sekai-master-db-diff/bondsHonorWords.json" with { type: "json" };

const CHARACTERS = {
  "호시노 이치카": {
    thumbnail: "이치카썸네일-removebg-preview.png",
    unit: "레오니",
  },
  "텐마 사키": {
    thumbnail: "사키썸네일.png",
    unit: "레오니",
  },
  "모치즈키 호나미": {
    thumbnail: "호나미썸네일.png",
    unit: "레오니",
  },
  "히노모리 시호": {
    thumbnail: "시호썸네일-removebg-preview.png",
    unit: "레오니",
  },
  "하나사토 미노리": {
    thumbnail: "미노리썸네일.png",
    unit: "모모점",
  },
  "키리타니 하루카": {
    thumbnail: "하루카썸네일.png",
    unit: "모모점",
  },
  "모모이 아이리": {
    thumbnail: "아이리썸네일.png",
    unit: "모모점",
  },
  "히노모리 시즈쿠": {
    thumbnail: "시즈쿠썸네일.png",
    unit: "모모점",
  },
  "아즈사와 코하네": {
    thumbnail: "코하네썸네일.png",
    unit: "비비배스",
  },
  "시라이시 안": {
    thumbnail: "안썸네일.png",
    unit: "비비배스",
  },
  "시노노메 아키토": {
    thumbnail: "아키토썸네일.png",
    unit: "비비배스",
  },
  "아오야기 토우야": {
    thumbnail: "토우야썸네일.png",
    unit: "비비배스",
  },
  "텐마 츠카사": {
    thumbnail: "츠카사썸네일.png",
    unit: "원더쇼",
  },
  "오오토리 에무": {
    thumbnail: "에무썸네일.png",
    unit: "원더쇼",
  },
  "쿠사나기 네네": {
    thumbnail: "네네썸네일.png",
    unit: "원더쇼",
  },
  "카미시로 루이": {
    thumbnail: "루이썸네일.png",
    unit: "원더쇼",
  },
  "요이사키 카나데": {
    thumbnail: "카나데썸네일.png",
    unit: "니고",
  },
  "아사히나 마후유": {
    thumbnail: "마후유썸네일.png",
    unit: "니고",
  },
  "시노노메 에나": {
    thumbnail: "에나썸네일.png",
    unit: "니고",
  },
  "아키야마 미즈키": {
    thumbnail: "미즈키썸네일.png",
    unit: "니고",
  },
  "하츠네 미쿠": {
    thumbnail: "미쿠썸네일.png",
    unit: "VOCALOID",
  },
  "카가미네 린": {
    thumbnail: "린썸네일.png",
    unit: "VOCALOID",
  },
  "카가미네 렌": {
    thumbnail: "렌썸네일.png",
    unit: "VOCALOID",
  },
  "메구리네 루카": {
    thumbnail: "루카썸네일.png",
    unit: "VOCALOID",
  },
  MEIKO: {
    thumbnail: "메이코썸네일.png",
    unit: "VOCALOID",
  },
  KAITO: {
    thumbnail: "카이토썸네일.png",
    unit: "VOCALOID",
  },
};

const VSINGERS = {
  레오니: ["하츠네 미쿠", "메구리네 루카"],
  모모점: ["하츠네 미쿠", "카가미네 린"],
  비비배스: ["하츠네 미쿠", "카가미네 렌", "MEIKO"],
  원더쇼: ["하츠네 미쿠", "KAITO"],
  니고: ["하츠네 미쿠"],
};

/**
 * @param {string} hangul
 */
function hasTrailingConsonant(hangul) {
  return !!((hangul.at(-1).codePointAt(0) - 44032) % 28);
}

/**
 * @param {string} text
 * @param {string} character1
 * @param {string} character2
 */
function translateDescription(text, character1, character2) {
  /**
   * @param {string} name
   */
  function linkToDocument(name) {
    if (CHARACTERS[name].unit === "VOCALOID") {
      return `[[${name}(프로젝트 세카이)|${name}]]`;
    }
    return `[[${name}]]`;
  }

  const match = text.match(/\S+と\S+のキズナランクを([0-9]+)まで上げよう。/);
  const and = hasTrailingConsonant(character1) ? "과" : "와";
  return `${linkToDocument(character1)}${and} ${linkToDocument(
    character2
  )}의 인연 랭크를 ${match[1]}까지 올리자.`;
}

const dataRows = bondsHonerWords.map((word) => {
  const bondsGroup = bonds.find((b) => b.groupId === word.bondsGroupId);
  const character1 = Object.keys(CHARACTERS)[bondsGroup.characterId1 - 1];
  const character2 = Object.keys(CHARACTERS)[bondsGroup.characterId2 - 1];
  return {
    character1,
    character2,
    word: word.name,
    description: translateDescription(word.description, character1, character2),
  };
});

function rowToWikitext(row) {
  const unit1 = CHARACTERS[row.character1].unit;
  const unit2 = CHARACTERS[row.character2].unit;
  const prefix =
    unit2 === "VOCALOID" &&
    unit1 !== "VOCALOID" &&
    VSINGERS[unit1].includes(row.character2)
      ? unit1
      : "";
  return (
    `|-\n` +
    `|[[파일:${CHARACTERS[row.character1].thumbnail}|50px]]\n` +
    `|[[파일:${prefix}${CHARACTERS[row.character2].thumbnail}|50px]]\n` +
    `|${row.word}\n` +
    `|${row.description}\n`
  );
}

await Deno.writeTextFile(
  new URL("../output/bondHonorWords.wikitext", import.meta.url),
  `{| class="wikitable sortable"
!캐릭터 1
!캐릭터 2
!칭호명
!설명
${dataRows.map(rowToWikitext).join("")}|}
`
);
