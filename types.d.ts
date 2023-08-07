// ************** Lambda ****************

type SendCodeEvent = {
  phone: string,
}

type VerifyCodeEvent = {
  phone: string,
  code: string,
}

type SignUpEvent = {
  phone: string,
  firstName: string,
  lastName: string,
  email: string,
  confirmEmail: string,
  password: string,
  confirmPassword: string,
}

type EventResult<T> = {
  success: boolean,
  errors?: string[],
  data?: T,
}

// ************** DB ****************

type DBConfig = {
  username: string,
  password: string,
  database: string,
  host: string,
  dialect: string,
  seederStorage: string,
}

type DBModel<T> = {
  findAll: () => T[],
  create: (model: any) => T,
}

type DBModels = {
  SportObject: DBModel<SportObjectDM>,
  User: DBModel<UserDM>
}

type ExecutionResult<T> = {
  error: string | null,
  data: T | null,
}

type SportObjectDM = {
  id: number,
  name: string,
  address: string,
  lat: number,
  long: number,
  createdAt: string,
}

type SportObjectVM = {
  id: number,
  name: string,
  address: string,
  lat: number,
  long: number,
}

type UserDM = {
  id: number,
  phone: string,
  verified: boolean,
  email?: string,
  firstName?: string,
  lastName?: string,
  password?: string,
  createdAt: string,
}
