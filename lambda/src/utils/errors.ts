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

export function stringButNumber(fieldName: string): string {
  return `${fieldName}: Expected string, received number`;
}

export function stringButNull(fieldName: string): string {
  return `${fieldName}: Expected string, received null`;
}

export function stringButBoolean(fieldName: string): string {
  return `${fieldName}: Expected string, received boolean`;
}

export function numberButString(fieldName: string): string {
  return `${fieldName}: Expected number, received string`;
}

export function numberButBoolean(fieldName: string): string {
  return `${fieldName}: Expected number, received boolean`;
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

export function noEnvVar(envVarName: string): string {
  return `process.env.${envVarName} is not set`;
}

export function invalidToken(): string {
  return 'Invalid token';
}

export function noSportObject(): string {
  return 'Sport object does not exist';
}

export function alreadyBooked(): string {
  return 'Sport object is already booked';
}

export function noBooking(): string {
  return 'No booking found';
}

export function pastBooking(): string {
  return 'Booking is in the past or has already been used';
}

export function noBookingAccess(): string {
  return 'Not enough permissions to edit this booking';
}

export function nonEmpty(fieldName: string): string {
  return `${fieldName}: String must contain at least 1 character(s)`;
}
