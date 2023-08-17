import { z, SafeParseReturnType, ZodIssue } from 'zod';
import validator from 'validator';

import { confirmMismatchMessage } from './errors';

/*********************** SHARED ***********************/

export function getErrors<T>(parseResult: SafeParseReturnType<T, T>): string[] {
  const { issues } = (parseResult as Zod.SafeParseError<T>).error;

  const errors: string[] = [];

  issues.forEach((issue: ZodIssue) => {
    issue.path.forEach((path: string | number) => {
      errors.push(`${path}: ${issue.message}`);
    });
  });

  return errors;
}

export function validateTokenEvent(
  event: TokenEvent,
): SafeParseReturnType<TokenEvent, TokenEvent> {
  const schema = z.object({
    token: z.string(),
  });

  return schema.safeParse(event);
}

/*********************** USER API ***********************/

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
        path: ['email'],
        message: confirmMismatchMessage,
      });
    }
  }).superRefine(({ password, confirmPassword }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: confirmMismatchMessage,
      });
    }
  });

  return schema.safeParse(event);
}

export function validateSignIn(event: SignInEvent): SafeParseReturnType<SignInEvent, SignInEvent> {
  const schema = z.object({
    phone: z.string().refine(validator.isMobilePhone),
    password: z.string(),
  });

  return schema.safeParse(event);
}

export function validateCreateBooking(
  event: CreateBookingEvent,
): SafeParseReturnType<CreateBookingEvent, CreateBookingEvent> {
  const schema = z.object({
    token: z.string(),
    sportObjectId: z.number(),
  });

  return schema.safeParse(event);
}

export function validateCancelBooking(
  event: CancelBookingEvent,
): SafeParseReturnType<CancelBookingEvent, CancelBookingEvent> {
  const schema = z.object({
    token: z.string(),
    bookingId: z.number(),
  });

  return schema.safeParse(event);
}

/*********************** ADMIN API ***********************/

export function validateConfirmVisit(
  event: ConfirmVisitEvent,
): SafeParseReturnType<ConfirmVisitEvent, ConfirmVisitEvent> {
  const schema = z.object({
    token: z.string(),
    bookingId: z.number(),
  });

  return schema.safeParse(event);
}

export function validateAdminSignIn(event: AdminSignInEvent): SafeParseReturnType<AdminSignInEvent, AdminSignInEvent> {
  const schema = z.object({
    username: z.string(),
    password: z.string(),
  });

  return schema.safeParse(event);
}
