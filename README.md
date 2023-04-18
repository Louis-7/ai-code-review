# AI Code Review

Let AI do code review.

## Demo
- [Demo 1](https://github.com/Louis-7/ai-code-review/pull/4), integrate with GitHub Actions
- [Demo 2](https://github.com/Louis-7/ai-code-review/pull/3), integrate with GitHub App

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Docker

```sh
# 1. Build container
docker build -t protagonist-bot .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> protagonist-bot
```

## License

[GPL 3.0](LICENSE) © 2023 Louis Liu
