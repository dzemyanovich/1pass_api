include {
  path = find_in_parent_folders()
}

terraform {
  source = "../../..//modules/db"
}

locals {
  global_vars = (read_terragrunt_config(find_in_parent_folders("terragrunt.hcl"))).locals
}

inputs = {
  env = local.global_vars.env
}
