resource "aws_api_gateway_rest_api" "user_api" {
  name        = "${var.product}_${var.env}_user_api"
  description = "1Pass API"

  depends_on  = [
    aws_lambda_function.get_sport_objects_lambda
  ]
}

resource "aws_api_gateway_resource" "get_sport_objects_api_resource" {
  rest_api_id = aws_api_gateway_rest_api.user_api.id
  parent_id   = aws_api_gateway_rest_api.user_api.root_resource_id
  path_part   = "get-sport-objects"
}

############## GET get-sport-objects ##############

resource "aws_api_gateway_method" "get_sport_objects_get_method" {
  rest_api_id   = aws_api_gateway_rest_api.user_api.id
  resource_id   = aws_api_gateway_resource.get_sport_objects_api_resource.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_sport_objects_get_integration" {
  rest_api_id             = aws_api_gateway_rest_api.user_api.id
  resource_id             = aws_api_gateway_resource.get_sport_objects_api_resource.id
  http_method             = aws_api_gateway_method.get_sport_objects_get_method.http_method
  integration_http_method = "POST"
  type                    = "AWS"
  uri                     = aws_lambda_function.get_sport_objects_lambda.invoke_arn
}

resource "aws_lambda_permission" "get_sport_objects_lambda_permission" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_sport_objects_lambda.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.user_api.execution_arn}/*/*"
}

resource "aws_api_gateway_method_response" "get_sport_objects_method_response" {
  rest_api_id = aws_api_gateway_rest_api.user_api.id
  resource_id = aws_api_gateway_resource.get_sport_objects_api_resource.id
  http_method = aws_api_gateway_method.get_sport_objects_get_method.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_integration_response" "get_sport_objects_get_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.user_api.id
  resource_id = aws_api_gateway_resource.get_sport_objects_api_resource.id
  http_method = aws_api_gateway_method.get_sport_objects_get_method.http_method
  status_code = aws_api_gateway_method_response.get_sport_objects_method_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }
}

############## OPTIONS get-sport-objects (for cors) ##############

resource "aws_api_gateway_method" "get_sport_objects_options_method" {
  rest_api_id   = aws_api_gateway_rest_api.user_api.id
  resource_id   = aws_api_gateway_resource.get_sport_objects_api_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_sport_objects_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.user_api.id
  resource_id = aws_api_gateway_resource.get_sport_objects_api_resource.id
  http_method = aws_api_gateway_method.get_sport_objects_options_method.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = <<EOF
{"statusCode": 200}
EOF
  }
}

resource "aws_api_gateway_method_response" "get_sport_objects_options_method_response" {
  rest_api_id = aws_api_gateway_rest_api.user_api.id
  resource_id = aws_api_gateway_resource.get_sport_objects_api_resource.id
  http_method = aws_api_gateway_method.get_sport_objects_options_method.http_method
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

resource "aws_api_gateway_integration_response" "get_sport_objects_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.user_api.id
  resource_id = aws_api_gateway_resource.get_sport_objects_api_resource.id
  http_method = aws_api_gateway_method.get_sport_objects_options_method.http_method
  status_code = aws_api_gateway_method_response.get_sport_objects_options_method_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
    "method.response.header.Access-Control-Allow-Methods" = "'OPTIONS,POST'",
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }
}

############## deployment ##############

resource "aws_api_gateway_deployment" "user_api_deployment" {
  variables = {
    source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  }

  depends_on  = [
    aws_api_gateway_integration.get_sport_objects_get_integration,
    aws_api_gateway_integration_response.get_sport_objects_get_integration_response,
    aws_api_gateway_integration.get_sport_objects_options_integration,
    aws_api_gateway_integration_response.get_sport_objects_options_integration_response
  ]
  rest_api_id = aws_api_gateway_rest_api.user_api.id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_iam_role.iam_for_lambda.id,
      aws_api_gateway_resource.get_sport_objects_api_resource.id,
      aws_api_gateway_method.get_sport_objects_get_method.id,
      aws_api_gateway_integration.get_sport_objects_get_integration.id,
      aws_lambda_function.get_sport_objects_lambda.source_code_hash
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "user_api_gateway_stage" {
  deployment_id = aws_api_gateway_deployment.user_api_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.user_api.id
  stage_name    = "${var.env}"
}
