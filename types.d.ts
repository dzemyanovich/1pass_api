// ************** SHARED ****************

type TokenRequest = {
  token: string,
};

type GetRequest<T> = {
  path: Map<string, string>
  querystring: T,
  header: Map<string, string>
};

type LambdaResponse<T> = {
  success: boolean,
  errors?: string[],
  data?: T,
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
  bookings: UserBooking[] | null,
  userInfo: UserInfo | null,
};

type UserDataResponse = LambdaResponse<UserData>;

type SendCodeRequest = {
  phone: string,
};

type SendCodeResponse = LambdaResponse<void>;

type VerifyCodeRequest = {
  phone: string,
  code: string,
};

type VerifyCodeResponse = LambdaResponse<void>;

type SignInRequest = {
  phone: string,
  password: string,
};

type SignInResponse = LambdaResponse<{
  token: string,
  bookings: UserBooking[],
  userInfo: UserInfo,
}>;

type SignUpRequest = {
  phone: string,
  firstName: string,
  lastName: string,
  email: string,
  confirmEmail: string,
  password: string,
  confirmPassword: string,
};

type SignUpResponse = LambdaResponse<string>;

type CreateBookingRequest = {
  token: string,
  sportObjectId: number,
};

type CreateBookingResponse = LambdaResponse<UserBooking>;

type CancelBookingRequest = {
  token: string,
  bookingId: number,
};

type CancelBookingResponse = LambdaResponse<void>;

type TokenData = {
  userId: number,
  createdAt: number,
};

// ************** ADMIN API ****************

type AdminData = {
  username: string,
  sportObject: SportObjectVM,
  bookings: AdminBooking[],
};

type AdminSignInRequest = {
  username: string,
  password: string,
};

type AdminSignInResponse = LambdaResponse<{
  token: string,
  adminData: AdminData,
}>;

type ConfirmVisitRequest = {
  token: string,
  bookingId: number,
};

type ConfirmVisitResponse = LambdaResponse<Date>;

type AdminDataResponse = LambdaResponse<AdminData>;

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

type UserVM = {
  id: string,
  phone: string,
  email: string,
  firstName: string,
  lastName: string,
};

type UserBooking = {
  id: number,
  sportObject: SportObjectVM,
  bookingTime: Date,
  visitTime: Date,
};

type AdminBooking = {
  id: number,
  user: UserVM,
  bookingTime: Date,
  visitTime: Date,
};
