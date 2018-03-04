var request = require('request');
var JSSoup = require('jssoup').default;
var now = new Date();
const { Client } = require('pg');

var methods = {
  formatDate: function (date){
    months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    suffix = ['st', 'nd', 'rd', 'th'];
    month = parseInt(date[0]+date[1]).toString();
    day = parseInt(date[3]+date[4]).toString();
    if (date[3] == '1'){
      suff = suffix[3];
    }
    else if (date[4] == '1'){
      suff = suffix[0]
    }
    else if (date[4] == '2'){
      suff = suffix[1];
    }
    else if (date[4] == '3'){
      suff = suffix[2];
    }
    else{
      suff = suffix[3];
    }

    month_str = months[month-1];
    return [month_str+" " + day + suff, day + suff + " " + month_str];
  },
  createClient: function () {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: true,
    });
    return client;
  },
  cacheLookup: function (date, callback) {
    var client = methods.createClient();

    client.connect( function(err) {
      if (err) throw err;

      // execute query
      client.query('SELECT * FROM cache WHERE date = $1;', [date], function(err, res) {
        if (err) throw err;

        var results = [];
        // process results
        var row_count = res.rows.length;
        if (row_count > 0) {
          results = res.rows[0].days;
          callback(results);
        }
        else {
          callback(0);
        }
        client.end(function(err) {
          if(err) throw err;
        });
      });
    });
  },
  storeLastOutput: function (date, days, callback) {
    var client = methods.createClient();

    client.connect( function(err) {
      if (err) throw err;

      // delete last output entries
      client.query('DELETE FROM lastOutput;', function(err) {
        if (err) throw err;
        // enter new entry
        client.query('INSERT INTO lastOutput VALUES ($1, $2);', [date, days], function(err) {
          if (err) throw err;
          // call callback function
          callback(client);
        });
      });
    });
  },
  storeInCache: function (client, date, days, callback) {
    client.query('INSERT INTO cache VALUES ($1, $2);', [date, days], function(err) {
      if (err) throw err;
      // callback
      callback();
    });
  },
  processQuery: function (date, bot, message) {
    [date1, date2] = methods.formatDate(date);
    // look up date in cache table
    methods.cacheLookup(date1, function(res) {
      if (res != 0) {
        console.log("Cache lookup successful");
        // store last output
        methods.storeLastOutput(date1, res, function(client) {
          client.end(function(err) {
            if (err) throw err;
            var date_message = "**"+date1+"**";
            var output_list=date_message + '\n';
            for (var i=0; i<res.length; i++){
              output_list = output_list + '\n* ' + res[i];
            }
            bot.reply(message, output_list);
          });
        });
      }
      else {
        console.log("Cache lookup unsuccessful");

        year = now.getFullYear().toString();
        uri_str = 'https://www.daysoftheyear.com/days/'+year+'/'+date;

        var results = [];

        request(uri_str, function(err, resp, html) {
          if (!err){
            var soup = new JSSoup(html);
            var days_list = soup.findAll('h3', 'card-title');
            var days_list2 = soup.findAll('h4', 'card-title-secondary');
            for (var i = 0; i < days_list2.length; i++) {
              if (((days_list2[i].text).indexOf(date1)>-1) || ((days_list[i].text).indexOf(date2)>-1)) {
                results = results.concat(days_list[i].text);
              }
            }
            if (results.length == 0)
              bot.reply(message, "Something went wrong. Sorry this happened...awkward.");
            else {
              // store last output
              methods.storeLastOutput(date1, results, function(client) {
                methods.storeInCache(client, date1, results, function() {
                  // end connection
                  client.end(function(err) {
                    if (err) throw err;
                    // results is an array consisting of messages collected during execution
                    var date_message = "**"+date1+"**";
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
  }
};

module.exports = methods;
