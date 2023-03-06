import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class ApiService {
    constructor(
        private readonly authService: AuthService
    ) {

    }


    /**
     * 上传文件
     */
    async upload() {

    }


    /**
     * 下载文件
     */
    async download() {

    }

    /**
     * 获得下载链接
     */
    async getDownloadPath() {

    }
}
