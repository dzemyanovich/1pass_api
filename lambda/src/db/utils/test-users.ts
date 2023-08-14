import { getHash } from '../../utils/auth';
import User from '../models/user';

export const registeredUserPassword = 'test_password_1';

export const testUsers: User[] = [
  {
    phone: '+375333333333',
    firstName: 'test_name_1',
    lastName: 'test_last_name_1',
    email: 'test_email_1@mail.ru',
    password: getHash(registeredUserPassword),
    verified: true,
  } as User,
  {
    phone: '+375333333334',
    verified: false,
  } as User,
  {
    phone: '+375333333335',
    verified: true,
  } as User,
];

export const verifiedUser = testUsers.find((user: User) => !user.password && user.verified) as User;
export const notVerifiedUser = testUsers.find((user: User) => !user.password && !user.verified) as User;
export const registeredUser = testUsers.find((user: User) => user.password) as User;
