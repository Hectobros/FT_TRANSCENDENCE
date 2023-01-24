import "reflect-metadata";
import { DataSource } from "typeorm";
import {
  User,
  Avatar,
  UserStats,
  UserMatch,
  Match,
  UserChannel,
  Channel,
  Message,
} from "./entity/Core";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.VUE_APP_IP,
  port: 5432,
  username: "admin",
  password: "admin",
  database: "ft_transcendence",
  synchronize: true,
  logging: false,
  entities: [
    User,
    Avatar,
    UserStats,
    Match,
    UserMatch,
    Channel,
    UserChannel,
    Message,
  ],
  migrations: [],
  subscribers: [],
});
