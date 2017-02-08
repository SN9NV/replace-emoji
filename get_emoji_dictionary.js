/**
 * Created by angus on 07/02/17.
 */

const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

const file = 'emoji-list.html';

if (file) {
	fs.readFile(file, null, (error, data) => {
		if (!error) {
			processPage(data);
		} else {
			console.log(`Error: ${error}`);
		}
	});
} else {
	request('http://unicode.org/emoji/charts/emoji-list.html', (error, response, body) => {
		if (!error && response.statusCode == 200) {
			processPage(body);
		} else {
			console.log(`Error: ${error}`);
		}
	});
}

function processPage(page) {
	let $ = cheerio.load(page);
	let dictionary = {};

	$('table').children().each((index, element) => {
		let codes = $(element).find('td.code a').attr('name');
		let name = $(element).find('td.name').text();

		if (codes && name) {
			codes = codes.split('_');
			codes = codes.map(hex => parseInt(hex, 16));
			codes = codes.reduce((acc, cur) => {

			}, []);
			console.log(`Code: ${codes}\tName: ${name}`);

			assignNested(dictionary, codes, { name: name });
		}
	});

	fs.writeFileSync('emoji_dictionary.json', JSON.stringify(dictionary, null, 2));
}

function assignNested(base, keys, value) {
	const lastKey = keys.pop();
	const lastObj = keys.reduce((obj, key) => obj[key] = obj[key] || {}, base);

	lastObj[lastKey] = value;
}