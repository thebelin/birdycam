var MjpegProxy = require('mjpeg-proxy').MjpegProxy;
var express = require('express');
var app = express();

// Root path for serving support files from site
console.log('starting static http server on html files');
app.use(express.static('html'));

// @todo: build a route to tell users how many viewers there are

// @todo build a chat room on the feed

app.get('/index1.jpg', new MjpegProxy('http://24.9.117.243/html/cam_pic_new.php?time=1464187543304&pDelay=40000').proxyRequest);
app.listen(8080);
console.log('listening on 8080');