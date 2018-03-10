//
// Search functionality
//
var request = require('request');
var JSSoup = require('jssoup').default;
var fuzzy = require('fuzzy');
var methods = require('./../methods.js');

module.exports = function (controller) {

    controller.hears('when is (.*)', 'direct_mention, direct_message', function (bot, message) {

        //var results = [];
        var query = message.match[1];
        client = methods.createClient();
        client.connect(function(err) {
          client.query('SELECT days FROM cache;', function(err,res){
            client.end(function(err){
              var count = res.rows.length;
              for (var i = 0; i < count; i++) {
                console.log(res.rows[i]);
              }
            });
          });
        });
        /*
        console.log(query);
        methods.cacheLookupDay(query, function(date) {
          var text = date + ' will be ' + query + '!';
          bot.reply(message, text);
        });
        */
        /*
        var query_encode = encodeURI(query);
        uri_str = 'https://www.daysoftheyear.com/search/'+query_encode+'/';

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
                    var day_message = _soup.find('h1', 'banner__title');
                    result = date.text + ' ' + day_message.text;
                    bot.reply(message, result);
                  }
                });
              }
              else {
                // no exact match found
                var query_split = query.split(" ");
                var list = [];
                for (var i = 0; i < days_list.length; i++) {
                  list[i] = days_list[i].text;
                }
                for (var i = 0; i < query_split.length - 1; i++) {
                  var word_i = query_split[i];
                  var results = fuzzy.filter(word_i, list);
                  var matches = results.map(function(el) { return el.string; });
                  if (matches != [])
                    break;
                }

                // bot reply all matches found
                var response = "**I found the following matching day(s):**\n\n";
                var size = matches.length;
                var completed_requests = 0;
                if (size > 0) {
                  for (var i = 0; i < size; i++) {
                    link = days_list[i].nextElement.attrs.href;
                    GetMatchAttributes(link, function(result) {
                      completed_requests++;
                      response = response + result;
                      if (completed_requests == size) {
                        bot.reply(message, response);
                      }
                    });
                  }
                }
                else {
                  bot.reply(message, "It seems the day you've tried to search for could not be found.");
                }
              }
            }
            else{
              bot.reply(message, "It seems the day you've tried to search for could not be found.");
            }
          }
        });*/
    });
}

function pageSearch(uri) {
  var search_res;
  request(uri, function(err, resp, html) {
    if (!err){
      var soup = new JSSoup(html);
      var date = soup.find('div', 'banner__title banner__title-small');
      var day_message = soup.find('h1', 'banner__title');
      search_res = date + day_message;
      return search_res;
    }
  });
}

function GetMatchAttributes(link, callback) {
  request(link, function(_err, _resp, _html) {
    if (!_err){
      var _soup = new JSSoup(_html);
      var date = _soup.find('div', 'banner__title banner__title-small');
      var day_message = _soup.find('h1', 'banner__title');
      var result = "\n" + date.text + ' ' + day_message.text + "\n";
      callback(result);
    }
  });
}
