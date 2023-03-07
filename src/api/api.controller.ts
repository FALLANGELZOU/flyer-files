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
import { SaveImageOption } from 'src/entity/dto/image.dto';
import { UserDto } from 'src/entity/dto/user.dto';
import { AuthService } from 'src/auth/auth.service';
import { file2FileDto } from 'src/entity/dto/file.dto';
import { type } from 'os';
import { BoolUtil } from 'src/utils/commonUtil';
@Controller('api')
export class ApiController {

    constructor(
        private readonly httpService: HttpService,
        private readonly apiService: ApiService,
        private readonly authService: AuthService,
        private readonly dbService: DbService
    ) {

    }

    @UseGuards(AuthGuard('local'))
    @Post("/login")
    async login(@Req() param: UserDto) {
        return {
            token: this.authService.genJwt(param as any)
        }
    }

    // /**
    //  * 
    //  * @param file 上传的文件
    //  * @param params 参数
    //  * @returns 
    //  */
    // @UseGuards(JwtGuard)
    // @Post("/upload")
    // @UseInterceptors(FileInterceptor('file'))
    // async upload(@UploadedFile() file: Express.Multer.File, @Query() params) {
    //     const n = file.originalname.split(".")
    //     return this.dbService.saveFile({
    //         fileName: n.slice(0,n.length-1).join(""),
    //         contentType: n.pop() as string,
    //         buffer: file.buffer,
    //         originalFileName: file.originalname
    //     })
    // }


    /**
     * 获取文件
     * @param params 文件路径
     * @param res 文件流
     */
    @Get("/file/:year/:month/:day/:name")
    @UseGuards(JwtGuard)
    async getFile(@Param() params, @Res() res: Response) {
        const { year, month, day, name } = params
        const path = [year, month, day, name].join("/")
        const file = await this.dbService.getFile(path)
        file.stream.pipe(res)
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

    @Get("/images/:type/:year/:month/:day/:name")
    async getImage(@Param() params, @Res() res: Response) {
        const { type, year, month, day, name } = params
        const path = [type, year, month, day, name].join("/")
        const stream = await this.dbService.getImageStream(path)
        stream.pipe(res)
    }

    @Post("/image/list")
    async getImageList(@Body() param: PageQueryDto) {
        console.log(param);
        
        return this.dbService.getImages(param)
    }
}