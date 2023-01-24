import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendMail(email: string, text: string) {
    await this.mailerService
      .sendMail({
        to: email,
        from: process.env.EMAIL_FROM,
        subject: 'Your 2FA code',
        html: `<b>${text}</b>`,
        text: `${text}`,
        template: './verification-code',
        context: {
          text: text,
        },
      })
      .then(() => {})
      .catch(() => {});
  }
}
