import { Controller } from '@nestjs/common';
import { Post, Get, Body, Param, ValidationPipe } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import { UserService } from 'user-api/user.service';
import { SendMailDto, VerifyTwoFaCodeDto } from './dto/two-fa.dto'
import { Logger } from '@nestjs/common';



@Controller('2fa')
export class TwoFaController {
	constructor(
		private readonly mailService: MailService,
		private userService: UserService,
	) { }

	private logger: Logger = new Logger('2FA Controller');


	@Post('/verify')
	async verify2FaCode(@Body() body: VerifyTwoFaCodeDto) {

		const token = body.token;
		let user;
		try {
			this.userService.checkToken(token);
			user = await this.userService.getUserByToken(token);
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.FORBIDDEN);
		}

		if (!user.twoFa)
			return;

		const isValidated: boolean = user.twoFaCode === body.code;
		this.userService.updateTwoFaCode(user, null);

		if (isValidated == false)
			throw new HttpException('2Fa code is wrong', HttpStatus.FORBIDDEN);
	}


	@Post('/mail')
	async sendCodeToUser(@Body() body: SendMailDto) {
		try {
			const token = body.token;
			this.userService.checkToken(token);
			const user = await this.userService.getUserByToken(token);

			if (user.twoFa == false)
				return;

			const randomNumber = Math.floor(100000 + Math.random() * 900000);
			this.userService.updateTwoFaCode(user, `${randomNumber}`);
			const email = `${user.login}@student.42.fr`;
			this.mailService.sendMail(email, user.twoFaCode);
		}
		catch (error) {
			return error;
		}
	}
}
