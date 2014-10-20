/**
 * css 资源优化
 */
var fs = require('fs');
var path = require('path');

var spriter = require('ispriter');
var compressor = require('yuicompressor');
var ndir = require('ndir');
var md5 = require('./tools').md5;

var cssReg = /\s*#set\s*\(\s*\$cssList\s*=\s*\[\s*"\s*([\/]?[.\w-]+)([\/][.\w-]+)*\s*"\s*(,\s*"\s*([\/]?[.\w-]+)([\/][.\w-]+)*\s*"\s*)*\s*\]\s*\)\s*/i;
var relativePath = /\/pkg\/.*/i;
var basePath = path.resolve('../console/fe-source/resources') + '/';
var cssArr = [];
var spriteConfig = require('./sprite-config.json');

var packageCss = function( cssArr, file ) {
    var md5Part = md5( cssArr.toString() ).slice(0, 10) 
    var output = basePath + 'temp/' + md5Part + '.min.css';

    fs.exists(basePath + 'temp/', function (exists) {
        if( !exists ) {
            ndir.mkdir(basePath + 'temp/');
        }
    });

    fs.readFile(file, function( err, data ){
        if(err) throw err;
        fs.writeFile(output, cssArr, function(err){
            if(err) throw err;
            console.log('Write ' + output + ' success!')
            spriteConfig.output.combine = md5Part + '.min1.css'

            spriter.merge(spriteConfig, function(){
                var _basePath = path.resolve('../console/fe-source/resources/pkg/c') + '/';
                var _output = _basePath + md5Part + '.min.css';
                var originCont = data.toString();

                _output = _output.match( relativePath )[0].slice(1);

                var updateCont = originCont.replace(cssReg, '\r\n#set($cssList = ["' + _output + '"])\r\n');

                var fileBuf = new Buffer(updateCont);
                fs.writeFile(file, fileBuf, function(err){
                    if(err) throw err;
                    console.log('Write ' + file + ' success')
                })
            });
        })
    })
    
}

var compressCss = function( cssList, file ){
    if(!cssList | cssList.length < 1) return;

    var len = cssList.length;
    for(var i = 0; i < len; i++) {
        compressor.compress(cssList[i], {
            charset: 'utf8',
            type: 'css'
        }, function(err, data, extra) {
            if(err) throw err;
            cssArr.push( data );

            if( cssArr.length === len ) {
                packageCss( cssArr, file );
            }
        });
    }
    
}

function md5 (text) {
  return crypto.createHash('md5').update(text).digest('hex');
};

// export.compressCss = compressCss;
module.exports = {
    compressCss: compressCss
}
