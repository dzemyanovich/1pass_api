import { z, SafeParseReturnType, ZodIssue } from 'zod';
import validator from 'validator';

export function validateSendCode(event: SendCodeEvent): SafeParseReturnType<SendCodeEvent, SendCodeEvent> {
  const schema = z.object({
    phone: z.string().refine(validator.isMobilePhone),
  });

  return schema.safeParse(event);
}

export function validateVerifyCode(event: VerifyCodeEvent): SafeParseReturnType<VerifyCodeEvent, VerifyCodeEvent> {
  const schema = z.object({
    phone: z.string().refine(validator.isMobilePhone),
    code: z.string(),
  });

  return schema.safeParse(event);
}

export function validateSignUp(event: SignUpEvent): SafeParseReturnType<SignUpEvent, SignUpEvent> {
  const schema = z.object({
    phone: z.string().refine(validator.isMobilePhone),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    confirmEmail: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  }).superRefine(({ email, confirmEmail }, ctx) => {
    if (email !== confirmEmail) {
      ctx.addIssue({
        code: 'custom',
        message: 'The emails did not match',
      });
    }
  }).superRefine(({ password, confirmPassword }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'The passwords did not match',
      });
    }
  });

  return schema.safeParse(event);
}

export function getErrors<T>(parseResult: SafeParseReturnType<T, T>): string[] {
  const issues: ZodIssue[] = (parseResult as Zod.SafeParseError<T>).error.issues;

  const errors: string[] = [];

  issues.forEach((issue: ZodIssue) => {
    issue.path.forEach((path: string | number) => {
      errors.push(`${path}: ${issue.message}`);
    });
  });

  return errors;
}
