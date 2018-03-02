//
// Main functionality
//
var fs = require('fs');

module.exports = function (controller) {

    controller.hears('last output', 'direct_mention, direct_message', function (bot, message) {
      var content;
      fs.readFile('lastOutput.txt', function read(err, data) {
          if (err) {
              throw err;
          }
          content = data;
          var output_list = 'Last output: \n';
          output_list = output_list + data;
          bot.reply(message, output_list);
      });
    });
}
