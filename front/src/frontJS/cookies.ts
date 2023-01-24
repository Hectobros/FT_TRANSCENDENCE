import { OauthToken } from "@/api/models";
import { AuthenticationApi } from "@/api/index";

export function getCookie(name: string): string {
    const value = `; ${document.cookie}`;
    // eslint-disable-next-line
    const parts: any = value.split(`; ${name}=`); // Fuck type script fuck Es lint A voir si on peux fix
    if (parts.length === 2) {
        return parts.pop().split(";").shift();
    } else return "";
}

export function setCookie(name: string, value: string, expiration: Date) {
    document.cookie = `${name}=${value}; expires=${expiration.toUTCString()}; path=/; SameSite=Lax;`; //Secure et SameSite=none si retour a https
}
export async function getCredentials(): Promise<string> {
    const accessToken: string = getCookie("trans_access");
    const refreshToken: string = getCookie("trans_refresh");

    if (!refreshToken) {
        location.href = "http://" + process.env.VUE_APP_IP;
        return "";
    }
    if (!accessToken) {
        await new AuthenticationApi()
            .refreshToken({
                refreshTokenRequest: { token: refreshToken },
            })
            .then((value: OauthToken) => {
                setAccessCookie(value.accessToken);
                setRefreshCookie(value.refreshToken);
            })
            .catch(() => {
                location.href = "http://" + process.env.VUE_APP_IP;
            });
    }
    return getCookie("trans_access");
}

export function addMinutes(date: Date, minutes: number) {
    return new Date(date.getTime() + minutes * 60000);
}

export function setAccessCookie(accessToken: string) {
    setCookie("trans_access", accessToken, addMinutes(new Date(), 150));
}

export function setRefreshCookie(accessToken: string) {
    setCookie("trans_refresh", accessToken, addMinutes(new Date(), 151));
}
