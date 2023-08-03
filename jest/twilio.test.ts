import { sendCode, verifyCode } from '../lambda/src/auth/auth';
import './twilio.setup';

describe('twilio', () => {
  it.only('send code', async () => {
    const phone = '+375333366883';

    const status = await sendCode(phone);
    expect(status).toBe('pending');
  });

  it('verify code', async () => {
    const phone = '+375333366883';
    const code = 'some_code';

    const status = await verifyCode(phone, code);
    expect(status).toBe('approved');
  });
});
