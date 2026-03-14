import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Score {
    score: bigint;
    gameName: string;
}
export interface backendInterface {
    getTopScores(gameName: string): Promise<Array<Score>>;
    saveScore(gameName: string, score: bigint): Promise<void>;
}
