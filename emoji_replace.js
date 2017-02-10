/**
 * Created by angus on 07/02/17.
 */

const dictionary = JSON.parse(require('fs').readFileSync('emoji_dictionary.json'));

module.exports = function replaceEmoji(str, fill, omitSkinColour) {
	fill = fill || false;
	omitSkinColour = omitSkinColour || false;

	if (omitSkinColour) {
		str = str.replace(/[\u{1F3FB}\u{1F3FC}\u{1F3FD}\u{1F3FE}\u{1F3FF}]/ug, '');
	}

	let newStr = '';

	for (let i = 0; i < str.length;) {
		let localDict = dictionary;
		let j = i;
		let char = str.charCodeAt(j);

		while (localDict.hasOwnProperty(char)) {
			localDict = localDict[char];
			char = str.charCodeAt(++j);
		}

		if (localDict.name) {
			if (fill) {
				newStr += `${str.slice(i, j)}(${localDict.name})`;
			} else {
				newStr += `(${localDict.name})`;
			}
		} else {
			newStr += str[i];
		}

		i += j - i || 1;
	}

	return newStr;
};