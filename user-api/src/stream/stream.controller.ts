import { Controller, Get, StreamableFile, Param, Response,  HttpStatus, HttpException } from '@nestjs/common';
import { createReadStream, statSync } from 'fs';
import { join } from 'path';

@Controller('upload')
export class StreamController {

	@Get(':id')
	getFile(@Param('id') id: string, @Response() res: any) {
		
		const path = join(process.cwd(), 'upload', id);
		try {
			statSync(path);
		  } catch (e) {
			throw new HttpException('image not found', HttpStatus.FORBIDDEN);
		  }
		const file = createReadStream(path);
		file.pipe(res);
	}









}
