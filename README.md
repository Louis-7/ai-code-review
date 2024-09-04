# AI Code Review

[![Function Deploy](https://github.com/Louis-7/ai-code-review/actions/workflows/main_ai-code-review-gh-app.yml/badge.svg)](https://github.com/Louis-7/ai-code-review/actions/workflows/main_ai-code-review-gh-app.yml)

<img width="500" alt="AI Code Review Banner" src="https://github.com/Louis-7/ai-code-review/assets/12605300/e4a0bfb6-b1f4-4dd5-a2d7-7d68711531e9">

Let AI do code review for you! [Demo](https://github.com/Louis-7/ranking-board/pull/10)

This app is calling OpenAI chatGPT API to do code review for you.

[GitHub App](https://github.com/apps/ai-code-review) | [GitHub Action](https://github.com/marketplace/actions/quick-ai-code-review) | [Self-host Instruction](https://github.com/Louis-7/ai-code-review/tree/main#host-it-by-yourself)

## Install

1. Go to **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**

2. Create a repository secret named `OPENAI_API_KEY` and fill it with your API key

3. Add the configurations to `.github/workflows/pr-code-review.yml`

   1. [OpenAI example](https://github.com/Louis-7/ai-code-review/blob/main/examples/open-ai-example.yml)

   2. [Azure OpenAI example](https://github.com/Louis-7/ai-code-review/blob/main/examples/azure-open-ai-example.yml)

4. Get more details about the available environment variables in [.env.action.example](https://github.com/Louis-7/ai-code-review/blob/main/.env.action.example)

5. Create a pull request in your repository and let AI assistant you!

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
