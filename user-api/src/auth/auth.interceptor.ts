import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Identity } from 'user-api/user.decorator';

const userFromJWT = (token: string): Identity => {
    let jwt = require('jsonwebtoken');
    try {
        return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err: any) {
        throw new UnauthorizedException(err.message);
    }
};

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();

        const bearer: string = request.headers['authorization'];

        const splitted = bearer.split(' ');

        if (
            splitted.length != 2 ||
            (splitted.length === 2 && splitted[0].toLowerCase() !== 'bearer')
        ) {
            throw new UnauthorizedException('malformed authorization header');
        }
        request.user = userFromJWT(splitted[1]);

        return next.handle();
    }
}
