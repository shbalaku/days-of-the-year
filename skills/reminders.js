//
// Reminders functionality
//

var methods = require('./../methods.js');

module.exports = function (controller) {

    controller.hears('remind (.*)', 'direct_mention, direct_message', function (bot, message) {
        var query = message.match[1];
        var personId = message.raw_message.actorId;
        var email = message.raw_message.data.personEmail;
        var day = "March 6th";
        console.log(email);

        var client = methods.createClient();
        client.connect(function(err) {
          if (err) throw err;
          client.query('INSERT INTO reminders VALUES ($1, $2, $3, $4);', [email, personId, day, query], function(err) {
            if (err) throw err;
            client.end(function(err) {
              if (err) throw err;
            });
          });
        });
    });
}
