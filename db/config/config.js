module.exports = {
  dev: {
    username: process.env.DEV_DB_USERNAME,
    password: process.env.DEV_DB_PASSWORD,
    database: process.env.DEV_DB_NAME,
    host: process.env.DEV_DB_HOST,
    dialect: 'mysql',
  },
  preprod: {
    username: process.env.PREPROD_DB_USERNAME,
    password: process.env.PREPROD_DB_PASSWORD,
    database: process.env.PREPROD_DB_NAME,
    host: process.env.PREPROD_DB_HOST,
    dialect: 'mysql',
  },
  prod: {
    username: process.env.PROD_DB_USERNAME,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    host: process.env.PROD_DB_HOST,
    dialect: 'mysql',
  },
}
