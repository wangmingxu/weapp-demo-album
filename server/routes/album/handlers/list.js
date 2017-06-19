"use strict";
const _ = require('lodash');
const path = require('path');
const RouterBase = require('../../../common/routerbase');
const config = require('../../../config');
const qiniu = require('qiniu');

qiniu.conf.ACCESS_KEY = config.qiniu.ACCESS_KEY;
qiniu.conf.SECRET_KEY = config.qiniu.SECRET_KEY;

class ListImages extends RouterBase {
    handle() {
        const bucket = config.cosFileBucket;
        const listPath = config.cosUploadFolder;
        const listNum = 100;
        const pattern = 'eListFileOnly';
        const order = 1;
        const context = '';

        qiniu.rsf.listPrefix(config.qiniu.bucket,"","",1000,"",(err,ret)=>{
          this.res.json({
            code:0,
            msg:'ok',
            data:ret.items.map(item=>{
              return config.qiniu.imageUrlPrefix+item.key;
            }).filter(item=>{
              let extname = String(path.extname(item)).toLowerCase();

              // 只返回`jpg/png`后缀图片
              return extname.indexOf('.jpg')>-1||extname.indexOf('.png')>-1;
            })
          });
        })
    }
}

module.exports = ListImages.makeRouteHandler();
