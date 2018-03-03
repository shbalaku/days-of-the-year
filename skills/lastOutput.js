//
// Retrive last output functionality
//



module.exports = function (controller) {

    controller.hears('last output', 'direct_mention, direct_message', function (bot, message) {

      // Establish client POSTGRESQL
      var client = createClient();

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
}

function createClient() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  });
  return client;
}
