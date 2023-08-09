import { getHash } from '../../utils/auth';

const testUsers: UserDM[] = [
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

export default testUsers;
