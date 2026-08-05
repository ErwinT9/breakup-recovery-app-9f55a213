import type { screensEn } from "../en/screens";
import type { uiEn } from "../en/ui";

type Base = typeof screensEn & typeof uiEn;
type DeepPartial<T> = T extends readonly unknown[]
  ? string[]
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : string;

/** Any subset of the English section catalogues; gaps fall back to English. */
export type Extra = DeepPartial<Base>;
