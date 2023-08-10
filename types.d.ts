// ************** Lambda ****************

type SendCodeEvent = {
  phone: string,
};

type VerifyCodeEvent = {
  phone: string,
  code: string,
};

type SignInEvent = {
  phone: string,
  password: string,
};

type SignUpEvent = {
  phone: string,
  firstName: string,
  lastName: string,
  email: string,
  confirmEmail: string,
  password: string,
  confirmPassword: string,
};

type EventResult<T> = {
  success: boolean,
  errors?: string[],
  data?: T,
};

// ************** DB ****************

type DBConfig = {
  username: string,
  password: string,
  database: string,
  host: string,
  dialect: string,
  seederStorage: string,
};

// todo: default sequelize types library should be used
type DBModel<T> = {
  findAll: () => Promise<T[]>,
  create: (model: any) => Promise<T>,
  findOne: (where: any) => Promise<T>,
  update: (what: any, where: any) => Promise<void>,
  destroy: (where: any) => Promise<void>,
};

type DBModels = {
  SportObject: DBModel<SportObjectDM>,
  User: DBModel<UserDM>,
  sequelize: any,
};

type SportObjectDM = {
  id: number,
  name: string,
  address: string,
  lat: number,
  long: number,
  createdAt: string,
};

type SportObjectVM = {
  id: number,
  name: string,
  address: string,
  lat: number,
  long: number,
};

type UserDM = {
  id: number,
  phone: string,
  verified: boolean,
  email?: string,
  firstName?: string,
  lastName?: string,
  password?: string,
  createdAt: string,
};
