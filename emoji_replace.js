/**
 * Created by angus on 07/02/17.
 */

const fs = require('fs');

const dictionary = JSON.parse(fs.readFileSync('emoji_dictionary.json'));

module.exports = function replaceEmoji(string, fill=false) {
	const str = new Buffer(string);
	let newStr = '';

	for (let i = 0; i < str.length;) {
		let localDict = dictionary;
		let j = 0;
		let char = str[i];

		while (localDict.hasOwnProperty(char)) {
			localDict = localDict[char];
			char = str[i + ++j];
		}

		if (localDict.name) {
			if (fill) {
				newStr += `${str.slice(i, i+j)}(${localDict.name})`;
			} else {
				newStr += `(${localDict.name})`;
			}
		} else {
			newStr += str.slice(i, i+1);
		}

		console.log(str.slice(i + j, i + j + 1));
		if (str.slice(i + j, i + j + 3).readUInt32LE() === 0xFE0F) j += 3; // 0xFE0FF sometimes used as padding

		i += j || 1;
	}

	return newStr;
};