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
