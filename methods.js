var request = require('request');
var JSSoup = require('jssoup').default;
var now = new Date();
const { Client } = require('pg');
//var queue = 0;

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
        client.end(function(err) {
          if(err) throw err;

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
        });
      });
    });
  },
  cacheLookupDay: function (day, callback) {
    var client = methods.createClient();

    client.connect( function(err) {
      if (err) throw err;

      // execute query
      var query = [day];
      client.query('SELECT * FROM cache WHERE days @> $1;', [query], function (err, res) {
        if (err) throw err;
        // end client
        client.end(function(err) {
          if (err) throw err;
          var date = res.rows[0].date;
          console.log(date);
          callback(date);
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
  processQuery: function (date, callback) {
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
            callback(output_list);
          });
        });
      }
      else {
        console.log("Cache lookup unsuccessful");

        year = now.getFullYear().toString();
        uri_str = 'https://www.daysoftheyear.com/days/'+year+'/'+date;

        request(uri_str, function(err, resp, html) {
          if (!err){
            //queue++;
            //console.log("queue count = " + queue);
            var results = [];
            var bool = false;
            var soup = new JSSoup(html);
            var date_message = "**"+date1+"**";
            var output_list=date_message + '\n';
            var days_list = soup.findAll('h3', 'card-title');
            var days_list2 = soup.findAll('h4', 'card-title-secondary');
            for (var i = 0; i < days_list2.length; i++) {
              if (((days_list2[i].text).indexOf(date1)>-1) || ((days_list[i].text).indexOf(date2)>-1)) {
                results = results.concat(days_list[i].text);
                output_list = output_list + '\n* ' + days_list[i].text;
                bool = true;
              }
            }
            if (bool == false)
              callback("Something went wrong. Sorry this happened...awkward.");
            else {
              // store last output
              methods.storeLastOutput(date1, results, function(client) {
                methods.storeInCache(client, date1, results, function() {
                  // end connection
                  client.end(function(err) {
                    if (err) throw err;
                    // bot reply
                    callback(output_list);
                  });
                });
              });
            }
          }
        });
      }
    });
  },
  convertString: function (phrase) {
      var maxLength = 100;

      var returnString = phrase.toLowerCase();
      //Convert Characters
      returnString = returnString.replace(/ö/g, 'o');
      returnString = returnString.replace(/ç/g, 'c');
      returnString = returnString.replace(/ş/g, 's');
      returnString = returnString.replace(/ı/g, 'i');
      returnString = returnString.replace(/ğ/g, 'g');
      returnString = returnString.replace(/ü/g, 'u');
      returnString = returnString.replace(/ñ/g, 'n');

      // if there are other invalid chars, convert them into blank spaces
      returnString = returnString.replace(/[^a-z0-9\s-]/g, "");
      // convert multiple spaces and hyphens into one space
      returnString = returnString.replace(/[\s-]+/g, " ");
      // trims current string
      returnString = returnString.replace(/^\s+|\s+$/g,"");
      // cuts string (if too long)
      if(returnString.length > maxLength)
      returnString = returnString.substring(0,maxLength);

      return returnString;
  },
  encodeToday: function() {
    var d;
    if (now.getMonth()+1<10)
        mon = '0'+(now.getMonth()+1).toString();
    else
        mon = (now.getMonth()+1).toString();
    if (now.getDate()<10)
        day = '0'+now.getDate().toString();
    else
        day = now.getDate().toString();
    d = mon + "/" + day;

    return d;
  },
  searchDay: function(query, bot, message, callback) {
    var query_encode = encodeURI(query);
    var uri_str = 'https://www.daysoftheyear.com/search/'+query_encode+'/';
    // request html of day page
    request(uri_str, function(err, resp, html) {
      if (!err){
        var match = query.toUpperCase();
        var soup = new JSSoup(html);
        var days_list = soup.findAll('h3', 'card-title');
        var date_list = soup.findAll('h4', 'card-title-secondary');
        if (days_list.length > 0){
          var date = '';
          var day;
          for (var i = 0; i < days_list.length; i++) {
            var res = methods.convertString(days_list[i].text).toUpperCase();
            if (res == match){
              date = date_list[i].contents[0].nextElement.nextElement._text;
              day = days_list[i].text;
              break;
            }
          }
          if (date != ''){
            // exact match found
            callback(date.trim(), day);
          }
          else {
            // no exact match found so retrieve first similar result from search - to be added
            var query_split = query.split(" ");
            var list = [];
            for (var i = 0; i < days_list.length; i++) {
              list[i] = days_list[i].text;
            }
            for (var i = 0; i < query_split.length - 1; i++) {
              var word_i = query_split[i];
              var results = fuzzy.filter(word_i, list);
              var matches = results.map(function(el) { return el.string; });
              if (matches != [])
                break;
            }
            if (matches.length > 0) {
              var day = matches[0];
              var date = date_list[0].previousElement.nextElement.contents[0]._text;
              callback(date,day);
            }
            else {
              bot.reply(message, "It seems the day you've tried to search for could not be found.");
            }
          }
        }
        else{
          bot.reply(message, "It seems the day you've tried to search for could not be found.");
        }
      }
    });
  },
  findExactMatch: function(query, callback) {
    var client = methods.createClient();
    client.connect(function(err) {
      if (err) throw err;
      // execute exact match query (case insensitive)
      client.query('SELECT * FROM cache WHERE TEXT(days) ~* ($1);',[query], function(err,res){
        if (err) throw err;
        // end client connection
        client.end(function(err) {
          if (err) throw err;
          // process result
          if (res.rowCount > 0){
            var day;
            var date = res.rows[0].date;
            var days_list = res.rows[0].days;
            var regex = new RegExp(query, 'i');
            // find day in days list returned
            for (var i = 0; i < days_list.length; i++) {
              if (days_list[i].match(regex))
                day = days_list[i];
            }
            var resp = {
              date: date,
              day: day
            };
            callback(resp);
          }
          else {
            callback(0);
          }
        });
      });
    });
  },
  websiteSearch: function(query, callback) {
    var query_encode = encodeURI(query);
    uri_str = 'https://www.daysoftheyear.com/search/'+query_encode+'/';
    request(uri_str, function(err, resp, html) {
      if (!err){
        var match = query.toUpperCase();
        var soup = new JSSoup(html);
        var days_list = soup.findAll('h3', 'card-title');
        if (days_list.length > 0){
          var link = '';
          for (var i = 0; i < days_list.length; i++) {
            var res = methods.convertString(days_list[i].text).toUpperCase();
            if (res == match){
              link = days_list[i].nextElement.attrs.href;
              break;
            }
          }
          if (link != ''){
            // exact match found
            var result;
            request(link, function(_err, _resp, _html) {
              if (!_err){
                var _soup = new JSSoup(_html);
                var date = _soup.find('div', 'banner__title banner__title-small');
                var day_message = _soup.find('h1', 'banner__title');
                result = date.text + ' ' + day_message.text;
                callback(result);
              }
            });
          }
          else {
            // no exact match found
            var query_split = query.split(" ");
            var list = [];
            for (var i = 0; i < days_list.length; i++) {
              list[i] = days_list[i].text;
            }
            for (var i = 0; i < query_split.length - 1; i++) {
              var word_i = query_split[i];
              var results = fuzzy.filter(word_i, list);
              var matches = results.map(function(el) { return el.string; });
              if (matches != [])
                break;
            }

            // bot reply all matches found
            var response = "**I found the following matching day(s):**\n\n";
            var size = matches.length;
            var completed_requests = 0;
            if (size > 0) {
              for (var i = 0; i < size; i++) {
                link = days_list[i].nextElement.attrs.href;
                methods.GetMatchAttributes(link, function(result) {
                  completed_requests++;
                  response = response + result;
                  if (completed_requests == size) {
                    callback(response);
                  }
                });
              }
            }
            else {
              callback("It seems the day you've tried to search for could not be found.");
            }
          }
        }
        else{
          callback("It seems the day you've tried to search for could not be found.");
        }
      }
    });
  },
  GetMatchAttributes: function(link, callback) {
    request(link, function(_err, _resp, _html) {
      if (!_err){
        var _soup = new JSSoup(_html);
        var date = _soup.find('div', 'banner__title banner__title-small');
        var day_message = _soup.find('h1', 'banner__title');
        var result = "\n" + date.text + ' ' + day_message.text + "\n";
        callback(result);
      }
    });
  },
  reformat: function(str){
    str_num = parseInt(str);
    if (str_num<10){
      str = '0'+str_num.toString();
    }
    return str;
  }
};

module.exports = methods;
