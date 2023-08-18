import { getHash } from '../../utils/auth';
import User from '../models/user';
import { TEST_USER_PASSWORD, TEST_USER_PREFIX } from './utils';

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
  firstName: `test_name_${index}`,
  lastName: `test_last_name_${index}`,
  email: `${TEST_USER_PREFIX}${index}@mail.ru`,
  password: getHash(TEST_USER_PASSWORD),
  verified: true,
}) as User);

export const testUsers: User[] = registeredUsers.concat([
  {
    phone: '+375333333338',
    verified: false,
  } as User,
  {
    phone: '+375333333339',
    verified: true,
  } as User,
]);

export const verifiedUser = testUsers.find((user: User) => !user.password && user.verified) as User;
export const notVerifiedUser = testUsers.find((user: User) => !user.password && !user.verified) as User;
export const registeredUser = registeredUsers[0];
