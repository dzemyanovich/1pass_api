import { confirmMismatch, invalidInput } from './errors';
import { getErrors, validateSendCode, validateSignUp, validateVerifyCode } from './validation';

describe('validateSendCode', () => {
  it('valid data', async () => {
    const result = validateSendCode({
      phone: '+375333366883',
    });

    expect(result.success).toBe(true);
  });

  it('phone is missing', async () => {
    const result = validateSendCode({} as VerifyCodeEvent);

    expect(result.success).toBe(false);
  });

  it('invalid phone (short string)', async () => {
    const result = validateSendCode({
      phone: '543',
    });

    expect(result.success).toBe(false);
  });

  it('invalid phone (number instead of string)', async () => {
    const result = validateSendCode({
      phone: 142 as unknown as string,
    });

    expect(result.success).toBe(false);
  });
});

describe('validateVerifyCode', () => {
  it('valid data', async () => {
    const result = validateVerifyCode({
      phone: '+375333366883',
      code: 'some_code',
    });

    expect(result.success).toBe(true);
  });

  it('phone is missing', async () => {
    const result = validateVerifyCode({
      code: 'some_code',
    } as VerifyCodeEvent);

    expect(result.success).toBe(false);
  });

  it('code is missing', async () => {
    const result = validateVerifyCode({
      phone: '+375333366883',
    } as VerifyCodeEvent);

    expect(result.success).toBe(false);
  });

  it('phone and code are missing', async () => {
    const result = validateVerifyCode({} as VerifyCodeEvent);

    expect(result.success).toBe(false);
  });

  it('invalid phone and code', async () => {
    const result = validateVerifyCode({
      phone: 'string',
      code: null as unknown as string,
    });

    expect(result.success).toBe(false);
  });
});

describe('validateSignUp', () => {
  it('password and email do not match', async () => {
    const result = validateSignUp({
      phone: '+375333366889a',
      firstName: 'John',
      lastName: 'Smith',
      email: 'smth@mail.ru',
      confirmEmail: 'smth_2@mail.ru',
      password: 'password',
      confirmPassword: 'password_2',
    });

    const errors = getErrors(result);

    expect(result.success).toBe(false);
    expect(errors).toContain(invalidInput('phone'));
    expect(errors).toContain(confirmMismatch('email'));
    expect(errors).toContain(confirmMismatch('password'));
  });
});
