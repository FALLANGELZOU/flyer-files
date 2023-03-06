import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import AUTH_KEY from './auth.config';
import { JwtStrategy } from './jwt.strategy';
import { DbModule } from 'src/db/db.module';
@Module({
  providers: [AuthService, LocalStrategy, JwtStrategy],
  imports: [
    DbModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),  //  默认路由
    JwtModule.register({
        secret: AUTH_KEY.SECRET_KEY,	// 设置私钥
        signOptions: { expiresIn: AUTH_KEY.EXPIRES_IN }, // 过期时间
    }),
],
  exports: [AuthService]
})
export class AuthModule {}
