import { getHash } from '../../utils/auth';

export const testUsers: UserDM[] = [
  {
    phone: '+375333333333',
    firstName: 'test_name_1',
    lastName: 'test_last_name_1',
    email: 'test_email_1@mail.ru',
    password: getHash('test_password_1').toString(),
    verified: true,
  } as UserDM,
  {
    phone: '+375333333334',
    verified: false,
  } as UserDM,
  {
    phone: '+375333333335',
    verified: true,
  } as UserDM,
];

export const verifiedUser = testUsers.find((user: UserDM) => !user.password && user.verified) as UserDM;
export const notVerifiedUser = testUsers.find((user: UserDM) => !user.password && !user.verified) as UserDM;
export const registeredUser = testUsers.find((user: UserDM) => user.password) as UserDM;
