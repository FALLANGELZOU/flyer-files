import { Duplex, Stream } from "stream";

export const buffer2Stream = (buffer: Buffer): Duplex => {
    //  创建bufferStream，将buffer转化成stream
    const bufferStream = new Stream.PassThrough();
    bufferStream.end(buffer)
    return bufferStream
}

export const randomStr = (num: number = 8, plus: boolean = false): string => {
    let res = ""
    if (plus && num > 8) {
        res += ((new Date()).valueOf().toString(36)).slice(-8);
        num -= 8;
    } else if (plus && num <= 8) {
        console.warn("必须超过8位才能使用增强模式！")
    }
    while(num > 8) {
        res += Math.random().toString(36).slice(-8)
        num -= 8
    }
    if (num > 0) res += Math.random().toString(36).slice(-num)
    return res
}

export const BoolUtil = {
    isTrue(value: any): boolean {
        if (typeof value == "boolean") return value
        if (typeof value == "string") {
            if (value == "true") return true
            if (value == "1") return true
            return false
        }
        if (typeof value == "number") {
            return value != null
        }


        return false
    }
}

