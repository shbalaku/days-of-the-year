//
// Main functionality
//
var now = new Date();
var methods = require('./methods.js');

module.exports = function (controller) {

    controller.hears('(.*)/(.*)', 'direct_mention, direct_message', function (bot, message) {

        var day = message.match[1].slice(-2);
        var month = message.match[2];

        if (validateDay(day) && validateMonth(month)){
          month = reformat(month);
          day = reformat(day);
          date = month + "/" + day;
          methods.processQuery(date, bot, message);
        }
        else {
          bot.reply(message, "Something went wrong. Please check you have entered a valid date. Thank you. Sorry this happened...awkward.");
        }
    });
}

function validateDay(day){
  var day_num = parseInt(day);
  if (day_num<32 && day_num>0){
    return true;
  }
  return false;
}

function validateMonth(month){
  var month_num = parseInt(month);
  if (month_num<13 && month_num > 0){
    return true;
  }
  return false;
}

function reformat(str){
  str_num = parseInt(str);
  if (str_num<10){
    str = '0'+str_num.toString();
  }
  return str;
}
