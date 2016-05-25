// The Proxy to forward the media requests
var MjpegProxy = require('mjpeg-proxy').MjpegProxy,

// Express framework
  express = require('express'),

// The app package
  app = express(),

// An http server
  server = require('http').createServer(app);

// Root path for serving support files from site
console.log('starting static http server on html files');
app.use(express.static('html'));

// a route to tell users how many viewers there are
app.get('/usercount', function (req, res) {
  server.getConnections(function (error, count) {
    if (count) res.send({count: count})
  });
});

// @todo build a chat room on the feed

app.get('/index1.jpg', new MjpegProxy('http://24.9.117.243/html/cam_pic_new.php?time=1464187543304&pDelay=40000').proxyRequest);
server.listen(8080);
console.log('listening on 8080');