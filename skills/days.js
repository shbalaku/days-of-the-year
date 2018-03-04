//
// Main functionality
//
var request = require('request');
var JSSoup = require('jssoup').default;
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
          [date_format1, date_format2] = methods.formatDate(date);

          methods.cacheLookup(date_format1, function(res) {
            if (res != 0) {
              console.log("Cache lookup successful");
              // store last output
              methods.storeLastOutput(date_format1, res, function(client) {
                client.end(function(err) {
                  if (err) throw err;
                  var date_message = "**"+date_format1+"**";
                  var output_list=date_message + '\n';
                  for (var i=0; i<res.length; i++){
                    output_list = output_list + '\n* ' + res[i];
                  }
                  bot.reply(message, output_list);
                });
              });
            }
            else {
              console.log("Cache lookup unsuccessful");

              year = now.getFullYear().toString();
              uri_str = 'https://www.daysoftheyear.com/days/'+year+'/'+date;

              var results = [];

              request(uri_str, function(err, resp, html) {
                if (!err){
                  var soup = new JSSoup(html);
                  var days_list = soup.findAll('h3', 'card-title');
                  var days_list2 = soup.findAll('h4', 'card-title-secondary');
                  for (var i = 0; i < days_list2.length; i++) {
                    if (((days_list2[i].text).indexOf(date_format1)>-1) || ((days_list[i].text).indexOf(date_format2)>-1)) {
                      results = results.concat(days_list[i].text);
                    }
                  }
                  if (results.length == 0)
                    bot.reply(message, "Something went wrong. Please check you have entered a valid date. Thank you. Sorry this happened...awkward.");
                  else {
                    // store last output
                    methods.storeLastOutput(date_format1, results, function(client) {
                      methods.storeInCache(client, date_format1, results, function() {
                        // end connection
                        client.end(function(err) {
                          if (err) throw err;
                          // results is an array consisting of messages collected during execution
                          var date_message = "**"+date_format1+"**";
                          var output_list=date_message + '\n';
                          for (var i=0; i<results.length; i++){
                            output_list = output_list + '\n* ' + results[i];
                          }
                          // bot reply
                          bot.reply(message, output_list);
                        });
                      });
                    });
                  }
                }
              });
            }
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
