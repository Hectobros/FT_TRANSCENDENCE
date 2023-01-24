import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { Observable, map, catchError, window } from "rxjs";
import { UnauthorizedException } from "@nestjs/common";
import { AxiosError } from "axios";
import { TokenPayload, UserPayload } from "./oauth.dto";
import { ApiConfig, ErrorPayload42 } from "./oauth.interfaces";

@Injectable()
export class OauthService {
    private readonly config: ApiConfig = {
        apiURL: "https://api.intra.42.fr/oauth/token",
        client_id: process.env.CLIENT_ID as string,
        client_secret: process.env.CLIENT_SECRET as string,
        redirect_uri: process.env.REDIRECT_URI as string,
    };

    constructor(private readonly httpService: HttpService) {
        if (
            !process.env.CLIENT_ID ||
            !process.env.CLIENT_SECRET ||
            !process.env.REDIRECT_URI ||
            !process.env.ACCESS_TOKEN_SECRET ||
            !process.env.REFRESH_TOKEN_SECRET
        ) {
            throw new Error(
                "CLIENT_ID or CLIENT_SECRET or REDIRECT_URI or ACCESS_TOKEN_SECRET or REFRESH_TOKEN_SECRET env variables are not correctly set"
            );
        }
    }

    public validAuthCode(code: string): Observable<TokenPayload> {
        return this.httpService
            .post<TokenPayload>(this.config.apiURL, {
                grant_type: "authorization_code",
                client_id: this.config.client_id,
                client_secret: this.config.client_secret,
                redirect_uri: this.config.redirect_uri,
                code: code,
            })
            .pipe(map((response) => response.data))
            .pipe(
                catchError((error: AxiosError<ErrorPayload42>) => {
                    throw new UnauthorizedException(
                        error.response?.data.error_description
                    );
                })
            );
    }

    public refreshToken(token: string): Observable<TokenPayload> {
        return this.httpService
            .post<TokenPayload>(this.config.apiURL, {
                grant_type: "refresh_token",
                client_id: this.config.client_id,
                client_secret: this.config.client_secret,
                redirect_uri: this.config.redirect_uri,
                refresh_token: token,
            })
            .pipe(map((response) => response.data))
            .pipe(
                catchError((error: AxiosError<ErrorPayload42>) => {
                    throw new UnauthorizedException(
                        error.response?.data.error_description
                    );
                })
            );
    }

    public getUserInfo(accessToken: string): Observable<UserPayload> {
        const headers: any = {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        };
        return this.httpService
            .get("https://api.intra.42.fr/v2/me", {
                headers: headers,
            })
            .pipe(map((response) => {response.data.image_url = response.data.image.link ; delete response.data.image; return response.data}))
            .pipe(
                catchError((error: AxiosError<ErrorPayload42>) => {
                    throw new InternalServerErrorException(
                        error.response?.data.error_description
                    );
                })
            );
    }
}
