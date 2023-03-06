import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { DbModule } from 'src/db/db.module';
import { DbService } from 'src/db/db.service';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';


@Module({
  imports: [HttpModule, AuthModule, DbModule],
  controllers: [ApiController],
  providers: [ApiService]
})
export class ApiModule {}
