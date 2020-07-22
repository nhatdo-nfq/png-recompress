'use strict';
const path = require('path');
const BinWrapper = require('bin-wrapper');
const fs = require('fs');
const execa = require('execa');

const urlPngquant = 'https://github.com/nhatdo-nfq/pngquant/releases/latest/download/';
const urlDssim = 'https://github.com/nhatdo-nfq/dssim/releases/latest/download/';

const pngquant = new BinWrapper()
  .src(`${urlPngquant}osx-pngquant`, 'darwin')
  .src(`${urlPngquant}linux-pngquant`, 'linux')
  .dest(path.resolve(__dirname, '../vendor'))
  .use((process.platform === 'linux') ? `${process.platform}-pngquant` : 'osx-pngquant');

const dssim = new BinWrapper()
  .src(`${urlDssim}osx-dssim`, 'darwin')
  .src(`${urlDssim}linux-dssim`, 'linux')
  .dest(path.resolve(__dirname, '../vendor'))
  .use((process.platform === 'linux') ? `${process.platform}-dssim` : 'osx-dssim');

const pngRecompress = async function (min, max, input, output) {
  let tmpFile;
  let lastResult;
  let results = [];
  let qualities = [max, min];

  const medium = (min + max) / 2;
  const medium_max = (medium + max) / 2;
  const medium_min = (medium + min) / 2;

  if (medium !== min && medium !== max) {
    qualities.push(medium)
  }

  if (medium_max !== min && medium_max !== max) {
    qualities.push(medium_max)
  }

  if (medium_min !== min && medium_min !== max) {
    qualities.push(medium_min)
  }

  console.log(qualities)

  for await (const quality of qualities) {
    console.log("Compressing image with quality: " + quality)
    tmpFile = `./tmp/test-${quality}.png`;
    if (fs.existsSync(tmpFile)) {
      fs.unlinkSync(tmpFile);
    }
    try {
      await execa(pngquant.path(), ['--quality', `${quality}-${quality}`, input, '--output', tmpFile])
      results.push(tmpFile);
    } catch (e) {
      if (e.exitCode != 99) {
        console.log(e)
      }
    }
  }

  if (results.length > 0) {
    const {stdout} = await execa(dssim.path(), [input].concat(results));
    console.log("Comparing Images: " + JSON.stringify(results))
    let rs = stdout.split('\n');

    console.log("Comparing Images Result: " + JSON.stringify(rs))

    rs.forEach(item => {
      item = item.split('\t');

      if (!lastResult || lastResult[0] >= item[0]) {
        lastResult = item;
      }

    })
  }
  if (lastResult) {
    fs.copyFileSync(lastResult[1], output);
  }
}

module.exports = {
  pngquant: pngquant,
  dssim: dssim,
  pngRecompress: pngRecompress,
}
