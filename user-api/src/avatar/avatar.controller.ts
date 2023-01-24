import { AvatarService } from './avatar.service';
import {
  Controller,
  UseGuards,
  UseInterceptors,
  Get,
  Delete,
  NotFoundException,
  InternalServerErrorException,
  HttpCode,
  Query,
  Param,
  UploadedFile,
  BadRequestException,
  Post,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { LoggingInterceptor } from 'src/auth/auth.interceptor';
import { UserService } from 'user-api/user.service';
import { Identity } from 'user-api/user.decorator';
import { AvatarOutputDto } from './dto/avatar-output.dto';
import { User, Avatar } from 'db-interface/Core';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common'

@Controller('api/users/me/avatars')
@UseGuards(AuthGuard)
@UseInterceptors(LoggingInterceptor)
export class AvatarController {
  constructor(
    private readonly avatarService: AvatarService,
    private readonly userService: UserService,
  ) {}

  private logger: Logger = new Logger('AvatarController');


  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({ destination: '/app/dist/upload' }),
    }),
  )
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Identity() user: Identity,
  ) {
	if (file.mimetype == 'image/png' || file.mimetype == 'image/jpg' ||  file.mimetype == 'image/jpeg') 
	{
        const userFound: User | undefined = await this.userService.findOne(
          user.login,
        );
        if (!userFound) {
          throw new NotFoundException(`user ${user.login} not found`);
        }
        return this.avatarService
          .create(userFound, file.filename)
          .then((value: Avatar) => new AvatarOutputDto(value))
          .catch((error: Error) => {
            throw new InternalServerErrorException(error.message);
          });
	}
	else
	{
        throw new BadRequestException(
          `invalid file type ${file.mimetype}. File type shoud be .png, .jpeg or .jpg`,
        );
    }
  }
}
