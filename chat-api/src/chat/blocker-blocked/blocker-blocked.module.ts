import { Module } from '@nestjs/common';
import { BlockerBlocked, User } from 'db-interface/Core';
import { BlockerBlockedService } from './blocker-blocked.service';
import { TypeOrmModule } from '@nestjs/typeorm'; 

@Module({
  imports: [TypeOrmModule.forFeature([BlockerBlocked, User])], 
  providers: [BlockerBlockedService],
  exports: [BlockerBlockedService]
})
export class BlockerBlockedModule {}
