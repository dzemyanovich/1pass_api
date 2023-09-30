# Envs

| Env      | API URL (User API + Admin API)                                               |
| -------- | -----------------------------------------------------------------------------|
| dev      | https://uu3xj2zdx6.execute-api.eu-central-1.amazonaws.com/dev1               |
| preprod  | https://60qhz6s8f9.execute-api.eu-central-1.amazonaws.com/preprod1           |
| prod     | https://6nb2sgfcrl.execute-api.eu-central-1.amazonaws.com/prod1              |

| Env      | Admin Portal UI URL                                                          |
| -------- | ---------------------------------------------------------------------------- |
| dev      | http://admin.multipass.app.dev1.s3-website.eu-central-1.amazonaws.com/       |
| preprod  | http://admin.multipass.app.preprod1.s3-website.eu-central-1.amazonaws.com/   |
| prod     | http://admin.multipass.app.prod1.s3-website.eu-central-1.amazonaws.com/      |

# Deployment

| Env      | Branch      | Deployment type                                                   |
| -------- | ----------- | ----------------------------------------------------------------- |
| dev      | develop     | Manual via running `yarn tg-apply` from local machine             |
| preprod  | develop     | Automatic via GitLab CI/CD (just push commit to `develop` branch) |
| prod     | master      | Automatic GitLab CI/CD  (just push commit to `master` branch)     |

# Merging

Via **rebase**, e.g. merging to `master` branch (commands should be executed one by one):

| Command                | Description                                     |
| ---------------------- | ----------------------------------------------- |
| `git checkout develop` | Go to `develop` branch                          |
| `git fetch`            | Get latest changes                              |
| `git rebase`           | Apply latest changes locally                    |
| `git checkout master`  | Go to `master` branch                           |
| `git fetch`            | Get latest changes                              |
| `git rebase`           | Apply latest changes locally                    |
| `git rebase develop`   | Apply changes from `develop` branch to `master` |
| `git push`             | Push changes                                    |

# Tech stack

AWS Lambda, AWS API Gateway, AWS RDS (MySQL), AWS EventBridge, Node.js, TypeScript, Eslint, Jest, Sequelize (ORM), MySQL, Terraform, Terragrunt, GitLab CI/CD

# Scripts description

| Script                           | Description                                                          |
| -------------------------------- | -------------------------------------------------------------------- | 
| `yarn tg-validate`               | Validate local terragrunt config for dev env                         |
| `yarn tg-plan`                   | Build application & plan local terragrunt config for dev env         |
| `yarn tg-apply`                  | Build application & apply local terragrunt config for dev env        |
| `yarn tg-destroy`                | Destroy dev env                                                      |

# Prerequisites
- Node.js 16.20.1
- Terragrunt 0.48.1 (Terraform 1.5.2 is used under the hood). Use `brew` to install
> Terraform / Terragrunt usage is restricted in Belarus. In order to run commands locally from Belarus location, you need to be connected to Europe / USA VPN (sometimes you need to switch between different VPN countries several times). Othewise, you'll see the following error:
```
Error: Invalid provider registry host
The host "registry.terraform.io" given in provider source address "registry.terraform.io/hashicorp/aws" does not offer a Terraform provider registry.
```

# GitLab CI/CD setup
Before running pipeline set the following env vars (variables should be **not protected**):

