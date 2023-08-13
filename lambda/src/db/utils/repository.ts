import { getHash } from '../../utils/auth';
import sequelize from '../models';
import User from '../models/user';
import SportObject from '../models/sport-object';

export async function closeConnection(): Promise<void> {
  await sequelize.close();
}

/************************* USER *************************/

export async function setVerifed(phone: string, verified: boolean): Promise<[affectedCount: number]> {
  return User.update({ verified }, {
    where: {
      phone,
    },
  });
}

export async function getUserByPhone(phone: string): Promise<User> {
  return User.findOne({ where: { phone } }) as Promise<User>;
}

export async function getUserByEmail(email: string): Promise<User> {
  return User.findOne({ where: { email } }) as Promise<User>;
}

export async function createUser(phone: string): Promise<User> {
  return User.create({
    phone,
    verified: false,
  });
}

export async function signIn(event: SignInEvent): Promise<User> {
  const { phone, password } = event;

  return User.findOne({ where: { phone, password: getHash(password) } }) as Promise<User>;
}

export async function signUp(event: SignUpEvent): Promise<[affectedCount: number]> {
  const { phone, firstName, lastName, email, password } = event;
  return User.update({ firstName, lastName, email, password: getHash(password) }, {
    where: {
      phone,
    },
  });
}

export async function deleteUser(id: number): Promise<number> {
  return User.destroy({
    where: {
      id,
    },
  });
}

export async function deleteUserByPhone(phone: string): Promise<number> {
  return User.destroy({
    where: {
      phone,
    },
  });
}

/************************* SPORT OBJECT *************************/

export async function getSportObjects(): Promise<SportObject[]> {
  return SportObject.findAll();
}
