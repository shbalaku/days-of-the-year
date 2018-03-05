//
// Reminders functionality
//

module.exports = function (controller) {

    controller.hears('remind (.*)', 'direct_mention, direct_message', function (bot, message) {
        var query = message.match[1];
        var personId = message.raw_message.actorId;
        var email = message.raw_message;
        console.log(email);
    });
}
