import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { HttpExceptionFilter } from "./http-exception.filters";
import { ValidationError } from "class-validator";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: ["debug", "verbose"],
    });

    // Use body, query and parameter validator
    app.useGlobalPipes(
        new ValidationPipe({
            exceptionFactory: (errors: ValidationError[]): any => {
                return new BadRequestException(errors.join("; ").replace(/\n/g, ""));
            },
        })
    );

    // Custom http error handler
    app.useGlobalFilters(new HttpExceptionFilter());

    // Setup swagger module
    const config = new DocumentBuilder()
        .setTitle("Oauth-api")
        .setDescription("Api which handle the oauth authentication")
        .setVersion("1.0")
        .addTag("oauth")
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api", app, document);

    await app.listen(3000);
}
bootstrap();
