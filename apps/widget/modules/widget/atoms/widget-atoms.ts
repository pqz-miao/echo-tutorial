import { atom } from "jotai";
import { WidgetScreen } from "../types";

// Basic widget state atoms
export const screenAtom = atom<WidgetScreen>("loading");
