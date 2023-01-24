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

import { exists, mapValues } from '../runtime';
import type { UserOutput } from './UserOutput';
import {
    UserOutputFromJSON,
    UserOutputFromJSONTyped,
    UserOutputToJSON,
} from './UserOutput';

/**
 * 
 * @export
 * @interface PlayerOutput
 */
export interface PlayerOutput {
    /**
     * 
     * @type {UserOutput}
     * @memberof PlayerOutput
     */
    user: UserOutput;
    /**
     * 
     * @type {number}
     * @memberof PlayerOutput
     */
    score: number;
}

/**
 * Check if a given object implements the PlayerOutput interface.
 */
export function instanceOfPlayerOutput(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "user" in value;
    isInstance = isInstance && "score" in value;

    return isInstance;
}

export function PlayerOutputFromJSON(json: any): PlayerOutput {
    return PlayerOutputFromJSONTyped(json, false);
}

export function PlayerOutputFromJSONTyped(json: any, ignoreDiscriminator: boolean): PlayerOutput {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'user': UserOutputFromJSON(json['user']),
        'score': json['score'],
    };
}

export function PlayerOutputToJSON(value?: PlayerOutput | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'user': UserOutputToJSON(value.user),
        'score': value.score,
    };
}
