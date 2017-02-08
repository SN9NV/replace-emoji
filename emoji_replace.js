/**
 * Created by angus on 07/02/17.
 */

// import { dictionary } from 'emoji_dictionary';
const fs = require('fs');

const dictionary = JSON.parse(fs.readFileSync('emoji_dictionary.json'));

/*module.exports = function replaceEmoji(str) {
	return str.replace(/[\u{A9}-\u{1F6C5}]/ug, char => {
		let code = Buffer(char).readUInt16BE();

		console.log(code.toString(16));
		let result = dictionary[code];
		return result ? result : char;
	});
};*/

module.exports = function replaceEmoji(str) {
	let minMax = getMinMaxKeys(dictionary);

	let newStr = '';

	for (let i = 0; i < str.length; i++) {
		let charCode = str.codePointAt(i);

		if (charCode >= minMax[0] && charCode <= minMax[1] && dictionary.hasOwnProperty(charCode)) {
			let localDict = dictionary;

			while (localDict.hasOwnProperty(charCode)) {
				localDict = localDict[charCode];
				charCode = str.codePointAt(i++);
			}

			newStr += localDict.name ? `(${localDict.name})` : str.slice(i, 1);
		} else {
			newStr += str.slice(i, i+1);
		}
	}

	return newStr;
};

function getMinMaxKeys(obj) {
	let keys = Object.keys(obj).sort((a, b) => parseInt(a) - parseInt(b));
	return [keys[0], keys.pop()];
}