var methods = require('./methods.js');

// global variables
var now = new Date();
var d = methods.encodeToday();
[date1, date2] = methods.formatDate(d);
var request = require('request');
var JSSoup = require('jssoup').default;

// look up date in cache table
methods.cacheLookup(date1, function(res) {
  if (res != 0) {
    console.log("Cache lookup successful");
  }
  else {
    console.log("Cache lookup unsuccessful");

    year = now.getFullYear().toString();
    uri_str = 'https://www.daysoftheyear.com/days/'+year+'/'+d;

    request(uri_str, function(err, resp, html) {
      if (!err){
        var results = [];
        var bool = false;
        var soup = new JSSoup(html);
        var days_list = soup.findAll('h3', 'card-title');
        var days_list2 = soup.findAll('h4', 'card-title-secondary');
        for (var i = 0; i < days_list2.length; i++) {
          if (((days_list2[i].text).indexOf(date1)>-1) || ((days_list[i].text).indexOf(date2)>-1)) {
            results = results.concat(days_list[i].text);
            bool = true;
          }
        }
        if (bool == false)
          console.log("Something went wrong. Sorry this happened...awkward.");
        else {
          // store in cache
          var client = methods.createClient();
          client.connect(function(err){
            if (err) throw err;
            methods.storeInCache(client, date1, results, function() {
              // end connection
              client.end(function(err) {
                if (err) throw err;
              });
            });
          });
        }
      }
    });
  }
});
