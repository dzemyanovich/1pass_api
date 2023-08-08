import * as dbModels from '../models';

const { SportObject, User } = dbModels as unknown as DBModels;

export async function setVerifed(phone: string, verified: boolean): Promise<UserDM> {
  return User.update({ verified }, {
    where: {
      phone,
    }
  });
}

export async function getUser(phone: string): Promise<UserDM> {
  return User.findOne({ where: { phone, } });
}

export async function getSportObjects(): Promise<SportObjectDM[]> {
  return SportObject.findAll();
}

export async function createUser(event: VerifyCodeEvent): Promise<UserDM> {
  const { phone } = event;

  return User.create({
    phone,
    verified: true,
  });
}
