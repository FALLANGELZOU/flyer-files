import { Duplex, Stream } from "stream";

export const buffer2Stream = (buffer: Buffer): Duplex => {
    //  创建bufferStream，将buffer转化成stream
    const bufferStream = new Stream.PassThrough();
    bufferStream.end(buffer)
    return bufferStream
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