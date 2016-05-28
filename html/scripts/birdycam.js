// BirdyCam client object
// Object Literal Pattern
var _BirdyCam = {
  // To start things, run this when jQuery is ready
  init: function () {
    // preload all the jQuery components using native document id method
    var $dom = {
        playerImage:  $(document.getElementById('playerImage')),
        fullscreen:   $(document.getElementById('btnFullscreen')),
        player:       $(document.getElementById('vidPlayer')),
        userCount:    $(document.getElementById('userCount')),
        playerStatus: $(document.getElementById('playerStatus')),
        statusIcon:   $(document.getElementById('statusIcon')),
        explanation:  $(document.getElementById('explanation')),
        chatModule:   $(document.getElementById('chatModule'))
      },

    // For getting the user count
      getUserCount = function () {
        $.get('/usercount', function (userData) {
          if (userData.count) $dom.userCount.html(userData.count);
        });
      },

    // The function to run on interval
      intervalFunction = function () {
        // Update the user count
        getUserCount();

        // record that the user is there watching video, if ga is present
        // track the analytics event, if ga is present
        if (ga) ga('send', 'event', {
          'eventCategory': 'Player',
          'eventAction': 'Playing',
          'nonInteraction': true
        });
      };

    // Get user count initially
    getUserCount();

    // monitor interval
    window.setInterval(intervalFunction, 5000);

    // make the controls work
    $dom.fullscreen.on('click', function (eventObj) {
      if ($dom.player.hasClass('minPlayer')) {
        $dom.player.addClass('fullScreen').removeClass('minPlayer');
        // hide the other stuff
        $dom.explanation.hide();
        $dom.chatModule.hide();
      } else {
        $dom.player.addClass('minPlayer').removeClass('fullScreen');
        $dom.explanation.show();
        $dom.chatModule.show();        
      }

      // track the analytics event, if ga is present
      if (ga) ga('send', 'event', {
        'eventCategory': 'Player',
        'eventAction': 'Fullscreen'
      });
    });

    // Show the status of the video playback to the user
    $dom.playerImage.ready(function (eventObj) {
      $dom.playerStatus.html('playing');
    });
  }
};

// BirdyChat client object
var _BirdyChat = {
  // A function which is used to start up the BirdyChat object
  init: function () {
    // A socket.io reference
    var socket = io(),

    // The dom objects to be used in this object
      $dom = {
        messageBox: $(document.getElementById('m')),
        messages:   $(document.getElementById('messages')),
        nickname:   $(document.getElementById('nickname')),
        formObj:    $(document.getElementById('messagesForm')),
        uiMessage:  $(document.getElementById('uiMessage')),
        volumeOff:  $(document.getElementById('volumeOff')),
        volumeOn:   $(document.getElementById('volumeOn'))
      },

    // a bit tracking the state of the preload
      preloaded = false,

    // Notification noise for chats
      audio = new Audio('/sounds/robin_sound.mp3'),

    // Whether the audio is muted
      muted = false,

    // scrolls to the bottom of the messages
      updateScroll = function () {
        var element = document.getElementById("messages");
        element.scrollTop = element.scrollHeight;
      },

    // A message
      showMessage = function (msg) {
        var entryDate = new Date(msg.entryDate)
        $dom.messages
          .append($('<span>').text(msg.nickname).addClass('nickname'))
          
          .append($('<time>').text(
            entryDate.getMonth() + '/' + entryDate.getDate() + 
            '/' + entryDate.getFullYear() + ' ' + 
            entryDate.getHours() + ':' + entryDate.getMinutes())
            .addClass('timestamp timeago')
            .attr('datetime', entryDate.toISOString()))

          .append($('<span>').text(msg.message).addClass('userMessage'));

        // Scroll to the bottom
        updateScroll();

        // Update the timestamps
        jQuery("time.timeago").timeago();
      },

    // a ui message
      showUiMessage = function (message) {
        $dom.uiMessage.text(message).show();
        setTimeout(function () {
          $dom.uiMessage.hide();
        }, 1300)
      },

    // Save the user nickname
      saveNick = function (nickname) {
        window.localStorage.setItem('nickname', nickname);
      },

      getNick = function () {
        return window.localStorage.getItem('nickname');
      };

    // Set the nickname to whatever was last used
    $dom.nickname.val(getNick());

    // activate the form submit routine
    $dom.formObj.submit(function () {
      // Create a message based on the form contents
      var chatMessage = {
        nickname: $dom.nickname.val(),
        message: $dom.messageBox.val()
      };

      // Don't allow blank messages or nicknames
      if (!chatMessage.nickname) {
        showUiMessage('Specify a nickname to send messages.');
        return false;
      }
      if (!chatMessage.message) {
        showUiMessage('Specify a message to send.');
        return false;
      }

      // Store the nickname
      saveNick(chatMessage.nickname);

      // track the analytics event, if ga is present
      if (ga) ga('send', 'event', {
        'eventCategory': 'Chat',
        'eventAction': 'Message'
      });

      // Send the chat message through socket.io
      socket.emit('chat message', chatMessage);

      // Clear the message box contents
      $dom.messageBox.val('');
      return false;
    });

    // socket.io connectors to make messaging work
    socket.on('chat message', function (msg) {
      // Only play audio if the mute isn't enabled
      if (!muted) audio.play();
      showMessage(msg);
    });

    // This is the loader for when a connection is made
    socket.on('chat connection', function (messages) {
      if (!preloaded) {
        preloaded = true;
        messages.forEach(function (msg) {
          showMessage(msg);
        });
      }
    });
    
    // volume controls
    $dom.volumeOn.on('click', function () {
      $dom.volumeOn.hide();
      $dom.volumeOff.show();
      muted = true;
    });
    $dom.volumeOff.on('click', function () {
      $dom.volumeOn.show();
      $dom.volumeOff.hide();
      muted = false;
    });

  }
};

// Init the literals when the page is ready
$(document).ready(function () {
  _BirdyCam.init();
  _BirdyChat.init();
});