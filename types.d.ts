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

type SportObjectVM = {
  id: number,
  name: string,
  address: string,
  lat: number,
  long: number,
};
