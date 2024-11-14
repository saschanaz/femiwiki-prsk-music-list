import musics from "../sekai-master-db-diff/musics.json" with { type: "json" };
import musicDifficulties from "../sekai-master-db-diff/musicDifficulties.json" with { type: "json" };
import eventStoryUnits from "../sekai-master-db-diff/eventStoryUnits.json" with { type: "json" };

type ArrayInnerType<X> = X extends Array<infer I> ? I : never;

type Music = ArrayInnerType<typeof musics>;

type MusicTag = "vocaloid" | "light_music_club" | "idol" | "street" | "theme_park" | "school_refusal"

type Difficulty = "easy" | "normal" | "hard" | "expert" | "master";
type MusicPlayInfo = ArrayInnerType<typeof musicDifficulties>;
type MusicPlayRecord = Record<Difficulty, MusicPlayInfo>;

type EventStoryUnit = ArrayInnerType<typeof eventStoryUnits>;
