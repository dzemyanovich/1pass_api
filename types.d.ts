// ************** Lambda ****************

type SendCodeEvent = {
  phone: string,
}

type VerifyCodeEvent = {
  phone: string,
  code: string,
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
}

type DBModels = {
  SportObject: DBModel<SportObjectDM>,
  User: DBModel<UserDM>
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
  username: string,
  email: string,
  telnumber: string,
  password: string,
  firstName: string,
  lastName: string,
  createdAt: string,
}
