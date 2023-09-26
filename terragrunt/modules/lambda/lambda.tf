locals {
  runtime = "nodejs18.x"
  get_request_mapping = "${file("templates/api_gateway_body_mapping.template")}"
  base_env_vars = {
    NODE_ENV            = var.env
    PREPROD_DB_USERNAME = var.PREPROD_DB_USERNAME
    PREPROD_DB_PASSWORD = var.PREPROD_DB_PASSWORD
    PREPROD_DB_NAME     = var.PREPROD_DB_NAME
    PREPROD_DB_HOST     = var.PREPROD_DB_HOST
    PROD_DB_USERNAME    = var.PROD_DB_USERNAME
    PROD_DB_PASSWORD    = var.PROD_DB_PASSWORD
    PROD_DB_NAME        = var.PROD_DB_NAME
    PROD_DB_HOST        = var.PROD_DB_HOST
  }
  auth_env_vars = merge(local.base_env_vars, {
    TWILIO_AUTH_TOKEN   = var.TWILIO_AUTH_TOKEN
    TWILIO_ACCOUNT_SID  = var.TWILIO_ACCOUNT_SID
    TWILIO_VERIFY_SID   = var.TWILIO_VERIFY_SID
  })
  jwt_env_vars = merge(local.base_env_vars, {
    JWT_SECRET       = var.JWT_SECRET
    ADMIN_JWT_SECRET = var.ADMIN_JWT_SECRET
    JWT_EXPIRE_DAYS  = var.JWT_EXPIRE_DAYS
  })
  firebase_env_vars = merge(local.jwt_env_vars, {
    FIREBASE_TYPE                        = var.FIREBASE_TYPE
    FIREBASE_PROJECT_ID                  = var.FIREBASE_PROJECT_ID
    FIREBASE_PRIVATE_KEY_ID              = var.FIREBASE_PRIVATE_KEY_ID
    FIREBASE_PRIVATE_KEY                 = var.FIREBASE_PRIVATE_KEY
    FIREBASE_CLIENT_EMAIL                = var.FIREBASE_CLIENT_EMAIL
    FIREBASE_CLIENT_ID                   = var.FIREBASE_CLIENT_ID
    FIREBASE_AUTH_URI                    = var.FIREBASE_AUTH_URI
    FIREBASE_TOKEN_URI                   = var.FIREBASE_TOKEN_URI
    FIREBASE_AUTH_PROVIDER_X509_CERT_URL = var.FIREBASE_AUTH_PROVIDER_X509_CERT_URL
    FIREBASE_LIENT_X509_CERT_URL         = var.FIREBASE_LIENT_X509_CERT_URL
    FIREBASE_UNIVERSE_DOMAIN             = var.FIREBASE_UNIVERSE_DOMAIN
  })
}

