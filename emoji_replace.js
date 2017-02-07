/**
 * Created by angus on 07/02/17.
 */

// import { dictionary } from 'emoji_dictionary';
const dictionary = require('./emoji_dictionary');

/*module.exports = function replaceEmoji(str) {
	return str.replace(/[\u{A9}-\u{1F6C5}]/ug, char => {
		let code = Buffer(char).readUInt16BE();

		console.log(code.toString(16));
		let result = dictionary[code];
		return result ? result : char;
	});
};*/

module.exports = function replaceEmoji(str) {
	for (let i = 0; i < str.length; i++) {
		let charCode = str.charCodeAt(i);

		if (charCode >= 0xA9 && charCode <= 0x1F6C5) {

		}
	}
};