| Env var                                       | Value                                   | Description                                                 |
| --------------------------------------------- | --------------------------------------- | ----------------------------------------------------------- |
| AWS_ACCESS_KEY_ID                             | "some_value"                            |                                                             |
| AWS_SECRET_ACCESS_KEY                         | "some_value"                            |                                                             |
| TF_VAR_db_username                            | $PREPROD_DB_USERNAME                    | Used while creating aws_db_instance via terraform           |
| TF_VAR_db_password                            | $PREPROD_DB_PASSWORD                    | Used while creating aws_db_instance via terraform           |
| PREPROD_DB_USERNAME                           | "some_value"                            | Used while creating database in Gitlab CI                   |
| PREPROD_DB_PASSWORD                           | "some_value"                            | Used while creating database in Gitlab CI                   |
| PREPROD_DB_NAME                               | "some_value"                            | Used while creating database in Gitlab CI                   |
| PREPROD_DB_HOST                               | "some_value"                            | Used while creating database in Gitlab CI                   |
| TF_VAR_PREPROD_DB_USERNAME                    | $PREPROD_DB_USERNAME                    | Used in lambdas to access database                          |
| TF_VAR_PREPROD_DB_PASSWORD                    | $PREPROD_DB_PASSWORD                    | Used in lambdas to access database                          |
| TF_VAR_PREPROD_DB_NAME                        | $PREPROD_DB_NAME                        | Used in lambdas to access database                          |
| TF_VAR_PREPROD_DB_HOST                        | $PREPROD_DB_HOST                        | Used in lambdas to access database                          |
| PROD_DB_USERNAME                              | $PREPROD_DB_USERNAME                    | Used while creating database in Gitlab CI                   |
| PROD_DB_PASSWORD                              | $PREPROD_DB_PASSWORD                    | Used while creating database in Gitlab CI                   |
| PROD_DB_NAME                                  | $PREPROD_DB_NAME                        | Used while creating database in Gitlab CI                   |
| PROD_DB_HOST                                  | $PREPROD_DB_HOST                        | Used while creating database in Gitlab CI                   |
| TF_VAR_PROD_DB_USERNAME                       | $PREPROD_DB_USERNAME                    | Used in lambdas to access database                          |
| TF_VAR_PROD_DB_PASSWORD                       | $PREPROD_DB_PASSWORD                    | Used in lambdas to access database                          |
| TF_VAR_PROD_DB_NAME                           | $PREPROD_DB_NAME                        | Used in lambdas to access database                          |
| TF_VAR_PROD_DB_HOST                           | $PREPROD_DB_HOST                        | Used in lambdas to access database                          |
| TWILIO_AUTH_TOKEN                             | "some_value"                            | Required for Twilio                                         |
| TWILIO_ACCOUNT_SID                            | "some_value"                            | Required for Twilio                                         |
| TWILIO_VERIFY_SID                             | "some_value"                            | Required for Twilio                                         |
| JWT_SECRET                                    | "some_value"                            | Required for user token generation (used in tests)          |
| TF_VAR_JWT_SECRET                             | $JWT_SECRET                             | Required for user token generation (used in lambdas)        |
| ADMIN_JWT_SECRET                              | "some_value"                            | Required for amdin token generation (used in tests)         |
| TF_VAR_ADMIN_JWT_SECRET                       | $ADMIN_JWT_SECRET                       | Required for admin token generation (used in lambdas)       |
| FIREBASE_TYPE                                 | "some_value"                            | Required for Firebase (used in tests)                       |
| FIREBASE_PROJECT_ID                           | "some_value"                            | Required for Firebase (used in tests)                       |
| FIREBASE_PRIVATE_KEY_ID                       | "some_value"                            | Required for Firebase (used in tests)                       |
| FIREBASE_PRIVATE_KEY                          | "some_value"                            | Required for Firebase (used in tests)                       |
| FIREBASE_CLIENT_EMAIL                         | "some_value"                            | Required for Firebase (used in tests)                       |
| FIREBASE_CLIENT_ID                            | "some_value"                            | Required for Firebase (used in tests)                       |
| FIREBASE_AUTH_URI                             | "some_value"                            | Required for Firebase (used in tests)                       |
| FIREBASE_TOKEN_URI                            | "some_value"                            | Required for Firebase (used in tests)                       |
| FIREBASE_AUTH_PROVIDER_X509_CERT_URL          | "some_value"                            | Required for Firebase (used in tests)                       |
| FIREBASE_CLIENT_X509_CERT_URL                  | "some_value"                            | Required for Firebase (used in tests)                       |
| FIREBASE_UNIVERSE_DOMAIN                      | "some_value"                            | Required for Firebase (used in tests)                       |
| TF_VAR_FIREBASE_TYPE                          | $FIREBASE_TYPE                          | Required for Firebase (used in lambdas)                     |
| TF_VAR_FIREBASE_PROJECT_ID                    | $FIREBASE_PROJECT_ID                    | Required for Firebase (used in lambdas)                     |
| TF_VAR_FIREBASE_PRIVATE_KEY_ID                | $FIREBASE_PRIVATE_KEY_ID                | Required for Firebase (used in lambdas)                     |
| TF_VAR_FIREBASE_PRIVATE_KEY                   | $FIREBASE_PRIVATE_KEY                   | Required for Firebase (used in lambdas)                     |
| TF_VAR_FIREBASE_CLIENT_EMAIL                  | $FIREBASE_CLIENT_EMAIL                  | Required for Firebase (used in lambdas)                     |
| TF_VAR_FIREBASE_CLIENT_ID                     | $FIREBASE_CLIENT_ID                     | Required for Firebase (used in lambdas)                     |
| TF_VAR_FIREBASE_AUTH_URI                      | $FIREBASE_AUTH_URI                      | Required for Firebase (used in lambdas)                     |
| TF_VAR_FIREBASE_TOKEN_URI                     | $FIREBASE_TOKEN_URI                     | Required for Firebase (used in lambdas)                     |
| TF_VAR_FIREBASE_AUTH_PROVIDER_X509_CERT_URL   | $FIREBASE_AUTH_PROVIDER_X509_CERT_URL   | Required for Firebase (used in lambdas)                     |
| TF_VAR_FIREBASE_CLIENT_X509_CERT_URL           | $FIREBASE_CLIENT_X509_CERT_URL           | Required for Firebase (used in lambdas)                     |
| TF_VAR_FIREBASE_UNIVERSE_DOMAIN               | $FIREBASE_UNIVERSE_DOMAIN               | Required for Firebase (used in lambdas)                     |

