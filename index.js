// The Proxy to forward the media requests
var MjpegProxy = require('mjpeg-proxy').MjpegProxy,

// Express framework
  express = require('express'),

// The app package
  app = express(),

// An http server
  server = require('http').createServer(app),

// Socket.io for chats
  io = require('socket.io')(server),

// the body-parser for form processing
  bodyParser = require('body-parser'),

// Chat Data
  chatData = require(__dirname + '/chatdata.json'),

// Chat model
  Chat = function (nickname, message) {
    // prevent script injection
    this.nickname = typeof nickname === 'string' ? nickname.replace(/<script.*?>.*?<\/script>/igm, '') : '';
    this.message = typeof message === 'string' ? message.replace(/<script.*?>.*?<\/script>/igm, '') : '';
    this.entryDate = Date.now();
  };

// Make the POST and PUT data available
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Root path for serving support files from site
console.log('starting static http server on html files');
app.use(express.static('html'));

// a route to tell users how many viewers there are
app.get('/usercount', function (req, res) {
  server.getConnections(function (error, count) {
    if (count) res.send({count: count});
  });
});

// socket.io based chat system
io.on('connection', function (socket) {
  // chat user connected
  console.log('a chat user connected', chatData);

  // Get the current chatData, last 100 entries max
  io.emit('chat connection', chatData);

  socket.on('chat message', function (msg) {
    // make sure that message doesn't have scripts injected
    msg = new Chat(msg.nickname, msg.message)
    console.log('msg: ', msg);
    // post a chat entry
    chatData.push(msg);
    require('fs').writeFileSync(__dirname + '/chatdata.json', JSON.stringify(chatData));
    console.log(chatData);
    io.emit('chat message', msg);
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

});

// Mjpeg Feed
app.get(
  '/index1.jpg',
  new MjpegProxy('http://24.9.117.243/html/cam_pic_new.php?time=1464187543304&pDelay=40000'
).proxyRequest);

// Start the server
server.listen(8080);
console.log('listening on 8080');