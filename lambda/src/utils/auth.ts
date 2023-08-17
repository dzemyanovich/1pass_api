import twilio from 'twilio';
import jwt from 'jwt-simple';
import { noEnvVar } from './errors';

export async function sendCode(event: SendCodeEvent): Promise<string> {
  const { phone } = event;
  const { TWILIO_AUTH_TOKEN, TWILIO_ACCOUNT_SID, TWILIO_VERIFY_SID } = process.env;
  const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

  const verification = await client.verify.v2
    .services(TWILIO_VERIFY_SID as string)
    .verifications.create({ to: phone, channel: 'sms' });

  return verification.status;
}

export async function verifyCode(event: VerifyCodeEvent): Promise<string> {
  const { phone, code } = event;
  const { TWILIO_AUTH_TOKEN, TWILIO_ACCOUNT_SID, TWILIO_VERIFY_SID } = process.env;
  const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

  const verificationCheck = await client.verify.v2
    .services(TWILIO_VERIFY_SID as string)
    .verificationChecks.create({ to: phone, code });

  return verificationCheck.status;
}

export function getHash(str: string): string {
  let hash = 0;

  if (str.length === 0) {
    return hash.toString();
  }

  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }

  return hash.toString();
}

export function getToken(userId: number): string {
  const { JWT_SECRET } = process.env;
  if (!JWT_SECRET) {
    throw new Error(noEnvVar('JWT_SECRET'));
  }

  const payload: TokenData = {
    userId,
    createdAt: Date.now(),
  };

  return jwt.encode(payload, JWT_SECRET);
}

export function getAdminToken(adminId: number): string {
  const { ADMIN_JWT_SECRET } = process.env;
  if (!ADMIN_JWT_SECRET) {
    throw new Error(noEnvVar('ADMIN_JWT_SECRET'));
  }

  const payload: AdminTokenData = {
    adminId,
    createdAt: Date.now(),
  };

  return jwt.encode(payload, ADMIN_JWT_SECRET);
}

export function getUserId(token: string): number | null {
  const { JWT_SECRET } = process.env;
  if (!JWT_SECRET) {
    throw new Error(noEnvVar('JWT_SECRET'));
  }

  let payload: TokenData;
  try {
    payload = jwt.decode(token, JWT_SECRET) as TokenData;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return null;
  }

  return isTokenExpired(payload.createdAt)
    ? null
    : payload.userId;
}

export function getAdminId(token: string): number | null {
  const { ADMIN_JWT_SECRET } = process.env;
  if (!ADMIN_JWT_SECRET) {
    throw new Error(noEnvVar('ADMIN_JWT_SECRET'));
  }

  let payload: AdminTokenData;
  try {
    payload = jwt.decode(token, ADMIN_JWT_SECRET) as AdminTokenData;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return null;
  }

  return isTokenExpired(payload.createdAt)
    ? null
    : payload.adminId;
}

function isTokenExpired(createdAt: number): boolean {
  const { JWT_EXPIRE_DAYS } = process.env;
  if (!JWT_EXPIRE_DAYS) {
    throw new Error(noEnvVar('JWT_EXPIRE_DAYS'));
  }

  const millisecondsPassed = Date.now() - createdAt;
  const jwtExpireMilliseconds = Number(JWT_EXPIRE_DAYS) * 1000 * 60 * 60 * 24;

  return millisecondsPassed >= jwtExpireMilliseconds;
}
