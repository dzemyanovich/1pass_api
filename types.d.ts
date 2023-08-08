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

// todo: default sequelize types library should be used
type DBModel<T> = {
  findAll: () => T[],
  create: (model: any) => T,
  findOne: (where: any) => T,
  update: (what: any, where: any) => T,
}

type DBModels = {
  SportObject: DBModel<SportObjectDM>,
  User: DBModel<UserDM>,
}

type ExecutionResult<T> = {
  errors: string[],
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