> `TF_VAR_db_username` and `TF_VAR_db_password` are the same for all envs

# AWS setup
In order to set up AWS infrastucture **locally**:
- create `terragrunt/modules/db/terraform.tfvars`:
```
db_username = "some_value"
db_password = "some_value"
```
- create `terragrunt/modules/lambda/terraform.tfvars`:
```
TWILIO_AUTH_TOKEN  = "some_value"
TWILIO_ACCOUNT_SID = "some_value"
TWILIO_VERIFY_SID  = "some_value"
JWT_SECRET         = "some_value"
ADMIN_JWT_SECRET   = "some_value"

FIREBASE_TYPE                        = "some_value"
FIREBASE_PROJECT_ID                  = "some_value"
FIREBASE_PRIVATE_KEY_ID              = "some_value"
FIREBASE_PRIVATE_KEY                 = "some_value"
FIREBASE_CLIENT_EMAIL                = "some_value"
FIREBASE_CLIENT_ID                   = "some_value"
FIREBASE_AUTH_URI                    = "some_value"
FIREBASE_TOKEN_URI                   = "some_value"
FIREBASE_AUTH_PROVIDER_X509_CERT_URL = "some_value"
FIREBASE_CLIENT_X509_CERT_URL         = "some_value"
FIREBASE_UNIVERSE_DOMAIN             = "some_value"
```

# Local setup
In order to run mysql migrations locally and deploy dev env, create `lambda/src/db/config/env-vars.ts`:
```
process.env.DEV_DB_USERNAME = 'some_value';
process.env.DEV_DB_PASSWORD = 'some_value';
process.env.DEV_DB_HOST = 'some_value';
process.env.DEV_DB_NAME = 'some_value';
```

In order to run integration and e2e tests locally, create `jest/setup/setup.local.ts`:
```
process.env.TWILIO_AUTH_TOKEN = 'some_value';
process.env.TWILIO_ACCOUNT_SID = 'some_value';
process.env.TWILIO_VERIFY_SID = 'some_value';
process.env.JWT_SECRET = 'some_value';
process.env.ADMIN_JWT_SECRET = 'some_value';

process.env.FIREBASE_TYPE = 'some_value';
process.env.FIREBASE_PROJECT_ID = 'some_value';
process.env.FIREBASE_PRIVATE_KEY_ID = 'some_value';
process.env.FIREBASE_PRIVATE_KEY = 'some_value';
process.env.FIREBASE_CLIENT_EMAIL = 'some_value';
process.env.FIREBASE_CLIENT_ID = 'some_value';
process.env.FIREBASE_AUTH_URI = 'some_value';
process.env.FIREBASE_TOKEN_URI = 'some_value';
process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL = 'some_value';
process.env.FIREBASE_CLIENT_X509_CERT_URL = 'some_value';
process.env.FIREBASE_UNIVERSE_DOMAIN ='some_value';
```

To enable husky pre-push, run once: ```npx husky install```
