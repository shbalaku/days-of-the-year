//
// Tomorrow functionality
//
var now = new Date();
var methods = require('./../methods.js');

module.exports = function (controller) {

    controller.hears('tomorrow', 'direct_mention, direct_message', function (bot, message) {
        date = encodeTomorrow();
        // process date query
        methods.processQuery(date, function(text){
          bot.reply(message, text);
        });
    });
}

function encodeTomorrow() {
  var d;
  var tomorrow = new Date();
  tomorrow.setDate(now.getDate()+1);

  if (tomorrow.getMonth()+1<10)
      mon = '0'+(tomorrow.getMonth()+1).toString();
  else
      mon = (tomorrow.getMonth()+1).toString();
  if (tomorrow.getDate()<10)
      day = '0'+tomorrow.getDate().toString();
  else
      day = tomorrow.getDate().toString();
  d = mon + "/" + day;

  return d;
}
