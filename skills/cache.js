//
// Retrive cache functionality
//

const { Client } = require('pg');

module.exports = function (controller) {

    controller.hears('cache (.*)', 'direct_mention, direct_message', function (bot, message) {

      var query = message.match[1];

      // Establish client POSTGRESQL
      var client = createClient();

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
              bot.reply(message, output_list);
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
                  bot.reply(message, output_list);
                }
                else {
                  bot.reply(message, "It seems the day you've tried to search for could not be found in the cache.");
                }
                // end connection
                client.end(function(err) {
                  if (err) throw err;
                })
              });
            }
          });
        });
      });
}

function createClient() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  });
  return client;
}
