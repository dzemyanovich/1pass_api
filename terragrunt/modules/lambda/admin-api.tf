resource "aws_api_gateway_rest_api" "admin_api" {
  name        = "${var.product}_${var.env}_admin_api"
  description = "1Pass API (admin)"

  depends_on  = [
    aws_lambda_function.get_admin_data_lambda,
    aws_lambda_function.confirm_visit_lambda,
    aws_lambda_function.admin_sign_in_lambda
  ]
}

resource "aws_api_gateway_resource" "get_admin_data_api_resource" {
  rest_api_id = aws_api_gateway_rest_api.admin_api.id
  parent_id   = aws_api_gateway_rest_api.admin_api.root_resource_id
  path_part   = "get-admin-data"
}

resource "aws_api_gateway_resource" "confirm_visit_api_resource" {
  rest_api_id = aws_api_gateway_rest_api.admin_api.id
  parent_id   = aws_api_gateway_rest_api.admin_api.root_resource_id
  path_part   = "confirm-visit"
}

resource "aws_api_gateway_resource" "admin_sign_in_api_resource" {
  rest_api_id = aws_api_gateway_rest_api.admin_api.id
  parent_id   = aws_api_gateway_rest_api.admin_api.root_resource_id
  path_part   = "admin-sign-in"
}

############## GET get-admin-data ##############

resource "aws_api_gateway_method" "get_admin_data_get_method" {
  rest_api_id   = aws_api_gateway_rest_api.admin_api.id
  resource_id   = aws_api_gateway_resource.get_admin_data_api_resource.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_admin_data_get_integration" {
  rest_api_id             = aws_api_gateway_rest_api.admin_api.id
  resource_id             = aws_api_gateway_resource.get_admin_data_api_resource.id
  http_method             = aws_api_gateway_method.get_admin_data_get_method.http_method
  integration_http_method = "POST"
  type                    = "AWS"
  uri                     = aws_lambda_function.get_admin_data_lambda.invoke_arn

  request_templates = {
    "application/json" = local.get_request_mapping
  }
}

resource "aws_lambda_permission" "get_admin_data_lambda_permission" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_admin_data_lambda.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.admin_api.execution_arn}/*/*"
}

resource "aws_api_gateway_method_response" "get_admin_data_method_response" {
  rest_api_id = aws_api_gateway_rest_api.admin_api.id
  resource_id = aws_api_gateway_resource.get_admin_data_api_resource.id
  http_method = aws_api_gateway_method.get_admin_data_get_method.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_integration_response" "get_admin_data_get_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.admin_api.id
  resource_id = aws_api_gateway_resource.get_admin_data_api_resource.id
  http_method = aws_api_gateway_method.get_admin_data_get_method.http_method
  status_code = aws_api_gateway_method_response.get_admin_data_method_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  depends_on = [
    aws_api_gateway_integration.get_admin_data_get_integration
  ]
}

############## OPTIONS get-admin-data (for cors) ##############

resource "aws_api_gateway_method" "get_admin_data_options_method" {
  rest_api_id   = aws_api_gateway_rest_api.admin_api.id
  resource_id   = aws_api_gateway_resource.get_admin_data_api_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_admin_data_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.admin_api.id
  resource_id = aws_api_gateway_resource.get_admin_data_api_resource.id
  http_method = aws_api_gateway_method.get_admin_data_options_method.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

resource "aws_api_gateway_method_response" "get_admin_data_options_method_response" {
  rest_api_id = aws_api_gateway_rest_api.admin_api.id
  resource_id = aws_api_gateway_resource.get_admin_data_api_resource.id
  http_method = aws_api_gateway_method.get_admin_data_options_method.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_integration_response" "get_admin_data_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.admin_api.id
  resource_id = aws_api_gateway_resource.get_admin_data_api_resource.id
  http_method = aws_api_gateway_method.get_admin_data_options_method.http_method
  status_code = aws_api_gateway_method_response.get_admin_data_options_method_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
    "method.response.header.Access-Control-Allow-Methods" = "'OPTIONS,POST'",
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  depends_on = [
    aws_api_gateway_integration.get_admin_data_options_integration
  ]
}

############## POST confirm-visit ##############

resource "aws_api_gateway_method" "confirm_visit_post_method" {
  rest_api_id   = aws_api_gateway_rest_api.admin_api.id
  resource_id   = aws_api_gateway_resource.confirm_visit_api_resource.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "confirm_visit_post_integration" {
  rest_api_id             = aws_api_gateway_rest_api.admin_api.id
  resource_id             = aws_api_gateway_resource.confirm_visit_api_resource.id
  http_method             = aws_api_gateway_method.confirm_visit_post_method.http_method
  integration_http_method = "POST"
  type                    = "AWS"
  uri                     = aws_lambda_function.confirm_visit_lambda.invoke_arn
}

resource "aws_lambda_permission" "confirm_visit_lambda_permission" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.confirm_visit_lambda.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.admin_api.execution_arn}/*/*"
}

