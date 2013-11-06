var nodeStatic = require('node-static');
var http = require('http');
var winston = require('winston');

function formatStatus(statusCode) {
  var formatted = "" + statusCode;

  if (statusCode >= 500)
    return formatted.red;

  if (statusCode >= 400)
    return formatted.yellow;

  return formatted.green;
}

var file = new nodeStatic.Server('./public');
var server = http.createServer(function(request, response) {
  var start = Date.now();

  request.addListener('end', function() {
    file.serve(request, response, function(result) {
      if (!result) result = arguments[1];
      var statusString = formatStatus(result.status);
      if (result.status >= 400) {
        response.writeHead(result.status, result.headers);
        response.end();
      }
      var duration = Date.now() - start;
      winston.info("GET %s %s %dms", request.url, statusString, duration);
    });
  });
  request.resume();
});

var port = "5000";
if (process.argv[2]) port = parseInt(process.argv[2], 10);

server.listen(port);

winston
  .remove(winston.transports.Console)
  .add(winston.transports.Console, {colorize: true, timestamp: true});
winston.info("Started listening on port " + port);
