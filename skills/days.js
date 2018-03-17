//
// Main functionality
//
var now = new Date();
var methods = require('./../methods.js');
var chrono = require('chrono-node');

module.exports = function (controller) {

    controller.hears('(.*)', 'direct_mention, direct_message', function (bot, message) {
        console.log(message.text);
        //var test = chrono.parse(message.text)[0].start;
        var chrono_obj = chrono.parse(message.text)[0];
        console.log(chrono_obj);
        var day = chrono_obj.start.knownValues.day;
        var month = chrono_obj.start.knownValues.month;

        if (validateDay(day) && validateMonth(month)){
          month = reformat(month);
          day = reformat(day);
          date = month + "/" + day;
          methods.processQuery(date, function(text){
            bot.reply(message, text);
          });
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
