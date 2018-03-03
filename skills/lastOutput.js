//
// Retrive last output functionality
//
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

module.exports = function (controller) {

    controller.hears('last output', 'direct_mention, direct_message', function (bot, message) {

        client.connect();
        client.query('SELECT * FROM lastOutput;', (err, res) => {
          console.log(err);
          client.end();
          console.log(res);
        });
    });
}
