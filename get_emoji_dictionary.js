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
			console.log('Trying to download the page');
			downloadPage();
		}
	});
} else {
	downloadPage();
}

function downloadPage() {
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
		let codes = $(element).find('td.code a').text();
		let name = $(element).find('td.name').text();

		if (codes && name) {
				dictionary = unicode2dictionary(codes.split(' '), name, dictionary);

				codes = rip(codes, /U\+FE0F /ig);
				codes = codes.split(' ');
				dictionary = unicode2dictionary(codes, name, dictionary);
		}
	});

	fs.writeFileSync('emoji_dictionary.json', JSON.stringify(dictionary, null, 2));
}

function unicode2dictionary(codes, name, dictionary) {
	/*if (typeof codes === 'object') {
		codes = codes.map(code => convertCharStr2UTF8(convertUnicode2Char(code)).split(' '));
		codes = codes.reduce((a, b) => a.concat(b));
	} else {
		codes = convertCharStr2UTF8(convertUnicode2Char(codes)).split(' ');
	}*/

	if (typeof codes === 'object') {
	 	codes = codes.map(code => {
	 		let chars = [];
	 		let char = convertUnicode2Char(code);
	 		for (let index = 0; index < char.length; index++) {
	 			chars.push(char.charCodeAt(index));
			}
	 		return chars;
		});
	 	codes = codes.reduce((a, b) => a.concat(b));
	 } else {
	 	codes = [convertUnicode2Char(codes).charCodeAt(0)];
	 }

	// codes = codes.map(code => parseInt(code, 16));
	console.log(`Code: ${codes}\tName: ${name}`);

	assignNested(dictionary, codes, { name: name });

	return dictionary;
}

function rip(string, regex) {
	return string.replace(regex, '');
}

function assignNested(base, keys, value) {
	const lastKey = keys.pop();
	const lastObj = keys.reduce((obj, key) => obj[key] = obj[key] || {}, base);

	lastObj[lastKey] = value;
}

function convertUnicode2Char(str) {
	// converts a string containing U+... escapes to a string of characters
	// str: string, the input

	// first convert the 6 digit escapes to characters
	str = str.replace(/[Uu]\+10([A-Fa-f0-9]{4})/g, (matchstr, parens) => hex2char('10' + parens));
	// next convert up to 5 digit escapes to characters
	str = str.replace(/[Uu]\+([A-Fa-f0-9]{1,5})/g, (matchstr, parens) => hex2char(parens));
	return str;
}

function hex2char(hex) {
	// converts a single hex number to a character
	// note that no checking is performed to ensure that this is just a hex number, eg. no spaces etc
	// hex: string, the hex codepoint to be converted
	let result = '';
	let n = parseInt(hex, 16);
	if (n <= 0xFFFF) {
		result += String.fromCharCode(n);
	} else if (n <= 0x10FFFF) {
		n -= 0x10000;
		result += String.fromCharCode(0xD800 | (n >> 10)) + String.fromCharCode(0xDC00 | (n & 0x3FF));
	}
	return result;
}

function convertCharStr2UTF8(str) {
	// Converts a string of characters to UTF-8 byte codes, separated by spaces
	// str: sequence of Unicode characters
	let highsurrogate = 0;
	let suppCP;
	// decimal code point value for a supp char
	let outputString = '';
	for (let i = 0; i < str.length; i++) {
		let cc = str.charCodeAt(i);
		if (cc < 0 || cc > 0xFFFF) {
			outputString += '!Error in convertCharStr2UTF8: unexpected charCodeAt result, cc=' + cc + '!';
		}
		if (highsurrogate != 0) {
			if (0xDC00 <= cc && cc <= 0xDFFF) {
				suppCP = 0x10000 + ((highsurrogate - 0xD800) << 10) + (cc - 0xDC00);
				outputString += ' ' + dec2hex2(0xF0 | ((suppCP >> 18) & 0x07)) + ' ' + dec2hex2(0x80 | ((suppCP >> 12) & 0x3F)) + ' ' + dec2hex2(0x80 | ((suppCP >> 6) & 0x3F)) + ' ' + dec2hex2(0x80 | (suppCP & 0x3F));
				highsurrogate = 0;
				continue;
			} else {
				outputString += 'Error in convertCharStr2UTF8: low surrogate expected, cc=' + cc + '!';
				highsurrogate = 0;
			}
		}
		if (0xD800 <= cc && cc <= 0xDBFF) {
			// high surrogate
			highsurrogate = cc;
		} else {
			if (cc <= 0x7F) {
				outputString += ' ' + dec2hex2(cc);
			} else if (cc <= 0x7FF) {
				outputString += ' ' + dec2hex2(0xC0 | ((cc >> 6) & 0x1F)) + ' ' + dec2hex2(0x80 | (cc & 0x3F));
			} else if (cc <= 0xFFFF) {
				outputString += ' ' + dec2hex2(0xE0 | ((cc >> 12) & 0x0F)) + ' ' + dec2hex2(0x80 | ((cc >> 6) & 0x3F)) + ' ' + dec2hex2(0x80 | (cc & 0x3F));
			}
		}
	}
	return outputString.substring(1);
}

function dec2hex2(textString) {
	let hexequiv = ["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F"];
	return hexequiv[(textString >> 4) & 0xF] + hexequiv[textString & 0xF];
}
