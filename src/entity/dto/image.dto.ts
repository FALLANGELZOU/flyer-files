import { FileDto } from "./file.dto";

export interface SaveImageOption {
    md5: boolean,
    thumb: boolean,
    thirdParty?: boolean,
    thirdPartyType?: "pc" | "top" | "mp" | "random"
}

export interface ImageFromOtherOption {
    type?: "pc" | "mp" | "top" | "random"
    num?: number
}

export interface ImageDto {
    file: FileDto
    thumbPath?: string
    width: number
    height: number,
    createTime?: Date,
    thirdParty?: boolean
    thirdPartyType?: "pc" | "mp" | "top" | "random"
}

const types = ["pc", "mp", "top", "random"]
export const validateType = (type: string): boolean => {
    if (types.indexOf(type) == -1) return false
    return true
}


