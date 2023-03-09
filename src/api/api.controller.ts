import { HttpService } from '@nestjs/axios';
import { Body, Controller, Dependencies, Get, Param, Post, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { map } from 'rxjs';
import { ApiService } from './api.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtGuard } from 'src/auth/JwtGuard';
import { DbService } from 'src/db/db.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ImageFromOtherOption, SaveImageOption, validateType } from 'src/entity/dto/image.dto';
import { UserDto } from 'src/entity/dto/user.dto';
import { AuthService } from 'src/auth/auth.service';
import { file2FileDto } from 'src/entity/dto/file.dto';
import { type } from 'os';
import { BoolUtil } from 'src/utils/commonUtils';
import { Request } from 'express'
@Controller('api')
export class ApiController {

    constructor(
        private readonly httpService: HttpService,
        private readonly apiService: ApiService,
        private readonly authService: AuthService,
        private readonly dbService: DbService
    ) {

    }

    /**
     * 登陆
     * @param param 用户名密码
     * @returns token
     */
    @UseGuards(AuthGuard('local'))
    @Post("/login")
    async login(@Req() param: any) {
        return {
            token: this.authService.genJwt(param.user)
        }
    }
    
    /**
     * 修改密码
     * @param param 新密码
     * @returns 
     */
    @UseGuards(JwtGuard)
    @Post("/user/modify/password")
    async changePassword(@Body() param: { password: string }, @Req() request) {
        if (!param.password) return "更新密码不存在！"
        return this.dbService.changePassword(request.user.username, param.password)
    }


    /**
     * 上传图片
     * @param file 
     * @param params 
     * @returns 
     */
    @UseGuards(JwtGuard)
    @Post("/image/upload")
    @UseInterceptors(FileInterceptor('file'))
    async imageUpload(
        @UploadedFile() file: Express.Multer.File,
        @Query() option: SaveImageOption = {
            md5: true,
            thumb: true
        },
    ) {
        option.md5 = BoolUtil.isTrue(option.md5)
        option.thumb = BoolUtil.isTrue(option.thumb)
        return this.dbService.saveImage(file2FileDto(file), {
            ...option
        })
    }

    /**
     * 获取图片流
     * @param params 图片路径
     * @param res 图片流
     */
    @Get("/images/:type/:year/:month/:day/:name")
    async getImage(@Param() params, @Res() res: Response) {
        const { type, year, month, day, name } = params
        const path = [type, year, month, day, name].join("/")
        const stream = await this.dbService.getImageStream(path)
        stream.pipe(res)
    }

    /**
     * 
     * @param param 分页查询参数
     * @returns 图片信息
     */
    @Post("/image/list")
    async getImageList(@Body() param: PageQueryDto) {
        return this.dbService.getImages(param)
    }

    /**
     * 
     * @returns 图片数目
     */
    @Get("/image/count")
    async getImageCount() {
        return this.dbService.getImageCount()
    }


    /**
     * 拉取第三方图片
     */
    @Post("image/fetch")
    @UseGuards(JwtGuard)
    async fetchImages(@Body() param: ImageFromOtherOption) {
        if (param.type && !validateType(param.type)) return "类型不符合！"
        if (param.num && (typeof param.num) != 'number') return "数量不正确！" 
        return this.dbService.fetchImagesFromOther(param)
    }


    @Post("image/random")
    async getThirdPartyImageRandom(@Body() param: ImageFromOtherOption) {
        return this.dbService.getRandomThirdPartyImage(param.num?param.num:20, param.type)
    }
}