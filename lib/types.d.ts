import musics from "../sekai-master-db-diff/musics.json" assert { type: "json" };
import musicDifficulties from "../sekai-master-db-diff/musicDifficulties.json" assert { type: "json" };

type ArrayInnerType<X> = X extends Array<infer I> ? I : never;

type Music = ArrayInnerType<typeof musics>;

type MusicTag = "vocaloid" | "light_music_club" | "idol" | "street" | "theme_park" | "school_refusal"

type Difficulty = "easy" | "normal" | "hard" | "expert" | "master";
type MusicPlayInfo = ArrayInnerType<typeof musicDifficulties>;
type MusicPlayRecord = Record<Difficulty, MusicPlayInfo>;
