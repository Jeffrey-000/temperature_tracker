import { Dispatch, SetStateAction } from "react";

export type stateTuple<T> = [T, Dispatch<SetStateAction<T>>];
