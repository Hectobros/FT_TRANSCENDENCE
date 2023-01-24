import { NestFactory } from '@nestjs/core';
import {
    BadRequestException,
    ValidationPipe,
    ValidationError,
} from '@nestjs/common';
import { AppModule } from 'app/.module';
import { HttpExceptionFilter } from './http-exception.filters';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Use body, query and parameter validator
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            exceptionFactory: (errors: ValidationError[]): any => {
                return new BadRequestException(errors.join('; ').replace(/\n/g, ''));
            },
        }),
    );

    // Custom http error handler
    app.useGlobalFilters(new HttpExceptionFilter());
	app.enableCors();
    await app.listen(3000);
}
bootstrap();
