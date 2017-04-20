# replace-emoji
Replaces emoji with the description of that emoji

Use `node get_emoji_doctionary` or `npm run get` to build the emoji_dictionary.json.
This file is used as the rules for replacing the emoji in the string.

emoji_replace.js is the main file, emoji_replace_es2015.js was made using babel for the use in an Angular application.

The html page used to create the dictionary to replace the emoji: http://unicode.org/emoji/charts/emoji-list.html

That's all I guess. Contribute if you want to.
There's still a lot of cases that don't convert correctly. Twitter's emoji seem to work perfectly.
