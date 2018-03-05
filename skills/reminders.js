//
// Reminders functionality
//

var request = require('request');
var JSSoup = require('jssoup').default;
var methods = require('./../methods.js');

module.exports = function (controller) {

    controller.hears('remind (.*)', 'direct_mention, direct_message', function (bot, message) {
        var query = message.match[1];
        var personId = message.raw_message.actorId;
        var email = message.raw_message.data.personEmail;
        console.log(email);

        searchDay(query, function(day) {
          console.log(day);
          /*
          var client = methods.createClient();
          client.connect(function(err) {
            if (err) throw err;
            client.query('INSERT INTO reminders VALUES ($1, $2, $3, $4);', [email, personId, day, query], function(err) {
              if (err) throw err;
              client.end(function(err) {
                if (err) throw err;
              });
            });
          });*/
        });
    });
}

function searchDay(query, callback) {
  var query_encode = encodeURI(query);
  var uri_str = 'https://www.daysoftheyear.com/search/'+query_encode+'/';
  // request html of day page
  request(uri_str, function(err, resp, html) {
    if (!err){
      var match = query.toUpperCase();
      var soup = new JSSoup(html);
      var days_list = soup.findAll('h3', 'card-title');
      if (days_list.length > 0){
        var link = '';
        for (var i = 0; i < days_list.length; i++) {
          var res = methods.convertString(days_list[i].text).toUpperCase();
          if (res == match){
            link = days_list[i].nextElement.attrs.href;
            break;
          }
        }
        if (link != ''){
          // exact match found
          var result;
          request(link, function(_err, _resp, _html) {
            if (!_err){
              var _soup = new JSSoup(_html);
              var date = _soup.find('div', 'banner__title banner__title-small');
              callback(date.text);
            }
          });
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
