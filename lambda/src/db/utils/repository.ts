import { getHash } from '../../utils/auth';
import * as dbModels from '../models';

const { SportObject, User } = dbModels as unknown as DBModels;

/************************* USER *************************/

export async function setVerifed(phone: string, verified: boolean): Promise<void> {
  // todo: update method returns just "[1]" however it should return values which was updated
  await User.update({ verified }, {
    where: {
      phone,
    },
  });
}

export async function getUserByPhone(phone: string): Promise<UserDM> {
  return await User.findOne({ where: { phone } });
}

export async function getUserByEmail(email: string): Promise<UserDM> {
  return await User.findOne({ where: { email } });
}

export async function createUser(phone: string): Promise<UserDM> {
  return await User.create({
    phone,
    verified: false,
  });
}

export async function signIn(event: SignInEvent): Promise<UserDM> {
  const { phone, password } = event;

  return await User.findOne({ where: { phone, password: getHash(password) } });
}

export async function signUp(event: SignUpEvent): Promise<void> {
  const { phone, firstName, lastName, email, password } = event;
  // todo: update method returns just "[1]" however it should return values which was updated
  await User.update({ firstName, lastName, email, password: getHash(password) }, {
    where: {
      phone,
    },
  });
}

export async function deleteUser(id: number): Promise<void> {
  return await User.destroy({
    where: {
      id,
    },
  });
}

export async function deleteUserByPhone(phone: string): Promise<void> {
  return await User.destroy({
    where: {
      phone,
    },
  });
}

/************************* SPORT OBJECT *************************/

export async function getSportObjects(): Promise<SportObjectDM[]> {
  return await SportObject.findAll();
}
