import { User } from 'db-interface/Core';

export interface IMessage {
  sender: User,
  channelId: number,
  text: string
}