const { sendCode } = require('./auth/auth');

module.exports = {
  handler,
};

async function handler(event) {
  const { phone } = event;

  return await sendCode(phone);
};
