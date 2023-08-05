import { sendCode } from './auth/auth';

export async function handler(event: SendCodeEvent): Promise<string> {
  const { phone } = event;

  return await sendCode(phone);
};
