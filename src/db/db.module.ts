import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Album } from 'src/entity/album.entity';
import { File } from 'src/entity/file.entity';
import { Image } from 'src/entity/image.entity';
import { User } from 'src/entity/user.entity';
import { DbService } from './db.service';

@Module({
  imports: [HttpModule,
  TypeOrmModule.forFeature([User, File, Image, Album]),
  ],
  controllers: [],
  providers: [DbService],
  exports: [DbService]
})
export class DbModule {}
