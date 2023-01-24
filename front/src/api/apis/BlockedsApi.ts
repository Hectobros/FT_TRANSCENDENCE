/* tslint:disable */
/* eslint-disable */
/**
 * ft_transcendance API
 * ft_transcendance API
 *
 * The version of the OpenAPI document: 1.0.11
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import * as runtime from '../runtime';
import type {
  ErrorOutput,
  UserOutput,
} from '../models';
import {
    ErrorOutputFromJSON,
    ErrorOutputToJSON,
    UserOutputFromJSON,
    UserOutputToJSON,
} from '../models';

export interface CreateBlockedshipRequest {
    login: string;
}

export interface DeleteBlockedshipRequest {
    login: string;
}

export interface ListUsersBlockedsRequest {
    onset?: number;
    length?: number;
    search?: string;
}

/**
 * 
 */
export class BlockedsApi extends runtime.BaseAPI {

    /**
     * Add a user to the blockeds list of the connected user
     */
    async createBlockedshipRaw(requestParameters: CreateBlockedshipRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<UserOutput>> {
        if (requestParameters.login === null || requestParameters.login === undefined) {
            throw new runtime.RequiredError('login','Required parameter requestParameters.login was null or undefined when calling createBlockedship.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/users/me/blockeds/{login}`.replace(`{${"login"}}`, encodeURIComponent(String(requestParameters.login))),
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => UserOutputFromJSON(jsonValue));

    }

    /**
     * Add a user to the blockeds list of the connected user
     */
    async createBlockedship(requestParameters: CreateBlockedshipRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<UserOutput> {
        const response = await this.createBlockedshipRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Remove a user to the blockeds list of the connected user
     */
    async deleteBlockedshipRaw(requestParameters: DeleteBlockedshipRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters.login === null || requestParameters.login === undefined) {
            throw new runtime.RequiredError('login','Required parameter requestParameters.login was null or undefined when calling deleteBlockedship.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/users/me/blockeds/{login}`.replace(`{${"login"}}`, encodeURIComponent(String(requestParameters.login))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Remove a user to the blockeds list of the connected user
     */
    async deleteBlockedship(requestParameters: DeleteBlockedshipRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.deleteBlockedshipRaw(requestParameters, initOverrides);
    }

    /**
     * Retrieve the list of blockeds of the connected user
     */
    async listUsersBlockedsRaw(requestParameters: ListUsersBlockedsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<UserOutput>>> {
        const queryParameters: any = {};

        if (requestParameters.onset !== undefined) {
            queryParameters['onset'] = requestParameters.onset;
        }

        if (requestParameters.length !== undefined) {
            queryParameters['length'] = requestParameters.length;
        }

        if (requestParameters.search !== undefined) {
            queryParameters['search'] = requestParameters.search;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/users/me/blockeds`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(UserOutputFromJSON));
    }

    /**
     * Retrieve the list of blockeds of the connected user
     */
    async listUsersBlockeds(requestParameters: ListUsersBlockedsRequest = {}, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<UserOutput>> {
        const response = await this.listUsersBlockedsRaw(requestParameters, initOverrides);
        return await response.value();
    }

}