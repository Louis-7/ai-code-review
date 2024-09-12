import { OpenAI } from "openai";
import { GPTEngine } from "../../models/gpt-engine";

export class OpenAIEngine implements GPTEngine {
  OPENAI_API_KEY: string = process.env.OPENAI_API_KEY || "";
  MODEL: string = process.env.CHAT_GPT_MODEL || "gpt-3.5-turbo";
  TEMPERATURE: number = Number(process.env.TEMPERATURE) || 1;
  TOP_P: number = Number(process.env.TOP_P) || 1;

  client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
    });
  }

  async test(): Promise<boolean> {
    try {
      let res = this.client.chat.completions.create({
        model: this.MODEL,
        messages: [{ role: "user", content: "Say this is a test!" }],
      });
      console.log(res);
      console.log('Engine test passed.');
      return !!res;
    } catch (err) {
      console.log(err);
      console.log('Engine test failed.');
      return false;
    }
  }

  async chatCompletion(messages: string[]) {
    const params: OpenAI.Chat.ChatCompletionCreateParams = {
      model: this.MODEL,
      temperature: this.TEMPERATURE,
      top_p: this.TOP_P,
      messages: messages.map((message) => ({
        role: "user",
        content: message,
      })),
    };

    return await this.client.chat.completions
      .create(params)
      .then((response) => {
        const choices = response.choices;

        if (choices.length <= 0) {
          return "";
        }

        const representativeChoice = choices[0];

        return representativeChoice.message?.content || "";
      });
  }
}
