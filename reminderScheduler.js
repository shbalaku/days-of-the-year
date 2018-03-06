// #!/usr/bin/env node

var CiscoSpark = require('node-ciscospark');
var spark = new CiscoSpark(process.env.SPARK_TOKEN);
var methods = require('./methods.js');

// global variables
var client = methods.createClient();
var d = methods.encodeToday();
var date = methods.formatDate(d);

client.connect(function(err) {
  if (err) throw err;
  client.query('SELECT * FROM reminders WHERE (remind_on LIKE $1) OR (remind_on LIKE $2);', [date[0], date[1]], function(err, res){
    if (err) throw err;
    client.end(function(err){
      if (err) throw err;
      var len = res.rows.length;
      if(len > 0) {
        for (var i = 0; i < len; i++) {
          var email = res.rows[i].email;
          //var person_id = res.rows[i].person_id;
          var day = res.rows[i].day;
          var text = "It is " + day + " today!";

          spark.messages.create({
            toPersonEmail: email,
            text: text
          }, function (err, result) {
            if (err) console.error(err);
            console.log(result);
          });
        }
      }
    });
  });
});