resource "aws_iam_role" "iam_for_lambda" {
  name = "${var.product}_${var.env}_iam_for_lambda"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "lambda_basic_access" {
  role       = aws_iam_role.iam_for_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "add_today_bookings_lambda" {
  filename          = data.archive_file.lambda_zip.output_path
  function_name     = "${var.product}-${var.env}-add-today-bookings"
  role              = aws_iam_role.iam_for_lambda.arn
  handler           = "dist/add-today-bookings.handler"
  source_code_hash  = data.archive_file.lambda_zip.output_base64sha256
  runtime           = local.runtime

  environment {
    variables = local.base_env_vars
  }
}

resource "aws_lambda_function" "delete_expired_tokens_lambda" {
  filename          = data.archive_file.lambda_zip.output_path
  function_name     = "${var.product}-${var.env}-delete-expired-tokens"
  role              = aws_iam_role.iam_for_lambda.arn
  handler           = "dist/delete-expired-tokens.handler"
  source_code_hash  = data.archive_file.lambda_zip.output_base64sha256
  runtime           = local.runtime
  timeout           = 100

  environment {
    variables = local.base_env_vars
  }
}

#################### USER API ####################

resource "aws_lambda_function" "get_user_data_lambda" {
  filename          = data.archive_file.lambda_zip.output_path
  function_name     = "${var.product}-${var.env}-get-user-data"
  role              = aws_iam_role.iam_for_lambda.arn
  handler           = "dist/user-api/get-user-data.handler"
  source_code_hash  = data.archive_file.lambda_zip.output_base64sha256
  runtime           = local.runtime

  environment {
    variables = local.jwt_env_vars
  }
}

resource "aws_lambda_function" "auth_send_code_lambda" {
  filename          = data.archive_file.lambda_zip.output_path
  function_name     = "${var.product}-${var.env}-auth-send-code"
  role              = aws_iam_role.iam_for_lambda.arn
  handler           = "dist/user-api/auth-send-code.handler"
  source_code_hash  = data.archive_file.lambda_zip.output_base64sha256
  runtime           = local.runtime
  timeout           = 10

  environment {
    variables = local.auth_env_vars
  }
}

resource "aws_lambda_function" "auth_verify_code_lambda" {
  filename          = data.archive_file.lambda_zip.output_path
  function_name     = "${var.product}-${var.env}-auth-verify-code"
  role              = aws_iam_role.iam_for_lambda.arn
  handler           = "dist/user-api/auth-verify-code.handler"
  source_code_hash  = data.archive_file.lambda_zip.output_base64sha256
  runtime           = local.runtime
  timeout           = 10

  environment {
    variables = local.auth_env_vars
  }
}

resource "aws_lambda_function" "sign_in_lambda" {
  filename          = data.archive_file.lambda_zip.output_path
  function_name     = "${var.product}-${var.env}-sign-in"
  role              = aws_iam_role.iam_for_lambda.arn
  handler           = "dist/user-api/sign-in.handler"
  source_code_hash  = data.archive_file.lambda_zip.output_base64sha256
  runtime           = local.runtime

  environment {
    variables = local.jwt_env_vars
  }
}

resource "aws_lambda_function" "sign_up_lambda" {
  filename          = data.archive_file.lambda_zip.output_path
  function_name     = "${var.product}-${var.env}-sign-up"
  role              = aws_iam_role.iam_for_lambda.arn
  handler           = "dist/user-api/sign-up.handler"
  source_code_hash  = data.archive_file.lambda_zip.output_base64sha256
  runtime           = local.runtime

  environment {
    variables = local.jwt_env_vars
  }
}

resource "aws_lambda_function" "create_booking_lambda" {
  filename          = data.archive_file.lambda_zip.output_path
  function_name     = "${var.product}-${var.env}-create-booking"
  role              = aws_iam_role.iam_for_lambda.arn
  handler           = "dist/user-api/create-booking.handler"
  source_code_hash  = data.archive_file.lambda_zip.output_base64sha256
  runtime           = local.runtime

  environment {
    variables = local.jwt_env_vars
  }
}

resource "aws_lambda_function" "cancel_booking_lambda" {
  filename          = data.archive_file.lambda_zip.output_path
  function_name     = "${var.product}-${var.env}-cancel-booking"
  role              = aws_iam_role.iam_for_lambda.arn
  handler           = "dist/user-api/cancel-booking.handler"
  source_code_hash  = data.archive_file.lambda_zip.output_base64sha256
  runtime           = local.runtime

  environment {
    variables = local.jwt_env_vars
  }
}

resource "aws_lambda_function" "register_firebase_token_lambda" {
  filename          = data.archive_file.lambda_zip.output_path
  function_name     = "${var.product}-${var.env}-register-firebase-token"
  role              = aws_iam_role.iam_for_lambda.arn
  handler           = "dist/user-api/register-firebase-token.handler"
  source_code_hash  = data.archive_file.lambda_zip.output_base64sha256
  runtime           = local.runtime

  environment {
    variables = local.firebase_env_vars
  }
}

resource "aws_lambda_function" "delete_firebase_token_lambda" {
  filename          = data.archive_file.lambda_zip.output_path
  function_name     = "${var.product}-${var.env}-delete-firebase-token"
  role              = aws_iam_role.iam_for_lambda.arn
  handler           = "dist/user-api/delete-firebase-token.handler"
  source_code_hash  = data.archive_file.lambda_zip.output_base64sha256
  runtime           = local.runtime

  environment {
    variables = local.firebase_env_vars
  }
}

#################### ADMIN API ####################

resource "aws_lambda_function" "get_admin_data_lambda" {
  filename          = data.archive_file.lambda_zip.output_path
  function_name     = "${var.product}-${var.env}-get-admin-data"
  role              = aws_iam_role.iam_for_lambda.arn
  handler           = "dist/admin-api/get-admin-data.handler"
  source_code_hash  = data.archive_file.lambda_zip.output_base64sha256
  runtime           = local.runtime

  environment {
    variables = local.jwt_env_vars
  }
}

resource "aws_lambda_function" "confirm_visit_lambda" {
  filename          = data.archive_file.lambda_zip.output_path
  function_name     = "${var.product}-${var.env}-confirm-visit"
  role              = aws_iam_role.iam_for_lambda.arn
  handler           = "dist/admin-api/confirm-visit.handler"
  source_code_hash  = data.archive_file.lambda_zip.output_base64sha256
  runtime           = local.runtime

  environment {
    variables = local.firebase_env_vars
  }
}

resource "aws_lambda_function" "admin_sign_in_lambda" {
  filename          = data.archive_file.lambda_zip.output_path
  function_name     = "${var.product}-${var.env}-admin-sign-in"
  role              = aws_iam_role.iam_for_lambda.arn
  handler           = "dist/admin-api/admin-sign-in.handler"
  source_code_hash  = data.archive_file.lambda_zip.output_base64sha256
  runtime           = local.runtime

  environment {
    variables = local.jwt_env_vars
  }
}
