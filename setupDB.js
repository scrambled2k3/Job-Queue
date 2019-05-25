var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('Sites');

db.serialize(function() {
  db.run("DROP TABLE IF EXISTS sites")
  db.run("CREATE TABLE sites (id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT, content TEXT)");

  db.close();
});