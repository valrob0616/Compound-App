import path from 'node:path';

import { createAccountService } from './accounts.ts';
import { createAccountHttpServer } from './http.ts';
import { createFileStore } from './store.ts';

/**
 * Account API for Family Compound & Homestead Living.
 * Logs method, path, and status only — never request bodies or passwords.
 *
 *   PORT                 default 8787
 *   HOST                 default 0.0.0.0
 *   ACCOUNTS_DATA_FILE   default server/data/accounts.json
 *   BCRYPT_ROUNDS        default 10 (integer 4–12)
 */

function bcryptRounds(): number {
  const raw = process.env.BCRYPT_ROUNDS;
  if (!raw) return 10;
  const rounds = Number(raw);
  if (!Number.isInteger(rounds) || rounds < 4 || rounds > 12) return 10;
  return rounds;
}

const port = Number(process.env.PORT ?? 8787);
const host = process.env.HOST ?? '0.0.0.0';
const dataFile =
  process.env.ACCOUNTS_DATA_FILE ?? path.join(process.cwd(), 'server', 'data', 'accounts.json');

const service = await createAccountService(createFileStore(dataFile), { bcryptRounds: bcryptRounds() });
const server = createAccountHttpServer(service, {
  log: (line) => {
    console.log(line);
  },
});

server.listen(port, host, () => {
  console.log(`Account server listening on http://${host}:${port}`);
  console.log(`Account data file: ${dataFile}`);
});
