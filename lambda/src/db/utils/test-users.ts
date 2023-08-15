import { getHash } from '../../utils/auth';
import User from '../models/user';

export const userPasswords: { [phone: string]: string } = {
  '+375333333333': 'test_password_1',
};

const registeredUsers: User[] = Object.keys(userPasswords).map((phone: string, index: number) => {
  const password = userPasswords[phone];

  return {
    phone,
    firstName: `test_name_${index}`,
    lastName: `test_last_name_${index}`,
    email: `test_email_${index}@mail.ru`,
    password: getHash(password),
    verified: true,
  } as User;
});

export const testUsers: User[] = registeredUsers.concat([
  {
    phone: '+375333333334',
    verified: false,
  } as User,
  {
    phone: '+375333333335',
    verified: true,
  } as User,
]);

export const verifiedUser = testUsers.find((user: User) => !user.password && user.verified) as User;
export const notVerifiedUser = testUsers.find((user: User) => !user.password && !user.verified) as User;
export const registeredUser = registeredUsers[0];
