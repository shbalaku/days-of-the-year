//
// Main functionality
//
var PythonShell = require('python-shell');
module.exports = function (controller) {

    controller.hears([".*"], 'direct_message,direct_mention', function (bot, message) {

        var arg_day = message.text;
        var options = {
            args: [arg_day],
            scriptPath: './days-of-the-year/skills/'
        };

        PythonShell.run('source.py', options, function (err, results) {
            console.log(results);
            if (err){
              bot.reply(message, "Something went wrong. Please check you have entered a valid date in the following format: xx/xx. Thank you. Sorry this happened...awkward.");
            }
            else {
              // results is an array consisting of messages collected during execution
              var date_message = "**"+results[0]+"**";
              var days_list = results.slice(1);
              var output_list=date_message + '\n';
              for (var i=0; i<days_list.length; i++){
                output_list = output_list + '\n* ' + days_list[i];
              }
              bot.reply(message, output_list);
            }
        });
    });
}
