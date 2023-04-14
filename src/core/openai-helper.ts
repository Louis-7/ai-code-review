import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from 'openai';

export class OpenAI {
  OPENAI_API_KEY: string = process.env.OPENAI_API_KEY || '';
  configuration: Configuration;
  openai: OpenAIApi;

  constructor() {
    this.configuration = new Configuration({
      apiKey: this.OPENAI_API_KEY
    });

    this.openai = new OpenAIApi(this.configuration);
  }

  async chat(messages: string[]) {
    let requestMessages: ChatCompletionRequestMessage[] = messages.map(message => ({
      role: 'user',
      content: message,
    }));

    return await this.openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: requestMessages
    }).then(response => {
      let data = response.data;
      let choices = data.choices;

      if (choices.length <= 0) {
        return '';
      }

      let representativeChoice = choices[0];

      return representativeChoice.message?.content || '';
    })
  }
}