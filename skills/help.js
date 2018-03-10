//
// Command: help
//
module.exports = function (controller) {

    controller.hears('help', 'direct_message,direct_mention', function (bot, message) {
        var text = "Here are my skills:";
        text += "\n- " + bot.appendMention(message, "today") + ": ask for list of today's events";
        text += "\n- " + bot.appendMention(message, "tomorrow") + ": ask for list of tomorrow's events";
        text += "\n- " + bot.appendMention(message, "yesterday") + ": ask for list of yesterday's events";
        text += "\n- " + bot.appendMention(message, "<dd><mm>") + ": ask for list of events on <dd><mm>";
        text += "\n- " + bot.appendMention(message, "when is <day>") + ": ask when <day> is";
        text += "\n- " + bot.appendMention(message, "remind <day>") + ": ask to remind you of <day>";
        text += "\n\nI also understand:";
        text += "\n- " + bot.appendMention(message, "help") + ": spreads the word about my skills";
        bot.reply(message, text);
    });
}
