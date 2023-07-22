# AI Code Review

[![Function Deploy](https://github.com/Louis-7/ai-code-review/actions/workflows/main_ai-code-review-gh-app.yml/badge.svg)](https://github.com/Louis-7/ai-code-review/actions/workflows/main_ai-code-review-gh-app.yml)

<img width="500" alt="AI Code Review Banner" src="https://github.com/Louis-7/ai-code-review/assets/12605300/e4a0bfb6-b1f4-4dd5-a2d7-7d68711531e9">

Let AI do code review for you! [Demo](https://github.com/Louis-7/ranking-board/pull/10)

This app is calling OpenAI chatGPT API to do code review for you.

[GitHub App](https://github.com/apps/ai-code-review) | [GitHub Action](https://github.com/marketplace/actions/quick-ai-code-review) | [Self-host Instruction](https://github.com/Louis-7/ai-code-review/tree/main#host-it-by-yourself) 

## Install

### GitHub App

1. Install GitHub App for you repository - [GitHub App - AI Code Review](https://github.com/apps/ai-code-review)
2. Create a pull request in your repository

### GitHub Action

1. Go to **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**

2. Create a repository secret named `OPENAI_API_KEY` and fill it with your API key

3. Add following configurtion in your `.github/workflows/pr-code-review.yml`

   ```
   name: Code Review
   permissions:
     contents: read
     pull-requests: write
   on:
     pull_request:
       types: [opened, synchronize]
   jobs:
     code-review:
       runs-on: ubuntu-latest
       steps:
         - uses: Louis-7/ai-code-review@v0.1
           env:
             GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
             OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
             PATH_TO_EXCLUDE: action/**/*, package-lock.json, package.json
             MAX_PATCH_PER_FILE: 2000
             MAX_FILE_PER_PR: 20
   ```

4. `GITHUB_TOKEN` and `OPENAI_API_KEY` are required parameter. Others are optional. You can get all available options in the [.env.action.example](https://github.com/Louis-7/ai-code-review/blob/main/.env.action.example)

5. Create a pull request in your repository

### Host it by yourself

You can also host the code reviewer by your self. Just follow the Dev section.

## Dev

The application is built on [Probot](https://github.com/probot/probot).

### Setup

```sh
# Install dependencies
npm install

# add environment variables
cp .env.example .env

# build app
npm run build

# Run the bot
npm start
```

Learn more about [Probot configuration](https://probot.github.io/docs/configuration/).

### Build

```sh
# build node.js app
npm run build

# build GitHub Action
npm run build:action

# build deployable azure function
npm run build:function
```

### Docker

You can also build docker image to deploy.

```sh
# 1. Build container
docker build -t protagonist-bot .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> protagonist-bot
```

## License

[GPL 3.0](LICENSE) © 2023 Louis Liu
