import { Duplex, Stream } from "stream";

export const buffer2Stream = (buffer: Buffer): Duplex => {
    //  创建bufferStream，将buffer转化成stream
    const bufferStream = new Stream.PassThrough();
    bufferStream.end(buffer)
    return bufferStream
}