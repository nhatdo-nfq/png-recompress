'use strict';
const path = require('path');
const BinWrapper = require('bin-wrapper');
const fs = require('fs');

const urlPngquant = 'https://github.com/nhatdo-nfq/pngquant/releases/latest/download/';
const urlDssim = 'https://github.com/nhatdo-nfq/dssim/releases/latest/download/';

const pngquant = new BinWrapper()
  .src(`${urlPngquant}osx-pngquant`, 'darwin')
  .src(`${urlPngquant}linux-pngquant`, 'linux')
  .dest(path.resolve(__dirname, '../vendor'))
  .use((process.platform == 'linux') ? `${process.platform}-pngquant` : 'osx-pngquant');

const dssim = new BinWrapper()
  .src(`${urlDssim}osx-dssim`, 'darwin')
  .src(`${urlDssim}linux-dssim`, 'linux')
  .dest(path.resolve(__dirname, '../vendor'))
  .use((process.platform == 'linux') ? `${process.platform}-dssim` : 'osx-dssim');

const pngRecompress = function (min, max, input, output) {
  let lastResult;
  let tmpOutput = path.basename(output);

  for (let i = max; max >= min; i -= 5) {
    pngquant.run([`--quanlity ${min}-${i}`, input, `../tmp/${tmpOutput}`])
    let result = dssim.run([input, `../tmp/${tmpOutput}`])

    console.log("SSIM Result: " + result);
    console.log("SSIM Last Result: " + lastResult);

    if (lastResult && lastResult <= result) {
      // fs.renameSync(tmpOutput, output);
    } else {
      lastResult = result
    }
  }
}

module.exports = {
  pngquant: pngquant,
  dssim: dssim,
  pngRecompress: pngRecompress,
}
