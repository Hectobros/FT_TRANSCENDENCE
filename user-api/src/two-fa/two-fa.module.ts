import { Module } from '@nestjs/common';
import { MailModule } from 'src/mail/mail.module';
import { UserModule } from 'user-api/user.module';
import { TwoFaController } from './two-fa.controller';

@Module({

  controllers: [TwoFaController],
  imports: [MailModule, UserModule]
})
export class TwoFaModule {}
