import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Logger } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  private logger: Logger = new Logger('MessageController');

  @Post()
  create(@Body() createMessageDto: CreateMessageDto)
  {
    return this.messageService.createRequest(createMessageDto);
  }

  @Get()
  findAll() {
    return this.messageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messageService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messageService.remove(+id);
  }
}
