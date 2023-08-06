import * as dbModels from '../models';

const { SportObject, User } = dbModels as unknown as DBModels;

export async function getSportObjects(): Promise<SportObjectDM[]> {
  return await SportObject.findAll();
}

export async function createUser(event: VerifyCodeEvent): Promise<UserDM> {
  const { phone } = event;
  const { User } = dbModels as unknown as DBModels;

  return User.create({
    phone,
    verified: true,
  });
}
