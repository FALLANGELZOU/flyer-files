import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { DbService } from 'src/db/db.service';
import { User } from 'src/entity/user.entity';
import { Repository } from 'typeorm';
@Injectable()
export class AuthService {
    
    constructor(
        private readonly jwtService: JwtService,
        private readonly dbService: DbService,
    ) {}

    /**
     * 根据user信息建立jwt令牌
     * @param user 数据库查询的用户结果
     */
    genJwt(user: User) {
        return this.jwtService.sign({
            username: user.username,
            id: user.id
        })
    }

    /**
     * 验证用户登陆信息
     * @param username 
     * @param pass 
     * @returns 
     */
    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.dbService.findUser(username, pass);
        if (!user) throw new BadRequestException("user not find");
        if (user.password === pass) {
          const { password, ...result } = user;
          return result;
        }
        throw new BadRequestException("error password")
      }
}
