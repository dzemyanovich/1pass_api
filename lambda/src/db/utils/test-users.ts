import { getHash } from '../../utils/auth';
import User from '../models/user';

export const TEST_ADMIN_NAME_PREFIX = 'test_admin_';
export const TEST_ADMIN_PASSWORD = 'admin_password';
export const TEST_USER_EMAIL_PREFIX = 'test_email_';
export const E2E_USER_EMAIL_PREFIX = 'e2e_test_email_';
export const UI_USER_EMAIL_PREFIX = 'ui_test_email_';
export const TEST_USER_PASSWORD = 'user_password';

export function getTestAdminName(index: number): string {
  return `${TEST_ADMIN_NAME_PREFIX}${index}`;
}

const e2eUsers: User[] = [
  '+375333333330',
].map((phone: string, index: number) => ({
  phone,
  firstName: 'e2e_test_user_first_name',
  lastName: 'e2e_test_user_last_name',
  email: `${E2E_USER_EMAIL_PREFIX}${index}@mail.ru`,
  password: getHash(TEST_USER_PASSWORD),
  verified: true,
} as User));

export const e2eUser: User = e2eUsers[0];

const registeredUsers: User[] = [
  '+375333333331',
  '+375333333332',
  '+375333333333',
  '+375333333334',
  '+375333333335',
  '+375333333336',
  '+375333333337',
].map((phone: string, index: number) => ({
  phone,
  firstName: `test_first_name_${index}`,
  lastName: `test_last_name_${index}`,
  email: `${TEST_USER_EMAIL_PREFIX}${index}@mail.ru`,
  password: getHash(TEST_USER_PASSWORD),
  verified: true,
}) as User);

const uiTestUsers: User[] = [
  '+375333333340',
  '+375333333341',
  '+375333333342',
  '+375333333343',
  '+375333333344',
  '+375333333345',
  '+375333333346',
  '+375333333347',
  '+375333333348',
  '+375333333349',
].map((phone: string, index: number) => ({
  phone,
  firstName: `ui_test_first_name_${index}`,
  lastName: `ui_test_last_name_${index}`,
  email: `${UI_USER_EMAIL_PREFIX}${index}@mail.ru`,
  password: getHash(TEST_USER_PASSWORD),
  verified: true,
}) as User);

export const notVerifiedUser: User = {
  phone: '+375333333338',
  verified: false,
} as User;

export const verifiedUser: User = {
  phone: '+375333333339',
  verified: true,
} as User;

export const testUsers: User[] = [notVerifiedUser, verifiedUser]
  .concat(e2eUsers)
  .concat(uiTestUsers)
  .concat(registeredUsers);
