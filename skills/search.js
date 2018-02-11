//
// Search functionality
//
var request = require('request');
var JSSoup = require('jssoup').default;
var fuzzy = require('fuzzy')

module.exports = function (controller) {

    controller.hears('when is (.*)', 'direct_mention, direct_message', function (bot, message) {

        var results = [];
        var query = message.match[1];
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
                var res = convertString(days_list[i].text).toUpperCase();
                if (res == match){
                  link = days_list[i].nextElement.attrs.href;
                  break;
                }
              }
              if (link != ''){
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
                bot.reply(message, "**We found the following matching day(s):**\n\n");
                for (var i = 0; i < matches.length && i<=5; i++) {
                  link = days_list[i].nextElement.attrs.href;
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
              }
            }
            else{
              bot.reply(message, "It seems the day you've tried to search for could not be found.");
            }
          }
        });
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

function convertString(phrase) {
    var maxLength = 100;

    var returnString = phrase.toLowerCase();
    //Convert Characters
    returnString = returnString.replace(/ö/g, 'o');
    returnString = returnString.replace(/ç/g, 'c');
    returnString = returnString.replace(/ş/g, 's');
    returnString = returnString.replace(/ı/g, 'i');
    returnString = returnString.replace(/ğ/g, 'g');
    returnString = returnString.replace(/ü/g, 'u');
    returnString = returnString.replace(/ñ/g, 'n');

    // if there are other invalid chars, convert them into blank spaces
    returnString = returnString.replace(/[^a-z0-9\s-]/g, "");
    // convert multiple spaces and hyphens into one space
    returnString = returnString.replace(/[\s-]+/g, " ");
    // trims current string
    returnString = returnString.replace(/^\s+|\s+$/g,"");
    // cuts string (if too long)
    if(returnString.length > maxLength)
    returnString = returnString.substring(0,maxLength);

    return returnString;
}
