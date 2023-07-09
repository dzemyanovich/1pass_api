# Envs

| Env      | UI URL  | API URL                                                            |
| -------- | ------- | ------------------------------------------------------------------ |
| dev      | TBA     | TBA                                                                |
| preprod  | TBA     | https://ylqh9tcpdj.execute-api.eu-central-1.amazonaws.com/preprod1 |
| prod     | TBA     | https://n4k0ez87od.execute-api.eu-central-1.amazonaws.com/prod1/   |

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

AWS Lambda, AWS API Gateway, Node.js, Terraform, Terragrunt, GitLab CI

# Scripts description

| Script                           | Description                                                          |
| -------------------------------- | -------------------------------------------------------------------- | 
| `yarn tg-validate`               | Validate local terragrunt config for dev env                         |
| `yarn tg-plan`                   | Build application & plan local terragrunt config for dev env         |
| `yarn tg-apply`                  | Build application & apply local terragrunt config for dev env        |
| `yarn tg-destroy`                | Destroy dev env                                                      |

# Prerequisites
- Node.js 14.21.3
- Terragrunt 0.48.1 (Terraform 1.5.2 is used under the hood). Use `brew` to install
> Terraform / Terragrunt usage is restricted in Belarus. In order to run commands locally from Belarus location, you need to be connected to Europe / USA VPN (sometimes you need to switch between different VPN countries several times). Othewise, you'll see the following error:
```
Error: Invalid provider registry host
The host "registry.terraform.io" given in provider source address "registry.terraform.io/hashicorp/aws" does not offer a Terraform provider registry.
```

# GitLab CI/CD setup
Before running pipeline set the following env vars (variables should be **not protected**):

| Env var                      | Value        | Comments                                       |
| ---------------------------- | ------------ | ---------------------------------------------- |
| AWS_ACCESS_KEY_ID            | "some_value" |                                                |
| AWS_SECRET_ACCESS_KEY        | "some_value" |                                                |
