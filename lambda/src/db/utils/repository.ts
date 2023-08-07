import * as dbModels from '../models';

const { SportObject, User } = dbModels as unknown as DBModels;

export async function getSportObjects(): Promise<ExecutionResult<SportObjectDM[]>> {
  return executeTransaction(async () => SportObject.findAll());
}

export async function createUser(event: VerifyCodeEvent): Promise<ExecutionResult<UserDM>> {
  const { phone } = event;

  return executeTransaction(async () => User.create({
    phone,
    verified: true,
  }));
}

async function executeTransaction<T>(func: () => Promise<T>): Promise<ExecutionResult<T>> {
  let data: T | null = null;
  const errors: string[] = [];

  try {
    data = await func();
  } catch (e: any) {
    e.errors.forEach((error: any) => errors.push(error.message));
  }

  return {
    errors,
    data,
  };
}
