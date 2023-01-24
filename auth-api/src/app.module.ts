import { Module } from '@nestjs/common';
import { OauthService } from './oauth/oauth.service';
import { OauthController } from './oauth/oauth.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [HttpModule],
    controllers: [OauthController],
    providers: [OauthService],
})
export class AppModule { }
