//
// Reminders functionality
//

module.exports = function (controller) {

    controller.hears('remind (.*)', 'direct_mention, direct_message', function (bot, message) {
        var query = message.match[1];
        console.log(message);
        // process date query
        //methods.processQuery(date, bot, message);
    });
}
