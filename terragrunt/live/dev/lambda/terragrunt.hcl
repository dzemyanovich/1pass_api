include {
  path = find_in_parent_folders()
}

terraform {
  source = "../../..//modules/lambda"
}

locals {
  global_vars = (read_terragrunt_config(find_in_parent_folders("terragrunt.hcl"))).locals
  root_dir = get_repo_root()
}

inputs = {
  env      = local.global_vars.env
  root_dir = local.root_dir
}
