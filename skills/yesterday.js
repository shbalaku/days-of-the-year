//
// Yesterday functionality
//
var now = new Date();
var methods = require('./../methods.js');

module.exports = function (controller) {

    controller.hears('yesterday', 'direct_mention, direct_message', function (bot, message) {
        date = encodeYesterday();
        // process date query
        methods.processQuery(date, function(text){
          bot.reply(message, text);
        });
    });
}

function encodeYesterday() {
  var d;
  var yesterday = new Date();
  yesterday.setDate(now.getDate()-1);

  if (yesterday.getMonth()+1<10)
      mon = '0'+(yesterday.getMonth()+1).toString();
  else
      mon = (yesterday.getMonth()+1).toString();
  if (yesterday.getDate()<10)
      day = '0'+yesterday.getDate().toString();
  else
      day = yesterday.getDate().toString();
  d = mon + "/" + day;

  return d;
}
