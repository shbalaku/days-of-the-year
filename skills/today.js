//
// Main functionality
//
var request = require('request');
var JSSoup = require('jssoup').default;
var now = new Date();
var methods = require('./methods.js');

module.exports = function (controller) {

    controller.hears('today', 'direct_mention, direct_message', function (bot, message) {

        date = encodeToday();
        [date_format1, date_format2] = methods.formatDate(date);

        // look up date in cache table
        methods.cacheLookup(date_format1, function(res) {
          if (res != 0) {
            console.log("Cache lookup successful");
            // store lastOutput
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
            var results = [];
            console.log("Cache lookup unsuccessful");

            year = now.getFullYear().toString();
            uri_str = 'https://www.daysoftheyear.com/days/'+year+'/'+date;

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
                  bot.reply(message, "Something went wrong. Sorry this happened...awkward.");
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
