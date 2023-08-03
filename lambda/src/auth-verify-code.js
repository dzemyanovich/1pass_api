const { verifyCode } = require('./auth/auth');

module.exports = {
  handler,
};

async function handler(event) {
  const { phone, code } = event;

  return await verifyCode(phone, code);
};
