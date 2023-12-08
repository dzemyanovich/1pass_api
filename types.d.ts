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

type SendNotificationsRequest = {
  userId: number,
  bookingId: number,
  visitTime: Date,
  title: string,
  body: string,
};

type DeleteTokenRequest = {
  userId: number,
  firebaseToken: string,
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
  firebaseToken: string,
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
  firebaseToken: string,
};

type SignUpResponse = LambdaResponse<{
  token: string,
  userInfo: UserInfo,
}>;

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

type SignOutRequest = {
  firebaseToken: string,
  userToken: string,
};

type RegisterFirebaseRequest = {
  tokenData: TokenData,
  firebaseToken: string,
};

type EmptyResponse = LambdaResponse<void>;

type FirebaseTokenValue = {
  token: string,
  createdAt: number,
};

type FirebaseTokenData = {
  data: FirebaseTokenValue[],
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
  images: string[],
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

// ************** Other ****************

type ProcessEnv = {
  DEV_DB_USERNAME: string,
  DEV_DB_PASSWORD: string,
  DEV_DB_HOST: string,
  DEV_DB_NAME: string,

  TWILIO_AUTH_TOKEN: string,
  TWILIO_ACCOUNT_SID: string,
  TWILIO_VERIFY_SID: string,
  JWT_SECRET: string,
  ADMIN_JWT_SECRET: string,

  FIREBASE_COLLECTION_NAME: string,
  FIREBASE_TYPE: string,
  FIREBASE_PROJECT_ID: string,
  FIREBASE_PRIVATE_KEY_ID: string,
  FIREBASE_PRIVATE_KEY: string,
  FIREBASE_CLIENT_EMAIL: string,
  FIREBASE_CLIENT_ID: string,
  FIREBASE_AUTH_URI: string,
  FIREBASE_TOKEN_URI: string,
  FIREBASE_AUTH_PROVIDER_X509_CERT_URL: string,
  FIREBASE_CLIENT_X509_CERT_URL: string,
  FIREBASE_UNIVERSE_DOMAIN: string,
};
