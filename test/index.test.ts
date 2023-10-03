// You can import your modules
// import index from '../src/index'

import nock from "nock";
// Requiring our app implementation
import myProbotApp from "../src";
import { Probot, ProbotOctokit } from "probot";
// Requiring our fixtures
import payload from "./fixtures/pull_request.opened.json";
const fs = require("fs");
const path = require("path");

const privateKey = fs.readFileSync(
  path.join(__dirname, "fixtures/mock-cert.pem"),
  "utf-8"
);

describe("My Probot app", () => {
  let probot: any;

  beforeEach(() => {
    nock.disableNetConnect();
    probot = new Probot({
      appId: 123,
      privateKey,
      // disable request throttling and retries for testing
      Octokit: ProbotOctokit.defaults({
        retry: { enabled: false },
        throttle: { enabled: false },
      }),
    });
    // Load our app into probot
    probot.load(myProbotApp);

    process.env.REPLY_TO_IGNORE = 'No issue found.'
  });

  test("creates a comment when an pull request is opened", async () => {

    const openAiMock = nock("https://api.openai.com/v1/")
      .get("/models")
      .reply(200, {
        "data": [
          {
            "id": "model-id-0",
            "object": "model",
            "owned_by": "organization-owner",
            "permission": []
          },
        ],
        "object": "list"
      })

      // as for code review
      .post("/chat/completions", (body: any) => {
        console.log(body);
        return true;
      })
      .reply(200, {
        "id": "chatcmpl-123",
        "object": "chat.completion",
        "created": 1677652288,
        "choices": [{
          "index": 0,
          "message": {
            "role": "assistant",
            "content": "\n\nYour code is good!",
          },
          "finish_reason": "stop"
        }],
        "usage": {
          "prompt_tokens": 9,
          "completion_tokens": 12,
          "total_tokens": 21
        }
      })

    const ghMock = nock("https://api.github.com")
      // Test that we correctly return a test token
      .post("/app/installations/2/access_tokens")
      .reply(200, {
        token: "test",
        permissions: {
          issues: "write",
        },
      })

      // Test that a comment is posted
      .post("/repos/cr/testing-things/issues/1/comments", (body: any) => {
        expect(body).toMatchObject({
          body: `🤖 Thanks for your pull request! AI reviewers will be checking it soon. Please make sure it follows our contribution guidelines and has passed our automated tests. 🤖💻`
        });
        return true;
      })
      .reply(200)

      // Compare 2 commits
      .get("/repos/cr/testing-things/compare/main...development")
      .reply(200, {
        files: [
          {
            "sha": "bbcd538c8e72b8c175046e27cc8f907076331401",
            "filename": "file1.txt",
            "status": "added",
            "additions": 103,
            "deletions": 21,
            "changes": 124,
            "blob_url": "https://github.com/octocat/Hello-World/blob/6dcb09b5b57875f334f61aebed695e2e4193db5e/file1.txt",
            "raw_url": "https://github.com/octocat/Hello-World/raw/6dcb09b5b57875f334f61aebed695e2e4193db5e/file1.txt",
            "contents_url": "https://api.github.com/repos/octocat/Hello-World/contents/file1.txt?ref=6dcb09b5b57875f334f61aebed695e2e4193db5e",
            "patch": "@@ -132,7 +132,7 @@ module Test @@ -1000,7 +1000,7 @@ module Test"
          }
        ]
      })

      // // Test that a comment is posted
      // .post("/repos/cr/testing-things/issues/1/comments", (body: any) => {
      //   expect(body).toMatchObject({
      //     body: `🤖 No code change detected. 🤖`
      //   });
      //   return true;
      // })
      // .reply(200)

      // Create review comment
      .post("/repos/cr/testing-things/pulls/1/comments", (body: any) => {
        expect(body).toMatchObject({
          body: "\n\nYour code is good!",
          commit_id: "abc123",
          path: "file1.txt",
          position: 0
        });
        return true;
      })
      .reply(200)

    // Receive a webhook event
    await probot.receive({ name: "pull_request.opened", payload });

    expect(ghMock.pendingMocks()).toStrictEqual([]);
    expect(openAiMock.pendingMocks()).toStrictEqual([]);

  });

  test("ignore reply",async () => {
    const openAiMock = nock("https://api.openai.com/v1/")
      .get("/models")
      .reply(200, {
        "data": [
          {
            "id": "model-id-0",
            "object": "model",
            "owned_by": "organization-owner",
            "permission": []
          },
        ],
        "object": "list"
      })

      // as for code review
      .post("/chat/completions", (body: any) => {
        console.log(body);
        return true;
      })
      .reply(200, {
        "id": "chatcmpl-123",
        "object": "chat.completion",
        "created": 1677652288,
        "choices": [{
          "index": 0,
          "message": {
            "role": "assistant",
            "content": "No issue found.",
          },
          "finish_reason": "stop"
        }],
        "usage": {
          "prompt_tokens": 9,
          "completion_tokens": 12,
          "total_tokens": 21
        }
      })

    const ghMock = nock("https://api.github.com")
      // Test that we correctly return a test token
      .post("/app/installations/2/access_tokens")
      .reply(200, {
        token: "test",
        permissions: {
          issues: "write",
        },
      })

      // Test that a comment is posted
      .post("/repos/cr/testing-things/issues/1/comments", (body: any) => {
        expect(body).toMatchObject({
          body: `🤖 Thanks for your pull request! AI reviewers will be checking it soon. Please make sure it follows our contribution guidelines and has passed our automated tests. 🤖💻`
        });
        return true;
      })
      .reply(200)

      // Compare 2 commits
      .get("/repos/cr/testing-things/compare/main...development")
      .reply(200, {
        files: [
          {
            "sha": "bbcd538c8e72b8c175046e27cc8f907076331401",
            "filename": "file1.txt",
            "status": "added",
            "additions": 103,
            "deletions": 21,
            "changes": 124,
            "blob_url": "https://github.com/octocat/Hello-World/blob/6dcb09b5b57875f334f61aebed695e2e4193db5e/file1.txt",
            "raw_url": "https://github.com/octocat/Hello-World/raw/6dcb09b5b57875f334f61aebed695e2e4193db5e/file1.txt",
            "contents_url": "https://api.github.com/repos/octocat/Hello-World/contents/file1.txt?ref=6dcb09b5b57875f334f61aebed695e2e4193db5e",
            "patch": "@@ -132,7 +132,7 @@ module Test @@ -1000,7 +1000,7 @@ module Test"
          }
        ]
      })

    // Receive a webhook event
    await probot.receive({ name: "pull_request.opened", payload });

    expect(ghMock.pendingMocks()).toStrictEqual([]);
    expect(openAiMock.pendingMocks()).toStrictEqual([]);

  })

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });
});

// For more information about testing with Jest see:
// https://facebook.github.io/jest/

// For more information about using TypeScript in your tests, Jest recommends:
// https://github.com/kulshekhar/ts-jest

// For more information about testing with Nock see:
// https://github.com/nock/nock
