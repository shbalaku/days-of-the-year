//
// Command: who stole the cinnamon bun
//
module.exports = function (controller) {

    controller.hears('who stole the cinnamon bun', 'direct_message,direct_mention', function (bot, message) {
        var text = "The cleaner."
        bot.reply(message, text);
    });
}
