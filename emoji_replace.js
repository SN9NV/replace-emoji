/**
 * Created by angus on 07/02/17.
 */

const fs = require('fs');

const dictionary = JSON.parse(fs.readFileSync('emoji_dictionary.json'));

module.exports = function replaceEmoji(string, fill=false, omitSkinColour=false) {
	if (omitSkinColour) {
		string = string.replace(/[\u{1F3FB}\u{1F3FC}\u{1F3FD}\u{1F3FE}\u{1F3FF}]/ug, '');
	}

	const str = new Buffer(string);
	let newStr = '';

	for (let i = 0; i < str.length;) {
		let localDict = dictionary;
		let j = i;
		let char = str[j];

		while (localDict.hasOwnProperty(char)) {
			localDict = localDict[char];
			char = str[++j];
		}

		if (localDict.name) {
			if (fill) {
				newStr += `${str.slice(i, j)}(${localDict.name})`;
			} else {
				newStr += `(${localDict.name})`;
			}
		} else {
			newStr += str.slice(i, i+1);
		}

		if (str[j] === 0xEF && str[j+1] === 0xB8 && str[j+2] === 0x8F) {
			j += 3;
		} // 0xFE0FF (EF B8 8F) sometimes used as padding on twitter

		i += j - i || 1;
	}

	return newStr;
};