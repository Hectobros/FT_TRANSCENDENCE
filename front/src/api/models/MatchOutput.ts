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
import type { PlayerOutput } from './PlayerOutput';
import {
    PlayerOutputFromJSON,
    PlayerOutputFromJSONTyped,
    PlayerOutputToJSON,
} from './PlayerOutput';

/**
 * 
 * @export
 * @interface MatchOutput
 */
export interface MatchOutput {
    /**
     * 
     * @type {number}
     * @memberof MatchOutput
     */
    id: number;
    /**
     * 
     * @type {string}
     * @memberof MatchOutput
     */
    createdAt: string;
    /**
     * 
     * @type {string}
     * @memberof MatchOutput
     */
    finishedAt: string;
    /**
     * 
     * @type {PlayerOutput}
     * @memberof MatchOutput
     */
    winner: PlayerOutput;
    /**
     * 
     * @type {PlayerOutput}
     * @memberof MatchOutput
     */
    loser: PlayerOutput;
}

/**
 * Check if a given object implements the MatchOutput interface.
 */
export function instanceOfMatchOutput(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "id" in value;
    isInstance = isInstance && "createdAt" in value;
    isInstance = isInstance && "finishedAt" in value;
    isInstance = isInstance && "winner" in value;
    isInstance = isInstance && "loser" in value;

    return isInstance;
}

export function MatchOutputFromJSON(json: any): MatchOutput {
    return MatchOutputFromJSONTyped(json, false);
}

export function MatchOutputFromJSONTyped(json: any, ignoreDiscriminator: boolean): MatchOutput {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': json['id'],
        'createdAt': json['created_at'],
        'finishedAt': json['finished_at'],
        'winner': PlayerOutputFromJSON(json['winner']),
        'loser': PlayerOutputFromJSON(json['loser']),
    };
}

export function MatchOutputToJSON(value?: MatchOutput | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'created_at': value.createdAt,
        'finished_at': value.finishedAt,
        'winner': PlayerOutputToJSON(value.winner),
        'loser': PlayerOutputToJSON(value.loser),
    };
}
