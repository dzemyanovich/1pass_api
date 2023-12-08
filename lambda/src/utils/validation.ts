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

export function validateTokenRequest(
  event: TokenRequest,
): SafeParseReturnType<TokenRequest, TokenRequest> {
  const schema = z.object({
    token: z.string().nonempty(),
  });

  return schema.safeParse(event);
}

/*********************** USER API ***********************/

export function validateSendCode(
  event: SendCodeRequest,
): SafeParseReturnType<SendCodeRequest, SendCodeRequest> {
  const schema = z.object({
    phone: z.string().nonempty().refine(validator.isMobilePhone),
  });

  return schema.safeParse(event);
}

export function validateVerifyCode(
  event: VerifyCodeRequest,
): SafeParseReturnType<VerifyCodeRequest, VerifyCodeRequest> {
  const schema = z.object({
    phone: z.string().nonempty().refine(validator.isMobilePhone),
    code: z.string().nonempty(),
  });

  return schema.safeParse(event);
}

export function validateSignUp(
  event: SignUpRequest,
): SafeParseReturnType<SignUpRequest, SignUpRequest> {
  const schema = z.object({
    phone: z.string().nonempty().refine(validator.isMobilePhone),
    firstName: z.string().nonempty(),
    lastName: z.string().nonempty(),
    email: z.string().nonempty().email(),
    confirmEmail: z.string().nonempty().email(),
    password: z.string().nonempty().min(6),
    confirmPassword: z.string().nonempty().min(6),
    firebaseToken: z.string().nonempty(),
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

export function validateSignIn(
  event: SignInRequest,
): SafeParseReturnType<SignInRequest, SignInRequest> {
  const schema = z.object({
    phone: z.string().nonempty().refine(validator.isMobilePhone),
    password: z.string().nonempty(),
    firebaseToken: z.string().nonempty(),
  });

  return schema.safeParse(event);
}

export function validateCreateBooking(
  event: CreateBookingRequest,
): SafeParseReturnType<CreateBookingRequest, CreateBookingRequest> {
  const schema = z.object({
    token: z.string().nonempty(),
    sportObjectId: z.number(),
  });

  return schema.safeParse(event);
}

export function validateCancelBooking(
  event: CancelBookingRequest,
): SafeParseReturnType<CancelBookingRequest, CancelBookingRequest> {
  const schema = z.object({
    token: z.string().nonempty(),
    bookingId: z.number(),
  });

  return schema.safeParse(event);
}

export function validateSignOutRequest(
  event: SignOutRequest,
): SafeParseReturnType<SignOutRequest, SignOutRequest> {
  const schema = z.object({
    firebaseToken: z.string().nonempty(),
    userToken: z.string().nonempty(),
  });

  return schema.safeParse(event);
}

/*********************** ADMIN API ***********************/

export function validateConfirmVisit(
  event: ConfirmVisitRequest,
): SafeParseReturnType<ConfirmVisitRequest, ConfirmVisitRequest> {
  const schema = z.object({
    token: z.string().nonempty(),
    bookingId: z.number(),
  });

  return schema.safeParse(event);
}

export function validateAdminSignIn(
  event: AdminSignInRequest,
): SafeParseReturnType<AdminSignInRequest, AdminSignInRequest> {
  const schema = z.object({
    username: z.string().nonempty(),
    password: z.string().nonempty(),
  });

  return schema.safeParse(event);
}
