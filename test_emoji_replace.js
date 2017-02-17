/**
 * Created by angus on 07/02/17.
 */

const replaceEmoji = require('./emoji_replace');

console.log(replaceEmoji('Broke up with my BF 💔'));
console.log(replaceEmoji('😍😍😍'));
console.log(replaceEmoji('😁😂😁Lol😂😂. Those socks are amazing'));
console.log(replaceEmoji('I hate my life 😑 Such disrespect 😂😂😂'));
console.log(replaceEmoji('asda1⃣asdasd'));
console.log(replaceEmoji('0⃣1⃣2⃣3⃣4⃣5⃣6⃣7⃣8⃣9⃣🔟#⃣*⃣‼️yes'));
console.log(replaceEmoji('0 ️ ⃣'));
console.log(replaceEmoji('💇🏾', false, true));
console.log(replaceEmoji('👩🏽‍🏫'));
