import { CONFIG_OPTIONS } from "src/common/common.constants";
import { MailModuleOptions } from "./mail.interface";
import { Inject, Injectable } from "@nestjs/common";
import got from "got";
import * as FormData from "form-data";

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions
  ) {}

  private async sendEmail(subject: string, content: string, mail: string) {
    const form = new FormData();
    form.append('from', `Excited User <${this.options.fromEmail}>`);
    form.append('to', mail);
    form.append('subject', subject);
    form.append('text', content);

    const authHeader = `Basic ${Buffer.from(
      `api:${this.options.apiKey}`
    ).toString('base64')}`;

    try {
      const response = await got(
        `https://api.mailgun.net/v3/${this.options.domain}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: authHeader
          },
          body: form,
        },
      );
      console.log('Success:', response.body);
    } catch (error) {
      console.log('Error details:', error.response?.body);
      throw error;
    }
  }

  async verifySendEmail(subject: string, content: string, mail: string) {
    this.sendEmail(subject, content, mail)
  }
}