//
// Retrive last output functionality
//

var client = module.client;

module.exports = function (controller, client) {

    controller.hears('last output', 'direct_mention, direct_message', function (bot, message) {

        client.connect();
        client.query('SELECT * FROM lastOutput;', (err, res) => {
          console.log(err);
          var date = res.rows[0].date;
          var days = res.rows[0].days;
          var date_message = "**"+date+"**";
          var output_list=date_message + '\n';
          for (var i=0; i<days.length; i++){
            output_list = output_list + '\n* ' + days[i];
          }
          bot.reply(message, output_list);
          client.end();
        });
    });
}
