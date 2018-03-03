//
// Yesterday functionality
//
var request = require('request');
var JSSoup = require('jssoup').default;
var now = new Date();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

module.exports = function (controller) {

    controller.hears('yesterday', 'direct_mention, direct_message', function (bot, message) {

        date = encodeYesterday();
        [date_format1, date_format2] = format_date(date);
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
              bot.reply(message, "Something went wrong. Sorry this happened...awkward.");
            else {
              // results is an array consisting of messages collected during execution
              var date_message = "**"+date_format1+"**";
              var output_list=date_message + '\n';
              for (var i=0; i<results.length; i++){
                output_list = output_list + '\n* ' + results[i];
              }
              bot.reply(message, output_list);

              client.connect( function (err) {
                if (err) throw err;

                // execute query
                client.query('DELETE FROM lastOutput;', function(err) {
                  if (err) throw err;
                  // execute addition to table query
                  client.query('INSERT INTO lastOutput VALUES ($1, $2);', [date_format1, results], function (err) {
                    if (err) throw err;
                    // end connection
                    client.end( function (err) {
                      if (err) throw err;
                    });
                  });
                });
              });
            }
          }
        });
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

function encodeYesterday() {
  var d;
  var yesterday = new Date();
  yesterday.setDate(now.getDate()-1);

  if (yesterday.getMonth()+1<10)
      mon = '0'+(yesterday.getMonth()+1).toString();
  else
      mon = (yesterday.getMonth()+1).toString();
  if (yesterday.getDate()<10)
      day = '0'+yesterday.getDate().toString();
  else
      day = yesterday.getDate().toString();
  d = mon + "/" + day;

  return d;
}
