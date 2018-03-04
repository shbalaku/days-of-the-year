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
  }
};

module.exports = methods;
