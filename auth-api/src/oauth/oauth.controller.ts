import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    UnauthorizedException,
} from "@nestjs/common";
import { OauthService } from "./oauth.service";
import { Observable, map, mergeMap } from "rxjs";
import {
    RefreshTokenInput,
    AuthorizationCode,
    TokenPayload,
    UserPayload,
    Error,
    NewJwtToken,
} from "./oauth.dto";
import {
    ApiBadRequestResponse,
    ApiInternalServerErrorResponse,
    ApiOkResponse,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from "@nestjs/swagger";

@ApiTags("oauth")
@Controller("api")
export class OauthController {
    constructor(private readonly api42: OauthService) { }

    @ApiOkResponse({
        description: "successfull authentication",
        type: TokenPayload,
    })
    @ApiBadRequestResponse({ description: "no code provided", type: Error })
    @ApiUnauthorizedResponse({
        description: "invalid code provided",
        type: Error,
    })
    @ApiInternalServerErrorResponse({
        description: "internal server error",
        type: Error,
    })
    @ApiQuery({
        name: "code",
        type: "string",
        description: "oauth authorization code",
    })
    @Post("callback")
    oauthCallback(@Body() body: AuthorizationCode): Observable<TokenPayload> {
        return this.api42
            .validAuthCode(body.code)
            .pipe(
                mergeMap((token: TokenPayload) =>
                    this.api42.getUserInfo(token.access_token)
                )
            )
            .pipe(
                map((value: UserPayload) =>
                    NewJwtToken({
                        id: value.id,
                        email: value.email,
                        login: value.login,
                        image_url: value.image_url,
                    })
                )
            );
    }

    @ApiOkResponse({
        description: "successfull refresh",
        type: TokenPayload,
    })
    @ApiBadRequestResponse({
        description: "no refresh token provided",
        type: Error,
    })
    @ApiUnauthorizedResponse({
        description: "invalid refresh token provided",
        type: Error,
    })
    @ApiInternalServerErrorResponse({
        description: "internal server error",
        type: Error,
    })
    @Post("token")
    refreshToken(@Body() body: RefreshTokenInput): TokenPayload {
        let jwt = require("jsonwebtoken");

        try {
            let decoded: UserPayload = jwt.verify(
                body.token,
                process.env.REFRESH_TOKEN_SECRET
            );
            return NewJwtToken({
                id: decoded.id,
                email: decoded.email,
                login: decoded.login,
                image_url: decoded.image_url,
            });
        } catch (err: any) {
            throw new UnauthorizedException(err.message);
        }
    }
}
