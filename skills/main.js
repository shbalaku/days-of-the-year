//
// Main script
//
var methods = require('./../methods.js');
var chrono = require('chrono-node');


module.exports = function (controller) {
    //
    // Command: help
    //
    controller.hears('help', 'direct_message,direct_mention', function (bot, message) {
        var text = "Here are my skills:";
        text += "\n- Ask me about any day for list of events on that day e.g. what is happening on March 17th?, two days from now, today, tomorrow";
        text += "\n- " + bot.appendMention(message, "when is <day>") + ": ask about when a certain day is, e.g. when is pina colada day";
        text += "\n- " + bot.appendMention(message, "remind <day>") + ": ask me to remind about a certain day e.g. remind pina colada day";
        text += "\n\nI also understand:";
        text += "\n- " + bot.appendMention(message, "help") + ": spreads the word about my skills";
        bot.reply(message, text);
    });

    //
    // Retrive last output functionality
    //

    controller.hears('last output', 'direct_mention, direct_message', function (bot, message) {

      // Establish client POSTGRESQL
      var client = methods.createClient();

      client.connect(function(err) {
        if (err) throw err;

        // execute query
        client.query('SELECT * FROM lastOutput;', function(err, res) {
            if (err) throw err;

            client.end(function(err) {
              if (err) throw err;
            });

            // process results
            var date = res.rows[0].date;
            var days = res.rows[0].days;
            var date_message = "**"+date+"**";
            var output_list=date_message + '\n';
            for (var i=0; i<days.length; i++){
              output_list = output_list + '\n* ' + days[i];
            }
            bot.reply(message, output_list);

          });
        });
      });

      //
      // Reminders functionality
      //

      controller.hears('remind (.*)', 'direct_mention, direct_message', function (bot, message) {
          var query = message.match[1];
          //var personId = message.raw_message.actorId;
          var email = message.raw_message.data.personEmail;

          methods.searchDay(query, bot, message, function(date, day) {
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

      //
      // Search functionality
      //

      controller.hears('when is (.*)', 'direct_mention, direct_message', function (bot, message) {

          //var results = [];
          var query = message.match[1];
          // try find exact match
          methods.findExactMatch(query, function(res){
            if (res != 0) {
              console.log('Exact match found');
              var text = res.date + ' will be ' + res.day + '!';
              bot.reply(message, text);
            }
            else {
              console.log('Could not find exact match');
              // website search
              methods.websiteSearch(query, function(text) {
                bot.reply(message, text);
              });
            }
          });
      });

      //
      // Retrive cache functionality
      //

      controller.hears('cache (.*)', 'direct_mention, direct_message', function (bot, message) {

        var query = message.match[1];

        // Establish client POSTGRESQL
        var client = methods.createClient();

        client.connect(function(err) {
          if (err) throw err;

          // execute query
          var value = [query];
          client.query('SELECT * FROM cache WHERE days @> $1;', [value], function(err, res) {
              if (err) throw err;

              // process results
              var row_count = res.rows.length;
              if (row_count > 0) {
                var date = res.rows[0].date;
                var output_list = query + " is celebrated on " + "**"+date+"**";
                // end connection
                client.end(function(err) {
                  if (err) throw err;
                  bot.reply(message, output_list);
                });
              }
              else {
                client.query('SELECT * FROM cache WHERE date = $1;', [query], function(err, res) {
                  var row_count = res.rows.length;
                  if (row_count > 0) {
                    var date = res.rows[0].date;
                    var days = res.rows[0].days;
                    var date_message = "**"+date+"**";
                    var output_list=date_message + '\n';
                    for (var i=0; i<days.length; i++){
                      output_list = output_list + '\n* ' + days[i];
                    }
                    // end connection
                    client.end(function(err) {
                      if (err) throw err;
                      bot.reply(message, output_list);
                    });
                  }
                  else {
                    // end connection
                    client.end(function(err) {
                      if (err) throw err;
                      bot.reply(message, "It seems the day you've tried to search for could not be found in the cache.");
                    });
                  }
                });
              }
            });
          });
        });

        //
        // Main days functionality
        //

        controller.hears('(.*)', 'direct_mention, direct_message', function (bot, message) {
            // nlp parsing
            var chrono_obj = chrono.parse(message.text)[0];
            if (chrono_obj != undefined) {
              var date = chrono_obj.start.date();
              var day = methods.reformat(date.getDate());
              var month = methods.reformat(date.getMonth()+1);
              date = month + "/" + day;
              methods.processQuery(date, function(text){
                bot.reply(message, text);
              });
            }
        });
}
