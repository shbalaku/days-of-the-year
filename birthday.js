var CiscoSpark = require('node-ciscospark');
var spark = new CiscoSpark(process.env.SPARK_TOKEN);

var text = "Happy birthday Max!";

spark.messages.create({
  toPersonEmail: "mwybrow@cisco.com"
  text: text
}, function (err, result) {
  if (err) console.error(err);
  console.log(result);
});
