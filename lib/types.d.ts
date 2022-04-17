import musics from "../sekai-master-db-diff/musics.json" assert { type: "json" };

type ArrayInnerType<X> = X extends Array<infer I> ? I : never;

type Music = ArrayInnerType<typeof musics>;
