import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const COOKIE_SECRET = new TextEncoder().encode(
  process.env.COOKIE_SECRET || 'supersecretcookie456_default_fallback_must_be_long'
);

const WALLET_COOKIE_NAME = 'wallet_session';
const INITIAL_BALANCE = 10000;

export async function signWalletToken(balance: number): Promise<string> {
  return new SignJWT({ balance })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .sign(COOKIE_SECRET);
}

export async function verifyWalletToken(token: string): Promise<{ balance: number } | null> {
  try {
    const { payload } = await jwtVerify(token, COOKIE_SECRET);
    return payload as { balance: number };
  } catch (err) {
    return null;
  }
}

export async function getBalance(): Promise<number> {
  const cookieStore = cookies();
  const token = cookieStore.get(WALLET_COOKIE_NAME)?.value;

  if (!token) {
    // If no token exists, initialize wallet with default balance
    const newToken = await signWalletToken(INITIAL_BALANCE);
    cookieStore.set(WALLET_COOKIE_NAME, newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    return INITIAL_BALANCE;
  }

  const payload = await verifyWalletToken(token);
  if (!payload) {
    // Token invalid or tampered with
    const newToken = await signWalletToken(INITIAL_BALANCE);
    cookieStore.set(WALLET_COOKIE_NAME, newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    return INITIAL_BALANCE;
  }

  return payload.balance;
}

export async function updateBalance(newBalance: number): Promise<void> {
  const cookieStore = cookies();
  const newToken = await signWalletToken(newBalance);

  cookieStore.set(WALLET_COOKIE_NAME, newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}
