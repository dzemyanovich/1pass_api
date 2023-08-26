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

#################### USER API ####################

resource "aws_lambda_function" "get_user_data_lambda" {
  filename          = data.archive_file.lambda_zip.output_path
  function_name     = "${var.product}-${var.env}-get-user-data"
  role              = aws_iam_role.iam_for_lambda.arn
  handler           = "dist/get-user-data.handler"
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
  handler           = "dist/auth-send-code.handler"
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
  handler           = "dist/auth-verify-code.handler"
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
  handler           = "dist/sign-in.handler"
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
  handler           = "dist/sign-up.handler"
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
  handler           = "dist/create-booking.handler"
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
  handler           = "dist/cancel-booking.handler"
  source_code_hash  = data.archive_file.lambda_zip.output_base64sha256
  runtime           = local.runtime

  environment {
    variables = local.jwt_env_vars
  }
}

#################### ADMIN API ####################

resource "aws_lambda_function" "get_admin_data_lambda" {
  filename          = data.archive_file.lambda_zip.output_path
  function_name     = "${var.product}-${var.env}-admin-data"
  role              = aws_iam_role.iam_for_lambda.arn
  handler           = "dist/admin-api/admin-data.handler"
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
    variables = local.jwt_env_vars
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
