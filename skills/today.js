//
// Main functionality
//

var now = new Date();
var methods = require('./../methods.js');

module.exports = function (controller) {

    controller.hears('today', 'direct_mention, direct_message', function (bot, message) {
        date = methods.encodeToday();
        // process date query
        methods.processQuery(date, bot, message);
    });
}
