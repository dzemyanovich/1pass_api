import { getHash } from '../../utils/auth';
import * as dbModels from '../models';

const { SportObject, User } = dbModels as unknown as DBModels;

/************************* USER *************************/

export async function setVerifed(phone: string, verified: boolean): Promise<UserDM> {
  return User.update({ verified }, {
    where: {
      phone,
    },
  });
}

export async function getUserByPhone(phone: string): Promise<UserDM> {
  return User.findOne({ where: { phone } });
}

export async function getUserByEmail(email: string): Promise<UserDM> {
  return User.findOne({ where: { email } });
}

export async function createUser(phone: string): Promise<UserDM> {
  return User.create({
    phone,
    verified: false,
  });
}

export async function signIn(event: SignInEvent): Promise<UserDM> {
  const { phone, password } = event;

  return User.findOne({ where: { phone, password: getHash(password) } });
}

export async function signUp(event: SignUpEvent): Promise<UserDM> {
  const { phone, firstName, lastName, email, password } = event;
  return User.update({ firstName, lastName, email, password: getHash(password) }, {
    where: {
      phone,
    },
  });
}

export async function deleteUser(id: number): Promise<void> {
  return User.remove({
    id,
  });
}

/************************* SPORT OBJECT *************************/

export async function getSportObjects(): Promise<SportObjectDM[]> {
  return SportObject.findAll();
}
