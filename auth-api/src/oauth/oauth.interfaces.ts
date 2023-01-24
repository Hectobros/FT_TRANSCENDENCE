export interface RefreshBodyPayload42 {
    grant_type: string;
    client_id: string;
    client_secret: string;
    refresh_token: string;
}

export interface ErrorPayload42 {
    error: string;
    error_description: string;
}

export interface ApiConfig {
    apiURL: string;
    client_id: string;
    client_secret: string;
    redirect_uri: string;
}
