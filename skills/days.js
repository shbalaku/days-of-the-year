//
// Main functionality
//
var request = require('request');
var JSSoup = require('jssoup').default;
var now = new Date();
const { Client } = require('pg');

module.exports = function (controller) {

    controller.hears('(.*)/(.*)', 'direct_mention, direct_message', function (bot, message) {

        var day = message.match[1].slice(-2);
        var month = message.match[2];

        if (validate_day(day) && validate_month(month)){
          month = reformat(month);
          day = reformat(day);
          date = month + "/" + day;
          [date_format1, date_format2] = format_date(date);

          cacheLookup(date_format1, function(res) {
            if (res != 0) {
              var date_message = "**"+date_format1+"**";
              var output_list=date_message + '\n';
              for (var i=0; i<res.length; i++){
                output_list = output_list + '\n* ' + res[i];
              }
              bot.reply(message, output_list);
              console.log("Cache lookup successful");
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
                    if (((days_list2[i].text).indexOf(date_format1)>-1) || ((days_list[i].text).indexOf(date_format2)>-1)) {
                      results = results.concat(days_list[i].text);
                    }
                  }
                  if (results.length == 0)
                    bot.reply(message, "Something went wrong. Please check you have entered a valid date. Thank you. Sorry this happened...awkward.");
                  else {
                    // results is an array consisting of messages collected during execution
                    var date_message = "**"+date_format1+"**";
                    var output_list=date_message + '\n';
                    for (var i=0; i<results.length; i++){
                      output_list = output_list + '\n* ' + results[i];
                    }
                    bot.reply(message, output_list);

                    // cache insertion
                    var client = createClient();
                    client.connect( function (err) {
                      if (err) throw err;

                      // execute query
                      client.query('DELETE FROM lastOutput;', function(err) {
                        if (err) throw err;
                        // execute addition to table query
                        client.query('INSERT INTO lastOutput VALUES ($1, $2);', [date_format1, results], function (err) {
                          if (err) throw err;

                          // execute cache insertion query
                          client.query('INSERT INTO cache VALUES ($1, $2);', [date_format1, results], function (err) {
                            if (err) throw err;
                            // end connection
                            client.end( function (err) {
                              if (err) throw err;
                            });
                          });
                        });
                      });
                    });
                  }
                }
              });
            }
          });
        }
        else {
          bot.reply(message, "Something went wrong. Please check you have entered a valid date. Thank you. Sorry this happened...awkward.");
        }
    });
}

function format_date(date){
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
}

function validate_day(day){
  var day_num = parseInt(day);
  if (day_num<32 && day_num>0){
    return true;
  }
  return false;
}

function validate_month(month){
  var month_num = parseInt(month);
  if (month_num<13 && month_num > 0){
    return true;
  }
  return false;
}

function reformat(str){
  str_num = parseInt(str);
  if (str_num<10){
    str = '0'+str_num.toString();
  }
  return str;
}

function createClient() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  });
  return client;
}

function cacheLookup(date, callback) {
  var client = createClient();

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
}
