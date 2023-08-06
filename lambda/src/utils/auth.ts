export async function sendCode(event: SendCodeEvent): Promise<string> {
  const { phone } = event;
  const { TWILIO_AUTH_TOKEN, TWILIO_ACCOUNT_SID, TWILIO_VERIFY_SID } = process.env;
  const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

  const verification = await client.verify.v2
    .services(TWILIO_VERIFY_SID)
    .verifications.create({ to: phone, channel: 'sms' });

  return verification.status;
};

export async function verifyCode(event: VerifyCodeEvent): Promise<string> {
  const { phone, code } = event;
  const { TWILIO_AUTH_TOKEN, TWILIO_ACCOUNT_SID, TWILIO_VERIFY_SID } = process.env;
  const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

  const verificationCheck = await client.verify.v2
    .services(TWILIO_VERIFY_SID)
    .verificationChecks.create({ to: phone, code });

  return verificationCheck.status;
};

export async function signUp(event: SignUpEvent): Promise<boolean> {
  throw new Error('not implemented');
}
