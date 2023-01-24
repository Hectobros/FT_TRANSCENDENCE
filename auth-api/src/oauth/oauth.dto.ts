import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

/*
    Parameters
*/
export class RefreshTokenInput {
    @ApiProperty({
        description: "Refresh token payload",
        example: "d7d198196wfcfe61cd131cb0fd6192365ae7248c2acc68c6323f83ca8917546a",
    })
    @IsNotEmpty()
    token: string;
}

export class AuthorizationCode {
    @IsNotEmpty()
    code: string;
}

/*
    Response body
*/
export class TokenPayload {
    @ApiProperty({
        description: "Access token payload",
        example: "07af7983c67ebf4c30f4484e8231a09eb847f270690027f3c8d43f044e0cd21d",
    })
    access_token: string;

    @ApiProperty({ description: "Access token type", example: "bearer" })
    token_type: string;

    @ApiProperty({ description: "Access token expiration time", example: 7200 })
    expires_in: number;

    @ApiProperty({
        description: "Refresh token payload",
        example: "d7d198196efcfe61cd131cb0fd6192365ae7248c2acc68c6323f83ca8917546a",
    })
    refresh_token: string;

    @ApiProperty({ description: "Authorization scope", example: "public" })
    scope: string;

    @ApiProperty({
        description: "Access token creation time",
        example: "16665511",
    })
    created_at: number;

    constructor(access_token: string, refresh_token: string, expires_in: number) {
        this.token_type = "bearer";
        this.created_at = Math.floor(Date.now() / 1000);
        this.access_token = access_token;
        this.refresh_token = refresh_token;
        this.expires_in = expires_in * 60;
    }
}

export class Error {
    constructor(message: string) {
        this.message = message;
    }

    @ApiProperty({
        description: "Message explaining the error",
        example: "Message explaining the error",
    })
    message: string;
}

export class UserPayload {
    id: number;
    email: string;
    login: string;
    image_url: string;
}

export const NewJwtToken = (user: UserPayload): TokenPayload => {
    let jwt = require("jsonwebtoken");
    let accessExpiration = 150; // In minute
    let refreshExpiration = 600; // In minute

    return new TokenPayload(
        jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: accessExpiration * 60,
        }),
        jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: refreshExpiration * 60,
        }),
        accessExpiration
    );
};
