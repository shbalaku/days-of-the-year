//
// Command: help
//
module.exports = function (controller) {

    controller.hears('help', 'direct_message,direct_mention', function (bot, message) {
        var text = "Here are my skills:";
        text += "\n- Ask me about any day for list of events on that day e.g. what is happening on March 17th?, two days from now, today, tomorrow";
        text += "\n- " + bot.appendMention(message, "when is <day>") + ": ask about when a certain day is, e.g. when is pina colada day";
        text += "\n- " + bot.appendMention(message, "remind <day>") + ": ask me to remind about a certain day e.g. remind pina colada day";
        text += "\n\nI also understand:";
        text += "\n- " + bot.appendMention(message, "help") + ": spreads the word about my skills";
        bot.reply(message, text);
    });
}
