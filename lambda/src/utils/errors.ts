export function required(fieldName: string): string {
  return `${fieldName}: Required`;
}

export const confirmMismatchMessage = 'Does not match with confirm value';

export function confirmMismatch(fieldName: string): string {
  return `${fieldName}: ${confirmMismatchMessage}`;
}

export function invalidInput(fieldName: string): string {
  return `${fieldName}: Invalid input`;
}

export function stringNotNumber(fieldName: string): string {
  return `${fieldName}: Expected string, received number`;
}

export function stringButNull(fieldName: string): string {
  return `${fieldName}: Expected string, received null`;
}

export function stringButBoolean(fieldName: string): string {
  return `${fieldName}: Expected string, received boolean`;
}

export function userNotFound(): string {
  return 'user not found';
}

export function invalidEmail(fieldName: string): string {
  return `${fieldName}: Invalid email`;
}

export function userExists(phone: string): string {
  return `user with phone = ${phone} already exists`;
}

export function emailExists(email: string): string {
  return `user with email = ${email} already exists`;
}

export function sendCodeStatus(status: string): string {
  return `send code status is ${status}`;
}

export function verifyCodeStatus(status: string): string {
  return `verify code status is ${status}`;
}

export function phoneNotVerified(phone: string): string {
  return `phone ${phone} is not verified`;
}
