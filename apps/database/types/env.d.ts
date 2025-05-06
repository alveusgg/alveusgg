/// <reference types="node" />

declare namespace NodeJS {
  type ProcessEnv = Record<string, never> & {
    readonly NODE_ENV?: string;
    readonly DATABASE_URL?: string;
  };
}
