import { SNS, STS } from 'aws-sdk';

import Booking from '../db/models/booking';
import { confirmVisit, getAdminById, getBookingById, getFullBooking } from '../db/utils/repository';
import { getAdminId } from '../utils/auth';
import { invalidToken, noBooking, noBookingAccess, pastBooking, updateError } from '../utils/errors';
import { isPastBooking } from '../utils/utils';
import { getErrors, validateConfirmVisit } from '../utils/validation';

export async function handler(event: ConfirmVisitRequest): Promise<ConfirmVisitResponse> {
  const validationResult = validateConfirmVisit(event);
  if (!validationResult.success) {
    return {
      success: false,
      errors: getErrors(validationResult),
    };
  }

  const { bookingId, token } = event;
  const adminId = getAdminId(token);
  if (!adminId) {
    return {
      success: false,
      errors: [invalidToken()],
    };
  }

  const booking = await getFullBooking(bookingId);
  if (!booking) {
    return {
      success: false,
      errors: [noBooking()],
    };
  }

  const admin = await getAdminById(adminId);
  if (admin.sportObjectId !== booking.sportObjectId) {
    return {
      success: false,
      errors: [noBookingAccess()],
    };
  }

  if (isPastBooking(booking)) {
    return {
      success: false,
      errors: [pastBooking()],
    };
  }

  const affectedRows = await confirmVisit(bookingId);
  if (affectedRows.length !== 1 || affectedRows[0] !== 1) {
    return {
      success: false,
      errors: [updateError()],
    };
  }

  const { visitTime, userId } = await getBookingById(bookingId) as Booking;

  const sts = new STS();
  const { Account: awsAccountId } = await sts.getCallerIdentity({}).promise();

  const sns = new SNS();
  const { PRODUCT, NODE_ENV, AWS_REGION } = process.env;
  const snsTopicArn = `arn:aws:sns:${AWS_REGION}:${awsAccountId}:${PRODUCT}-${NODE_ENV}-send-notifications`;
  const params = {
    Message: JSON.stringify({
      userId,
      bookingId,
      visitTime,
      title: 'Visit confirmed',
      body: `Congrats! Visit to ${booking.sportObject.name} confirmed`,
    }),
    TopicArn: snsTopicArn,
  };
  await sns.publish(params).promise();

  return {
    success: true,
    data: visitTime,
  };
}
