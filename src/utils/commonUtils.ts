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


export class ObjectUtils{
    getDataType(data) {
      const temp = Object.prototype.toString.call(data);
      const type = temp.match(/\b\w+\b/g);
      return (type.length < 2) ? 'Undefined' : type[1];
    }
    iterable(data){
      return ['Object', 'Array'].includes(this.getDataType(data));
    }
    isObjectChangedSimple(source, comparison){
      const _source = JSON.stringify(source)
      const _comparison = JSON.stringify({...source,...comparison})
      return _source !== _comparison
    }
    isObjectChanged(source, comparison) {
      if (!this.iterable(source)) {
        throw new Error(`source should be a Object or Array , but got ${this.getDataType(source)}`);
      }
      if (this.getDataType(source) !== this.getDataType(comparison)) {
        console.log("data type不同");
        
        return true;
      }
      const sourceKeys = Object.keys(source);
      const comparisonKeys = Object.keys({...source, ...comparison});
      if (sourceKeys.length !== comparisonKeys.length) {
        console.log("data length不同");
        
        return true;
      }
      return comparisonKeys.some(key => {
        if (this.iterable(source[key])) {
          return this.isObjectChanged(source[key], comparison[key]);
        } else {
          if (source[key] !== comparison[key]) {
            console.log("对比");
            console.log("key: ", key);
            console.log(source[key],comparison[key]);
            console.log("---------------------");
            
          }
          return source[key] !== comparison[key];
        }
      });
    }
  }
