import { verifyCode } from './auth/auth';

export async function handler(event: VerifyCodeEvent): Promise<string> {
  const { phone, code } = event;

  return await verifyCode(phone, code);
};
