/**
 * Created by angus on 07/02/17.
 */

const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

const getFromFile = true;

if (getFromFile) {
	fs.readFile('emoji-list.html', null, (error, data) => {
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
			console.log(`Code: ${codes}\tName: ${name}`);

			if (codes.length > 1) {
				let lastKeyIndex = codes.length - 1;

				for (let i = 0; i < lastKeyIndex; i++) {

				}
			} else {
				dictionary[codes] = {
					name: name,
					keys: false
				};
			}
		}
	});

	fs.writeFileSync('emoji_dictionary.json', JSON.stringify(dictionary, null, 2));
}