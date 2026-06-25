import { findAccountByEmail, findAccountById } from '@/repositories/account';
import { findClient } from '@/repositories/client';
import { signToken } from '@/utils/jwt';
import { ServiceResponse } from '@/utils/service_response';
import type { Account } from '@/models/accounts';
import type { LoginPayload } from '@/schemas/auth';

// Public-facing account shape — never leaks password_hash.
function toPublicUser(account: Account) {
  return {
    id: account.id,
    email: account.email,
    name: account.name,
    client_id: account.clientId,
  };
}

export const authService = {
  async login(payload: LoginPayload) {
    const email = payload.email.trim().toLowerCase();
    const account = await findAccountByEmail(email);

    // Verify even when the account is missing? Keep it simple for a mock:
    // a single generic message avoids leaking which emails exist.
    if (!account) {
      return ServiceResponse.unauthorized('Invalid email or password');
    }

    const valid = await Bun.password.verify(
      payload.password,
      account.passwordHash
    );
    if (!valid) {
      return ServiceResponse.unauthorized('Invalid email or password');
    }

    const token = await signToken({
      sub: String(account.id),
      email: account.email,
      client_id: account.clientId,
      name: account.name,
    });

    const client = await findClient({ client_id: account.clientId });

    return ServiceResponse.success({
      token,
      user: toPublicUser(account),
      client,
    });
  },

  async getMe(accountId: number) {
    const account = await findAccountById(accountId);
    if (!account) return ServiceResponse.notFound('Account not found');

    const client = await findClient({ client_id: account.clientId });

    return ServiceResponse.success({
      user: toPublicUser(account),
      client,
    });
  },
};
