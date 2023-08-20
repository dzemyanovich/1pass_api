// ************** LAMBDA ****************

type EventResult<T> = {
  success: boolean,
  errors?: string[],
  data?: T,
};

type TokenEvent = {
  token: string,
};

type GetRequest<T> = {
  path: Map<string, string>
  querystring: T,
  header: Map<string, string>
};

// ************** USER API ****************

type UserInfo = {
  phone: string,
  email: string,
  firstName: string,
  lastName: string,
};

type UserData = {
  sportObjects: SportObjectVM[],
  bookings: BookingVM[] | null,
  userInfo: UserInfo | null,
};

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

type CreateBookingEvent = {
  token: string,
  sportObjectId: number,
};

type CancelBookingEvent = {
  token: string,
  bookingId: number,
};

type TokenData = {
  userId: number,
  createdAt: number,
};

// ************** ADMIN API ****************

type AdminSignInEvent = {
  username: string,
  password: string,
};

type ConfirmVisitEvent = {
  token: string,
  bookingId: number,
};

type AdminTokenData = {
  adminId: number,
  createdAt: number,
};

// ************** DB ****************

type SportObjectVM = {
  id: number,
  name: string,
  address: string,
  lat: number,
  long: number,
};

type BookingVM = {
  id: number,
  userId: number,
  sportObjectId: number,
  bookingTime: Date,
  visitTime: Date,
};
