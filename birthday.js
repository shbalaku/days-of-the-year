var CiscoSpark = require('node-ciscospark');
var spark = new CiscoSpark(process.env.SPARK_TOKEN);
var methods = require('./methods.js');
var d = methods.encodeToday();
var today = methods.formatDate(d);

var client = methods.createClient();

client.connect(function(err) {
  if(err) throw err;
  // check for birthdays
  client.query('SELECT * FROM birthdays WHERE birthday = ($1);', [today], function(err, res){
    var len = res.rows.length;
    if (len>0){
      client.end(function(err){
        if (err) throw err;
        for (var i = 0; i < len; i++) {
          var email = res.rows[i].email;
          var first_name = res.rows[i].first_name;
          var text = 'Happy birthday ' + first_name + "!";
          spark.messages.create({
            toPersonEmail: email,
            text: text
          }, function (err, result) {
            if (err) console.error(err);
            console.log(result);
          });
        }
      });
    }
    else {
      client.end(function(err){
        if (err) throw err;
      });
    }
  });
});
