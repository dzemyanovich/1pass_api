import { verifyCode } from './auth/auth';

export async function handler(event) {
  const { phone, code } = event;

  return await verifyCode(phone, code);
};
