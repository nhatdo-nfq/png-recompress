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
	let temporaryFile;
	let lastResult;
	const results = [];
	const qualities = [max, min];

	const medium = (min + max) / 2;
	const mediumMax = (medium + max) / 2;
	const mediumMin = (medium + min) / 2;

	if (medium !== min && medium !== max) {
		qualities.push(medium);
	}

	if (mediumMax !== min && mediumMax !== max) {
		qualities.push(mediumMax);
	}

	if (mediumMin !== min && mediumMin !== max) {
		qualities.push(mediumMin);
	}

	console.log(qualities);

	for await (const quality of qualities) {
		console.log('Compressing image with quality: ' + quality);
		temporaryFile = `./tmp/test-${quality}.png`;
		if (fs.existsSync(temporaryFile)) {
			fs.unlinkSync(temporaryFile);
		}

		try {
			await execa(pngquant.path(), ['--quality', `${quality}-${quality}`, input, '--output', temporaryFile]);
			results.push(temporaryFile);
		} catch (error) {
			if (error.exitCode !== 99) {
				console.log(error);
			}
		}
	}

	if (results.length > 0) {
		const {stdout} = await execa(dssim.path(), [input].concat(results));
		console.log('Comparing Images: ' + JSON.stringify(results));
		const rs = stdout.split('\n');

		console.log('Comparing Images Result: ' + JSON.stringify(rs));

		rs.forEach(item => {
			item = item.split('\t');
			if (!lastResult || lastResult[0] >= item[0]) {
				lastResult = item;
			}
		});
	}

	if (lastResult) {
		fs.copyFileSync(lastResult[1], output);
	}

	for await (const quality of qualities) {
		console.log('Removing temporary files...');
		temporaryFile = `./tmp/test-${quality}.png`;
		if (fs.existsSync(temporaryFile)) {
			fs.unlinkSync(temporaryFile);
		}
	}
};

module.exports = {
	pngquant,
	dssim,
	pngRecompress
};
