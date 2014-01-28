/* You should implement your request handler function in this file.
 * And hey! This is already getting passed to http.createServer()
 * in basic-server.js. But it won't work as is.
 * You'll have to figure out a way to export this function from
 * this file and include it in basic-server.js so that it actually works.
 * *Hint* Check out the node module documentation at http://nodejs.org/api/modules.html. */

var storage = [];
var url = require('url');
var fs = require('fs');
var _und = require('underscore');

module.exports.handleRequest = function(request, response) {
  /* the 'request' argument comes from nodes http module. It includes info about the
  request - such as what URL the browser is requesting. */

  /* Documentation for both request and response can be found at
   * http://nodemanual.org/0.8.14/nodejs_ref_guide/http.html */


  var url_parts = url.parse(request.url, true);
  var url_path  = url_parts.pathname;

  console.log("Serving request type " + request.method + " for url " + request.url);
  var statusCode;
  var returnData;


  /* Without this line, this server wouldn't work. See the note
   * below about CORS. */
  var headers = defaultCorsHeaders;

  headers['Content-Type'] = "text/plain";

  

  

  if (url_path === '/classes/messages') {

    if (request.method === "GET"){
      statusCode = 200;
      if(url_parts.query.limit !== undefined){
        returnData = _und(storage).first(url_parts.query.limit).map(function(item){return item.data;});
      } else {
        returnData = _und(storage).map(function(item){return item.data;});
      }

      if (url_parts.query.order){
        var sortAscending = false;
        if (url_parts.query.order[0] === '-'){
          sortAscending = true;
        }

        returnData = _und.sortBy(returnData, url_parts.query.order);
      }
      
      console.log(statusCode);

      

      /* .writeHead() tells our server what HTTP status code to send back */
      response.writeHead(statusCode, headers);

      /* Make sure to always call response.end() - Node will not send
   * anything back to the client until you do. The string you pass to
   * response.end() will be the body of the response - i.e. what shows
   * up in the browser.*/
    response.end(JSON.stringify(returnData));
    }

    if (request.method === "POST"){
      statusCode = 201;
      console.log(statusCode);
      /* .writeHead() tells our server what HTTP status code to send back */
      response.writeHead(statusCode, headers);

      // -------------- Handle POST request data ------------ //

      var _postData;
      var _dataString = '';

      request.on('data', function(data1){
        _dataString += data1;
      });

      request.on('end', function(data){
        _postData = _dataString;
        var dateCreatedAt = (new Date()).valueOf();
        storage.push({createdAt: dateCreatedAt,
          data: _postData});
        response.end(JSON.stringify('foobar'))
      });

      // ---------------------------------------------------- //

    }

    if (request.method === "OPTIONS"){
      statusCode = 200;
      response.writeHead(statusCode, headers);
      response.end('hello');
    }

  

  //---------------------- Serving the App HTML and public resources -----------------------//

  } else if (url_path === '/') {
    statusCode = 200;
    response.writeHead(statusCode, {"Content-Type": "text/html"});

    fs.readFile('../client/index.html', function (err, html){
      if (err) {
        throw new Error('there was an error rendering the index');
      }
      response.write(html);
      response.end();
    });
  
  } else if (url_path) {

    statusCode = 200;
    response.writeHead(statusCode, {"Content-Type": "text"});

    fs.readFile('../client/' + url_path, function (err, file){
      if (err) {
        throw new Error('there was an error rendering the index');
      }
      response.write(file);
      response.end();
    });



  //------------------------- Respond with an error code for unsupported routes ---------------------------------//




  } else {
    statusCode = 404;
    response.writeHead(statusCode, headers);
    response.end('404');
  }

  

  
};

/* These headers will allow Cross-Origin Resource Sharing (CORS).
 * This CRUCIAL code allows this server to talk to websites that
 * are on different domains. (Your chat client is running from a url
 * like file://your/chat/client/index.html, which is considered a
 * different domain.) */
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};
