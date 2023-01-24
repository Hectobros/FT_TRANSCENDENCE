import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface Identity {
    login: string;
    image_url: string;
}
export const Identity = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);
