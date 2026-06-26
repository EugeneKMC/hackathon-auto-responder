import { sign, verify } from 'hono/jwt';
import { env } from '@/utils/env';

// This Hono version requires the algorithm to be passed explicitly to verify().
const ALG = 'HS256';

export type JwtPayload = {
  sub: string; // account id (stringified)
  email: string;
  client_id: string;
  name: string | null;
  exp: number; // unix seconds
};

export async function signToken(
  payload: Omit<JwtPayload, 'exp'>
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + env.JWT_EXPIRES_IN_SECONDS;
  return sign({ ...payload, exp }, env.JWT_SECRET, ALG);
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  return (await verify(token, env.JWT_SECRET, ALG)) as JwtPayload;
}
