import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { DbService } from 'src/db/db.service';
import { ROLE } from 'src/entity/role.entity';
import { User } from 'src/entity/user.entity';
import { Repository } from 'typeorm';
@Injectable()
export class AuthService {

    constructor(
        private readonly jwtService: JwtService,
        private readonly dbService: DbService,
    ) {
        this.initUser()
    }

    /**
     * 根据user信息建立jwt令牌
     * @param user 数据库查询的用户结果
     */
    genJwt(user: User) {
        return this.jwtService.sign({
            username: user.username,
            role: user.role
        })
    }

    /**
     * 验证用户登陆信息
     * @param username 
     * @param pass 
     * @returns 
     */
    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.dbService.findUser(username);
        if (!user) throw new BadRequestException("user not find");
        if (user.password === pass) {
            const { password, ...result } = user;
            return result;
        }
        throw new BadRequestException("error password")
    }

    /**
     * 生成默认配置
     */
    private async initUser() {
        if (!(await this.dbService.existUser("root"))) {
            this.dbService.addUser("root", "12345678", ROLE.ROOT)
        }
    }



}
