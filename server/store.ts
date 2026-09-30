import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { Database } from './types.ts';

export function emptyDatabase(): Database {
  return { users: [], sessions: [], favorites: {} };
}

export type AccountStore = {
  read(): Promise<Database>;
  update<T>(mutator: (db: Database) => T): Promise<T>;
};

function enqueue<T>(chain: { current: Promise<void> }, task: () => Promise<T>): Promise<T> {
  const run = chain.current.then(task, task);
  chain.current = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function createMemoryStore(initial?: Database): AccountStore {
  let db: Database = initial ?? emptyDatabase();
  const chain = { current: Promise.resolve() };
  return {
    read() {
      return enqueue(chain, async () => structuredClone(db));
    },
    update(mutator) {
      return enqueue(chain, async () => mutator(db));
    },
  };
}

async function readDatabase(filePath: string): Promise<Database> {
  try {
    const raw = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as Partial<Database>;
    if (!parsed || !Array.isArray(parsed.users) || !Array.isArray(parsed.sessions) || !parsed.favorites) {
      throw new Error(`Account data file is not a valid database: ${filePath}`);
    }
    return {
      users: parsed.users,
      sessions: parsed.sessions,
      favorites: parsed.favorites,
    };
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') return emptyDatabase();
    throw err;
  }
}

async function writeDatabase(filePath: string, db: Database): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.${process.pid}.tmp`;
  await writeFile(tmp, `${JSON.stringify(db, null, 2)}\n`, 'utf8');
  await rename(tmp, filePath);
}

export function createFileStore(filePath: string): AccountStore {
  const chain = { current: Promise.resolve() };
  return {
    read() {
      return enqueue(chain, () => readDatabase(filePath));
    },
    update(mutator) {
      return enqueue(chain, async () => {
        const db = await readDatabase(filePath);
        const result = mutator(db);
        await writeDatabase(filePath, db);
        return result;
      });
    },
  };
}
