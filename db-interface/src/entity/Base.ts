import { PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";

export abstract class Base {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;
}
