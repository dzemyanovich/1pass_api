import twilio from 'twilio';
import jwt from 'jwt-simple';

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
  const payload: TokenData = {
    userId,
    createdAt: Date.now(),
  };

  return jwt.encode(payload, process.env.JWT_SECRET as string);
}

// returns user id if token is valid
export function validateToken(token: string): number | null {
  let payload: TokenData;
  try {
    payload = jwt.decode(token, process.env.JWT_SECRET as string) as TokenData;
  } catch (error) {
    console.error(error);
    return null;
  }

  const millisecondsPassed = Date.now() - payload.createdAt;
  const jwtExpireMilliseconds = Number(process.env.JWT_EXPIRE_DAYS) * 1000 * 60 * 60 * 24;

  return millisecondsPassed < jwtExpireMilliseconds
    ? payload.userId
    : null;
}
