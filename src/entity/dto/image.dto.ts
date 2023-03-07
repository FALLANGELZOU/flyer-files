import { FileDto } from "./file.dto";

export interface SaveImageOption {
    md5: boolean,
    thumb: boolean
}

export interface ImageDto {
    file: FileDto
    thumbPath?: string  
    width: number
    height: number,
    createTime?: Date
}