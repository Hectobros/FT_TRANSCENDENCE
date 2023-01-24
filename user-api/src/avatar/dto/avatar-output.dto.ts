import { Avatar } from 'db-interface/Core';

export class AvatarOutputDto {
    constructor(avatar: Avatar) {
        this.id = avatar.id;
        this.path = avatar.path;
    }
    id: number;
    path: string;
}
