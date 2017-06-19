"use strict";
const fs = require('fs');
const path = require('path');
const multiparty = require('multiparty');
const readChunk = require('read-chunk');
const fileType = require('file-type');
const shortid = require('shortid');
const RouterBase = require('../../../common/routerbase');
const config = require('../../../config');
const UploadQiniu = require('../../../services/qiniu/uploadQiniu');

class ImageUploader extends RouterBase {
    constructor() {
        super(...arguments);

        // 图片允许上传的最大文件大小，单位(M)
        this.MAX_FILE_SIZE = 5;
    }

    handle() {
        const result = { 'code': -1, 'msg': '', 'data': {} };

        this.parseForm()
            .then(({ files }) => {
                if (!('image' in files)) {
                    result.msg = '参数错误';
                    return;
                }

                const imageFile = files.image[0];

                let srcpath = imageFile.path;

                return new UploadQiniu(srcpath).handle();

            })
            .catch(e => {
                console.log(e);
                if (e.statusCode === 413) {
                    result.msg = `单个不超过${this.MAX_FILE_SIZE}MB`;
                } else {
                    result.msg = '图片上传失败，请稍候再试';
                }
            })
            .then(destpath => {
                result.code = 0;
                result.msg = 'ok';
                console.log(destpath);
                result.data.imgUrl = destpath;
                this.res.json(result);
            });
    }

    parseForm() {
        const form = new multiparty.Form({
            encoding: 'utf8',
            maxFilesSize: this.MAX_FILE_SIZE * 1024 * 1024,
            autoFiles: true,
            uploadDir: path.join(global.SERVER_ROOT, 'tmp'),
        });

        return new Promise((resolve, reject) => {
            form.parse(this.req, (err, fields = {}, files = {}) => {
                return err ? reject(err) : resolve({ fields, files });
            });
        });
    }
}

module.exports = ImageUploader.makeRouteHandler();
