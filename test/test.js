const path = require('path');
const {pngRecompress} = require('..');
const compareSize = require('compare-size');
const test = require('ava');

test('minify a JPG', async t => {
	const src = path.resolve(__dirname, './test.png');
	const dest = path.resolve(__dirname, './final.png');
	await pngRecompress(40, 80, src, dest);
	const result = await compareSize(src, dest);

	t.true(result[dest] < result[src]);
});
