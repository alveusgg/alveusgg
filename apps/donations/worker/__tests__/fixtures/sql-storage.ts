import { DatabaseSync, type SQLInputValue } from "node:sqlite";

/** An in-memory SQLite database behind the parts of `SqlStorage` we use. */
export function createSqlStorage() {
  const db = new DatabaseSync(":memory:");
  const exec = (query: string, ...bindings: unknown[]) => {
    const statement = db.prepare(query);
    const values = bindings as SQLInputValue[];
    const rows =
      statement.columns().length > 0
        ? (statement.all(...values) as Record<string, SqlStorageValue>[])
        : (statement.run(...values), []);
    const iterator = rows[Symbol.iterator]();
    return {
      toArray: () => rows,
      one: () => {
        if (rows.length !== 1) throw new Error(`Expected one row`);
        return rows[0]!;
      },
      next: () => iterator.next(),
      [Symbol.iterator]: () => iterator,
    };
  };
  return { exec } as unknown as SqlStorage;
}
