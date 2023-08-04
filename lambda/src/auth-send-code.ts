import { sendCode } from './auth/auth';

export async function handler(event) {
  const { phone } = event;

  return await sendCode(phone);
};
