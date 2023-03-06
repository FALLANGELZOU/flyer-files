import { HttpService } from '@nestjs/axios';
import { Body, Controller, Dependencies, Get, Param, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { map } from 'rxjs';
import { ApiService } from './api.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtGuard } from 'src/auth/JwtGuard';
import { DbService } from 'src/db/db.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
@Controller('api')
export class ApiController {

    constructor (
        private readonly httpService: HttpService,
        private readonly apiService: ApiService,
        private readonly dbService: DbService
        ) {

    }


    @Post("/upload")
    @UseInterceptors(FileInterceptor('file'))
    async upload(@UploadedFile() file: Express.Multer.File, @Body() params) {
        const n = file.originalname.split(".")

        return this.dbService.saveFile({
            fileName: n.slice(0,n.length-1).join(""),
            contentType: n.pop() as string,
            buffer: file.buffer,
            originalFileName: file.originalname
        })
    }


    @Get("/file/:year/:month/:day/:name")
    async getFile(@Param() params, @Res() res: Response) {
        const {year, month, day, name} = params
        const path = [year, month, day, name].join("/")

        const file = await this.dbService.getFile(path)
        file.stream.pipe(res)
    }



    @Post("/image/upload")
    @UseInterceptors(FileInterceptor('file'))
    async imageUpload(@UploadedFile() file: Express.Multer.File, @Body() params) {
        const n = file.originalname.split(".")

        return this.dbService.saveImage({
            fileName: n.slice(0,n.length-1).join(""),
            contentType: n.pop() as string,
            buffer: file.buffer,
            originalFileName: file.originalname
        })
    }
}