resource "aws_api_gateway_method_response" "confirm_visit_method_response" {
  rest_api_id = aws_api_gateway_rest_api.admin_api.id
  resource_id = aws_api_gateway_resource.confirm_visit_api_resource.id
  http_method = aws_api_gateway_method.confirm_visit_post_method.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_integration_response" "confirm_visit_post_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.admin_api.id
  resource_id = aws_api_gateway_resource.confirm_visit_api_resource.id
  http_method = aws_api_gateway_method.confirm_visit_post_method.http_method
  status_code = aws_api_gateway_method_response.confirm_visit_method_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  depends_on = [
    aws_api_gateway_integration.confirm_visit_post_integration
  ]
}

############## OPTIONS confirm-visit (for cors) ##############

resource "aws_api_gateway_method" "confirm_visit_options_method" {
  rest_api_id   = aws_api_gateway_rest_api.admin_api.id
  resource_id   = aws_api_gateway_resource.confirm_visit_api_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "confirm_visit_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.admin_api.id
  resource_id = aws_api_gateway_resource.confirm_visit_api_resource.id
  http_method = aws_api_gateway_method.confirm_visit_options_method.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

resource "aws_api_gateway_method_response" "confirm_visit_options_method_response" {
  rest_api_id = aws_api_gateway_rest_api.admin_api.id
  resource_id = aws_api_gateway_resource.confirm_visit_api_resource.id
  http_method = aws_api_gateway_method.confirm_visit_options_method.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_integration_response" "confirm_visit_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.admin_api.id
  resource_id = aws_api_gateway_resource.confirm_visit_api_resource.id
  http_method = aws_api_gateway_method.confirm_visit_options_method.http_method
  status_code = aws_api_gateway_method_response.confirm_visit_options_method_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
    "method.response.header.Access-Control-Allow-Methods" = "'OPTIONS,POST'",
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  depends_on = [
    aws_api_gateway_integration.confirm_visit_options_integration
  ]
}

############## POST admin-sign-in ##############

resource "aws_api_gateway_method" "admin_sign_in_post_method" {
  rest_api_id   = aws_api_gateway_rest_api.admin_api.id
  resource_id   = aws_api_gateway_resource.admin_sign_in_api_resource.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "admin_sign_in_post_integration" {
  rest_api_id             = aws_api_gateway_rest_api.admin_api.id
  resource_id             = aws_api_gateway_resource.admin_sign_in_api_resource.id
  http_method             = aws_api_gateway_method.admin_sign_in_post_method.http_method
  integration_http_method = "POST"
  type                    = "AWS"
  uri                     = aws_lambda_function.admin_sign_in_lambda.invoke_arn
}

resource "aws_lambda_permission" "admin_sign_in_lambda_permission" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.admin_sign_in_lambda.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.admin_api.execution_arn}/*/*"
}

resource "aws_api_gateway_method_response" "admin_sign_in_method_response" {
  rest_api_id = aws_api_gateway_rest_api.admin_api.id
  resource_id = aws_api_gateway_resource.admin_sign_in_api_resource.id
  http_method = aws_api_gateway_method.admin_sign_in_post_method.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_integration_response" "admin_sign_in_post_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.admin_api.id
  resource_id = aws_api_gateway_resource.admin_sign_in_api_resource.id
  http_method = aws_api_gateway_method.admin_sign_in_post_method.http_method
  status_code = aws_api_gateway_method_response.admin_sign_in_method_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  depends_on = [
    aws_api_gateway_integration.admin_sign_in_post_integration
  ]
}

############## OPTIONS admin-sign-in (for cors) ##############

resource "aws_api_gateway_method" "admin_sign_in_options_method" {
  rest_api_id   = aws_api_gateway_rest_api.admin_api.id
  resource_id   = aws_api_gateway_resource.admin_sign_in_api_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "admin_sign_in_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.admin_api.id
  resource_id = aws_api_gateway_resource.admin_sign_in_api_resource.id
  http_method = aws_api_gateway_method.admin_sign_in_options_method.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

resource "aws_api_gateway_method_response" "admin_sign_in_options_method_response" {
  rest_api_id = aws_api_gateway_rest_api.admin_api.id
  resource_id = aws_api_gateway_resource.admin_sign_in_api_resource.id
  http_method = aws_api_gateway_method.admin_sign_in_options_method.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_integration_response" "admin_sign_in_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.admin_api.id
  resource_id = aws_api_gateway_resource.admin_sign_in_api_resource.id
  http_method = aws_api_gateway_method.admin_sign_in_options_method.http_method
  status_code = aws_api_gateway_method_response.admin_sign_in_options_method_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
    "method.response.header.Access-Control-Allow-Methods" = "'OPTIONS,POST'",
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  depends_on = [
    aws_api_gateway_integration.admin_sign_in_options_integration
  ]
}

############## deployment ##############

resource "aws_api_gateway_deployment" "admin_api_deployment" {
  variables = {
    source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  }

  depends_on  = [
    aws_api_gateway_integration.get_admin_data_get_integration,
    aws_api_gateway_integration.get_admin_data_options_integration,
    aws_api_gateway_integration.confirm_visit_post_integration,
    aws_api_gateway_integration.confirm_visit_options_integration,
    aws_api_gateway_integration.admin_sign_in_post_integration,
    aws_api_gateway_integration.admin_sign_in_options_integration,
    aws_api_gateway_integration_response.get_admin_data_get_integration_response,
    aws_api_gateway_integration_response.get_admin_data_options_integration_response,
    aws_api_gateway_integration_response.confirm_visit_post_integration_response,
    aws_api_gateway_integration_response.confirm_visit_options_integration_response,
    aws_api_gateway_integration_response.admin_sign_in_post_integration_response,
    aws_api_gateway_integration_response.admin_sign_in_options_integration_response
  ]
  rest_api_id = aws_api_gateway_rest_api.admin_api.id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_iam_role.iam_for_lambda.id,
      aws_api_gateway_resource.get_admin_data_api_resource.id,
      aws_api_gateway_resource.confirm_visit_api_resource.id,
      aws_api_gateway_resource.admin_sign_in_api_resource.id,
      aws_api_gateway_method.get_admin_data_get_method.id,
      aws_api_gateway_method.get_admin_data_options_method.id,
      aws_api_gateway_method.confirm_visit_post_method.id,
      aws_api_gateway_method.confirm_visit_options_method.id,
      aws_api_gateway_method.admin_sign_in_post_method.id,
      aws_api_gateway_method.admin_sign_in_options_method.id,
      aws_api_gateway_integration.get_admin_data_get_integration.id,
      aws_api_gateway_integration.get_admin_data_options_integration.id,
      aws_api_gateway_integration.confirm_visit_post_integration.id,
      aws_api_gateway_integration.confirm_visit_options_integration.id,
      aws_api_gateway_integration.admin_sign_in_post_integration.id,
      aws_api_gateway_integration.admin_sign_in_options_integration.id,
      aws_lambda_function.get_admin_data_lambda.source_code_hash,
      aws_lambda_function.confirm_visit_lambda.source_code_hash,
      aws_lambda_function.admin_sign_in_lambda.source_code_hash,
      local.get_request_mapping
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "admin_api_gateway_stage" {
  deployment_id = aws_api_gateway_deployment.admin_api_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.admin_api.id
  stage_name    = "${var.env}"
}
