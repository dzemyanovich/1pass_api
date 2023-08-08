import { sendCode, verifyCode } from '../lambda/src/utils/auth';
import { handler as authSendCode } from '../lambda/src/auth-send-code';
import { handler as authVerifyCode } from '../lambda/src/auth-verify-code';
import './lambda.setup';
import '../types.d.ts';

describe.skip('twilio', () => {
  it.only('send code', async () => {
    const phone = '+375333366883';

    const result = await sendCode({ phone });
    expect(result).toBe('pending');
  });

  it('verify code', async () => {
    const phone = '+375333366883';
    const code = 'some_code';

    const result = await verifyCode({ phone, code });
    expect(result).toBe('approved');
  });
});

describe('lambdas', () => {
  it('auth send code', async () => {
    const phone = '+375333366883';

    const result = await authSendCode({ phone });
    expect(result.data).toBe(true);
  });

  it.only('auth verify code', async () => {
    const phone = '+375333366883';
    const code = '801197';

    const result = await authVerifyCode({ phone, code });
    expect(result.success).toBe(true);
  });
});
