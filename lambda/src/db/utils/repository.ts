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
  let error: string | null = null;

  try {
    data = await func();
  } catch (e: any) {
    error = e.message;
  }

  return {
    error,
    data,
  };
}
