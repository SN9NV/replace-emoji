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
		let codes = $(element).find('td.code a').text();
		let name = $(element).find('td.name').text();

		if (codes && name) {
			const codesCopy = codes;
			if (/U\+FE0F/i.test(codes)) {
				codes = rip(codes, /[Uu]\+FE0F /i);
				codes = codes.split(' ');
				codes = codes.map(code => convertCharStr2UTF8(convertUnicode2Char(code))/*.replace(/ /g, '')*/.split(' '));
				codes = codes.reduce((a, b) => a.concat(b));
				codes = codes.map(code => parseInt(code, 16));
				// codes = codes.join('');
				console.log(`Code: ${codes}\tName: ${name}`);

				// dictionary[codes] = name;
				assignNested(dictionary, codes, { name: name });
			}

			codes = codesCopy;
			codes = codes.split(' ');
			codes = codes.map(code => convertCharStr2UTF8(convertUnicode2Char(code))/*.replace(/ /g, '')*/.split(' '));
			codes = codes.reduce((a, b) => a.concat(b));
			codes = codes.map(code => parseInt(code, 16));
			// codes = codes.join('');
			console.log(`Code: ${codes}\tName: ${name}`);

			// dictionary[codes] = name;
			assignNested(dictionary, codes, { name: name });
		}
	});

	fs.writeFileSync('emoji_dictionary.json', JSON.stringify(dictionary, null, 2));
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
	str = str.replace(/[Uu]\+10([A-Fa-f0-9]{4})/g, function(matchstr, parens) {
		return hex2char('10' + parens);
	});
	// next convert up to 5 digit escapes to characters
	str = str.replace(/[Uu]\+([A-Fa-f0-9]{1,5})/g, function(matchstr, parens) {
		return hex2char(parens);
	});
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
	} else {
		result += 'hex2Char error: Code point out of range: ' + dec2hex(n);
	}
	return result;
}

function convertCharStr2UTF8(str) {
	// Converts a string of characters to UTF-8 byte codes, separated by spaces
	// str: sequence of Unicode characters
	let highsurrogate = 0;
	let suppCP;
	// decimal code point value for a supp char
	let n = 0;
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