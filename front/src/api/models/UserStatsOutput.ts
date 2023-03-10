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
/**
 * 
 * @export
 * @interface UserStatsOutput
 */
export interface UserStatsOutput {
    /**
     * 
     * @type {number}
     * @memberof UserStatsOutput
     */
    id: number;
    /**
     * 
     * @type {number}
     * @memberof UserStatsOutput
     */
    level: number;
    /**
     * 
     * @type {number}
     * @memberof UserStatsOutput
     */
    victories: number;
    /**
     * 
     * @type {number}
     * @memberof UserStatsOutput
     */
    defeats: number;
}

/**
 * Check if a given object implements the UserStatsOutput interface.
 */
export function instanceOfUserStatsOutput(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "id" in value;
    isInstance = isInstance && "level" in value;
    isInstance = isInstance && "victories" in value;
    isInstance = isInstance && "defeats" in value;

    return isInstance;
}

export function UserStatsOutputFromJSON(json: any): UserStatsOutput {
    return UserStatsOutputFromJSONTyped(json, false);
}

export function UserStatsOutputFromJSONTyped(json: any, ignoreDiscriminator: boolean): UserStatsOutput {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': json['id'],
        'level': json['level'],
        'victories': json['victories'],
        'defeats': json['defeats'],
    };
}

export function UserStatsOutputToJSON(value?: UserStatsOutput | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'level': value.level,
        'victories': value.victories,
        'defeats': value.defeats,
    };
}

