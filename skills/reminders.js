//
// Reminders functionality
//

var request = require('request');
var JSSoup = require('jssoup').default;
var methods = require('./../methods.js');

module.exports = function (controller) {

    controller.hears('remind (.*)', 'direct_mention, direct_message', function (bot, message) {
        var query = message.match[1];
        //var personId = message.raw_message.actorId;
        var email = message.raw_message.data.personEmail;

        searchDay(query, bot, message, function(date, day) {
          var client = methods.createClient();
          client.connect(function(err) {
            if (err) throw err;
            client.query('SELECT * FROM reminders WHERE email = $1 AND day = $2;', [email, day], function(err, res) {
              if (err) throw err;
              if (res.rows.length == 0){
                client.query('INSERT INTO reminders VALUES ($1, $2, $3);', [email, date, day], function(err) {
                  if (err) throw err;
                  client.end(function(err) {
                    if (err) throw err;
                    var text = "You will be reminded about " + day + " on " + date + ".";
                    bot.reply(message, text);
                  });
                });
              }
              else {
                client.end(function(err) {
                  if (err) throw err;
                  var text = "You already have a reminder set for " + day + " on " + date + ".";
                  bot.reply(message, text);
                });
              }
            });
          });
        });
    });
}

function searchDay(query, bot, message, callback) {
  var query_encode = encodeURI(query);
  var uri_str = 'https://www.daysoftheyear.com/search/'+query_encode+'/';
  // request html of day page
  request(uri_str, function(err, resp, html) {
    if (!err){
      var match = query.toUpperCase();
      var soup = new JSSoup(html);
      var days_list = soup.findAll('h3', 'card-title');
      var date_list = soup.findAll('h4', 'card-title-secondary');
      if (days_list.length > 0){
        var date = '';
        var day;
        for (var i = 0; i < days_list.length; i++) {
          var res = methods.convertString(days_list[i].text).toUpperCase();
          if (res == match){
            date = date_list[i].contents[0].nextElement.nextElement._text;
            day = days_list[i].text;
            break;
          }
        }
        if (date != ''){
          // exact match found
          callback(date.trim(), day);
        }
        else {
          // no exact match found so retrieve first similar result from search - to be added
          bot.reply(message, "It seems the day you've tried to search for could not be found.");
        }
      }
      else{
        bot.reply(message, "It seems the day you've tried to search for could not be found.");
      }
    }
  });
}
