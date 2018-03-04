//
// Main functionality
//

var now = new Date();
var methods = require('./methods.js');

module.exports = function (controller) {

    controller.hears('today', 'direct_mention, direct_message', function (bot, message) {
        date = encodeToday();
        // process date query
        methods.processQuery(date, bot, message);
    });
}

function encodeToday() {
  var d;
  if (now.getMonth()+1<10)
      mon = '0'+(now.getMonth()+1).toString();
  else
      mon = (now.getMonth()+1).toString();
  if (now.getDate()<10)
      day = '0'+now.getDate().toString();
  else
      day = now.getDate().toString();
  d = mon + "/" + day;

  return d;
}
