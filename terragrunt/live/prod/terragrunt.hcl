locals {
  env        = "prod1"
  aws_region = "eu-central-1"
}

generate "provider" {
  path      = "provider.tf"
  if_exists = "skip"
  contents  = <<EOF
provider "aws" {
  region = "${local.aws_region}"
}
EOF
}

remote_state {
  backend = "s3"
  config = {
    bucket = "${local.env}.1pass-api-terragrunt"
    region = "${local.aws_region}"
    key    = "${path_relative_to_include()}/terraform.tfstate"
  }

  generate = {
    path      = "backend.tf"
    if_exists = "overwrite_terragrunt"
  }
}
