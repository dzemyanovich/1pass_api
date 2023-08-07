export async function sendCode(event: SendCodeEvent): Promise<ExecutionResult<string>> {
  const { phone } = event;
  const { TWILIO_AUTH_TOKEN, TWILIO_ACCOUNT_SID, TWILIO_VERIFY_SID } = process.env;
  const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

  let errorMessage: string | null = null;

  const verification = await client.verify.v2
    .services(TWILIO_VERIFY_SID)
    .verifications.create({ to: phone, channel: 'sms' })
    .catch((e: Error) => errorMessage = e.message);

  if (errorMessage) {
    return {
      error: errorMessage,
      data: null,
    };
  }

  const { status } = verification;

  if (status !== 'pending') {
    return {
      error: `send code status is ${status}`,
      data: null,
    };
  }

  return {
    error: null,
    data: status,
  };
};

export async function verifyCode(event: VerifyCodeEvent): Promise<ExecutionResult<string>> {
  const { phone, code } = event;
  const { TWILIO_AUTH_TOKEN, TWILIO_ACCOUNT_SID, TWILIO_VERIFY_SID } = process.env;

  const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  let errorMessage: string | null = null;

  const verificationCheck = await client.verify.v2
    .services(TWILIO_VERIFY_SID)
    .verificationChecks.create({ to: phone, code })
    .catch((e: Error) => errorMessage = e.message);;

  if (errorMessage) {
    return {
      error: errorMessage,
      data: null,
    };
  }

  const { status } = verificationCheck;

  if (status !== 'approved') {
    return {
      error: `verify code status is ${status}`,
      data: null,
    };
  }

  return {
    error: null,
    data: status,
  };
};

export async function signUp(event: SignUpEvent): Promise<boolean> {
  throw new Error('not implemented');
}
