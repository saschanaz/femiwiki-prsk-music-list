import bonds from "../sekai-master-db-diff/bonds.json" assert { type: "json" };
import bondsHonerWords from "../sekai-master-db-diff/bondsHonorWords.json" assert { type: "json" };

const CHARACTERS = {
  "호시노 이치카": {
    thumbnail: "이치카썸네일-removebg-preview.png",
  },
  "텐마 사키": {
    thumbnail: "사키썸네일.png",
  },
  "모치즈키 호나미": {
    thumbnail: "호나미썸네일.png",
  },
  "히노모리 시호": {
    thumbnail: "시호썸네일-removebg-preview.png",
  },
  "하나사토 미노리": {
    thumbnail: "미노리썸네일.png",
  },
  "키리타니 하루카": {
    thumbnail: "하루카썸네일.png",
  },
  "모모이 아이리": {
    thumbnail: "아이리썸네일.png",
  },
  "히노모리 시즈쿠": {
    thumbnail: "시즈쿠썸네일.png",
  },
  "아즈사와 코하네": {
    thumbnail: "코하네썸네일.png",
  },
  "시라이시 안": {
    thumbnail: "안썸네일.png",
  },
  "시노노메 아키토": {
    thumbnail: "아키토썸네일.png",
  },
  "아오야기 토우야": {
    thumbnail: "토우야썸네일.png",
  },
  "텐마 츠카사": {
    thumbnail: "츠카사썸네일.png",
  },
  "오오토리 에무": {
    thumbnail: "에무썸네일.png",
  },
  "쿠사나기 네네": {
    thumbnail: "네네썸네일.png",
  },
  "카미시로 루이": {
    thumbnail: "루이썸네일.png",
  },
  "요이사키 카나데": {
    thumbnail: "카나데썸네일.png",
  },
  "아사히나 마후유": {
    thumbnail: "마후유썸네일.png",
  },
  "시노노메 에나": {
    thumbnail: "에나썸네일.png",
  },
  "아키야마 미즈키": {
    thumbnail: "미즈키썸네일.png",
  },
  "하츠네 미쿠": {
    thumbnail: "미쿠썸네일.png",
  },
  "카가미네 린": {
    thumbnail: "린썸네일.png",
  },
  "카가미네 렌": {
    thumbnail: "렌썸네일.png",
  },
  "메구리네 루카": {
    thumbnail: "루카썸네일.png",
  },
  "MEIKO": {
    thumbnail: "메이코썸네일.png",
  },
  "KAITO": {
    thumbnail: "카이토썸네일.png",
  },
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
  const match = text.match(/\S+と\S+のキズナランクを([0-9]+)まで上げよう。/);
  const and = hasTrailingConsonant(character1) ? "과" : "와";
  return `[[${character1}]]${and} [[${character2}]]의 인연 랭크를 ${match[1]}까지 올리자.`;
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
  return (
    `|-\n` +
    `|[[파일:${CHARACTERS[row.character1].thumbnail}|50px]]\n` +
    `|[[파일:${CHARACTERS[row.character2].thumbnail}|50px]]\n` +
    `|${row.word}\n` +
    `|${row.description}\n`
  );
}

await Deno.writeTextFile(
  "./bondHonorWords.wikitext",
  `{| class="wiktable sortable"
!캐릭터 1
!캐릭터 2
!칭호명
!설명
${dataRows.map(rowToWikitext).join("")}|}
`);
