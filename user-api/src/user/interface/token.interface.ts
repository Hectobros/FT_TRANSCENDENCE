export interface IToken 
{
    id: number;
    email: string;
    login: string;
	image_url: string;
    iat: number;
	exp: number;
}