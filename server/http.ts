import { createServer as createHttpServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';

import { AccountError, type AccountService } from './accounts.ts';

export type AccountServerHandle = {
  server: Server;
  url: string;
};

type LogFn = (line: string) => void;

function pathnameOf(url: string | undefined): string {
  try {
    const pathname = new URL(url ?? '/', 'http://127.0.0.1').pathname;
    if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1);
    return pathname;
  } catch {
    return '/';
  }
}

function send(res: ServerResponse, status: number, body?: unknown): void {
  const payload = body === undefined ? '' : JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  });
  res.end(payload);
}

function bearer(req: IncomingMessage): string {
  const header = req.headers.authorization;
  if (!header || Array.isArray(header)) return '';
  const match = /^Bearer\s+(\S+)$/.exec(header.trim());
  return match?.[1] ?? '';
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > 65_536) {
        reject(new AccountError('Request is too large.', 413));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const raw = await readBody(req);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new AccountError('Expected JSON.', 400);
  }
}

async function dispatch(service: AccountService, req: IncomingMessage, res: ServerResponse): Promise<void> {
  const method = (req.method ?? 'GET').toUpperCase();
  const pathname = pathnameOf(req.url);

  if (method === 'OPTIONS') {
    send(res, 204);
    return;
  }

  if (method === 'GET' && pathname === '/health') {
    send(res, 200, { ok: true });
    return;
  }

  if (method === 'POST' && pathname === '/v1/signup') {
    const result = await service.signUp(await readJson(req));
    send(res, 201, result);
    return;
  }

  if (method === 'POST' && pathname === '/v1/signin') {
    const result = await service.signIn(await readJson(req));
    send(res, 200, result);
    return;
  }

  if (method === 'GET' && pathname === '/v1/session') {
    send(res, 200, { user: await service.session(bearer(req)) });
    return;
  }

  if (method === 'POST' && pathname === '/v1/signout') {
    await service.signOut(bearer(req));
    send(res, 204);
    return;
  }

  if (method === 'PATCH' && pathname === '/v1/profile') {
    send(res, 200, { user: await service.updateProfile(bearer(req), await readJson(req)) });
    return;
  }

  if (method === 'DELETE' && pathname === '/v1/account') {
    await service.deleteAccount(bearer(req));
    send(res, 204);
    return;
  }

  if (method === 'GET' && pathname === '/v1/favorites') {
    send(res, 200, { favorites: await service.listFavorites(bearer(req)) });
    return;
  }

  if (method === 'POST' && pathname === '/v1/favorites/toggle') {
    send(res, 200, await service.toggleFavorite(bearer(req), await readJson(req)));
    return;
  }

  send(res, 404, { error: 'Not found.' });
}

export function createAccountHttpServer(service: AccountService, options?: { log?: LogFn }): Server {
  return createHttpServer((req, res) => {
    void dispatch(service, req, res)
      .catch((err: unknown) => {
        if (res.headersSent) return;
        if (err instanceof AccountError) {
          send(res, err.status, { error: err.message });
          return;
        }
        send(res, 500, { error: 'Something went wrong.' });
      })
      .finally(() => {
        options?.log?.(`${(req.method ?? 'GET').toUpperCase()} ${pathnameOf(req.url)} ${res.statusCode}`);
      });
  });
}

export function startAccountServer(
  service: AccountService,
  options?: { log?: LogFn; host?: string },
): Promise<AccountServerHandle> {
  const server = createAccountHttpServer(service, options);
  const host = options?.host ?? '127.0.0.1';
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, host, () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('Account server did not bind a port.'));
        return;
      }
      resolve({ server, url: `http://${host}:${address.port}` });
    });
  });
}
