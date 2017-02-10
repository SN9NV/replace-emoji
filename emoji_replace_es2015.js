'use strict';

function replaceEmoji(str, fill, omitSkinColour) {
	fill = fill || false;
	omitSkinColour = omitSkinColour || false;

	if (omitSkinColour) {
		str = str.replace(/(?:\uD83C[\uDFFB-\uDFFF])/g, '');
	}

	var newStr = '';

	for (var i = 0; i < str.length;) {
		var localDict = dictionary;
		var j = i;
		var char = str.charCodeAt(j);

		while (localDict.hasOwnProperty(char)) {
			localDict = localDict[char];
			char = str.charCodeAt(++j);
		}

		if (localDict.name) {
			if (fill) {
				newStr += str.slice(i, j) + '(' + localDict.name + ')';
			} else {
				newStr += '(' + localDict.name + ')';
			}
		} else {
			newStr += str[i];
		}

		i += j - i || 1;
	}

	return newStr;
}
