/**
 * 七牛文件上传公共基类
 */
"use strict";
const fs = require('fs');
const shortid = require('shortid');
const readChunk = require('read-chunk');
const fileType = require('file-type');
const qiniu = require("qiniu");
const config = require('../../config');

class UploadQiniu {
    constructor(srcpath) {
        Object.assign(this, {srcpath});
    }
    handle() {
        const buffer = readChunk.sync(this.srcpath, 0, 262);
        const resultType = fileType(buffer);
        console.log(resultType);
        // if (!resultType || !['image/jpeg', 'image/png'].includes(resultType.mime)) {
        //     console.log('仅支持jpg/png格式的文件上传');
        //     return;
        // }
        let key = `${shortid.generate()}.${resultType.ext}`;
        qiniu.conf.ACCESS_KEY = config.qiniu.ACCESS_KEY;
        qiniu.conf.SECRET_KEY = config.qiniu.SECRET_KEY;

        let token = new qiniu.rs.PutPolicy(config.qiniu.bucket + ":" + key).token();

        return new Promise((resolve, reject) => {
            var extra = new qiniu.io.PutExtra();
            qiniu.io.putFile(token, key, this.srcpath, extra, (err, ret) => {
                if (!err) {
                    // 上传成功， 处理返回值
                    console.log(ret.hash, ret.key, ret.persistentId);
                    let imageUrl = config.qiniu.imageUrlPrefix + key;
                    resolve(imageUrl);
                } else {
                    // 上传失败， 处理返回代码
                    console.log(err);
                    reject();
                }
                // remove uploaded file
                fs.unlink(this.srcpath);
            });
        });
    }
}
module.exports = UploadQiniu;
