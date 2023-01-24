import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
} from "@nestjs/common";
import { Response } from "express";
import { Error } from "./oauth/oauth.dto";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const response = host.switchToHttp().getResponse<Response>();
        response.status(exception.getStatus()).json(new Error(exception.message));
    }
}
