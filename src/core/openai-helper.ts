import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from 'openai';

export class OpenAI {
  OPENAI_API_KEY: string = process.env.OPENAI_API_KEY || '';
  MODEL: string = process.env.CHAT_GPT_MODEL || 'gpt-3.5-turbo';
  TEMPERATURE: number = Number(process.env.TEMPERATURE) || 1;
  TOP_P: number = Number(process.env.TOP_P) || 1;
  
  configuration: Configuration;
  openai: OpenAIApi;

  constructor() {
    this.configuration = new Configuration({
      apiKey: this.OPENAI_API_KEY
    });

    this.openai = new OpenAIApi(this.configuration);
  }

  async test(): Promise<boolean> {
    try {
      let res = await this.openai.listModels();
      return !!res;
    } catch (err) {
      return false;
    }
  }

  async chat(messages: string[]) {
    let requestMessages: ChatCompletionRequestMessage[] = messages.map(message => ({
      role: 'user',
      content: message,
    }));

    console.log('test');

    return await this.openai.createChatCompletion({
      model: this.MODEL,
      temperature: this.TEMPERATURE,
      top_p: this.TOP_P,
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