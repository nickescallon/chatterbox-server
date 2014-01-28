// var url = 'https://api.parse.com/1/classes/chatterbox';
var url = 'http://127.0.0.1:8080/classes/messages';
var username = window.location.search.split('=')[1];
var chatRooms = {};
var count = 0;
var lastGet = [];
var friends = [];

var renderChat = function(data) {
    var $li = $('<li>' + count + '</li>');
    count++;
    var $username = $('<p class="name"></p>').text('User: @' + data.username);
    var $chatroom = $('<p></p>').text('Room: ' + data.roomname);
    var $date = $('<p></p>').text('Date: ' + moment(data.createdAt).fromNow());
    var $message = $('<p></p>').text(data.text);
    $li.append($username)
        .append($chatroom)
        .append($date)
        .append($message);
    $('.chats').append($li).hide().fadeIn();
};

var parseGet = function(data) {
    var results = data.results;
    if (_.isEqual(lastGet[0], results[0])) {
        //do nothing
    } else {
        lastGet = results;
        $('.chats').html("");
        _.each(results, function(result) {
            renderChat(result);
        });
        highlightFriends();
    }
};

var postMessage = function(message) {
    $.ajax({
        url: url,
        type: 'POST',
        data: message,
        contentType: 'application/json',
        success: function(data) {
            console.log('success', data);
        },
        error: function(data) {
            console.log('error', data);
        }
    });
};

var getMessages = function(options, callback) {
    count = 0;
    // options || (options = {
    //     order: '-createdAt',
    //     limit: 100
    // });
    callback || (callback = parseGet);
    $.getJSON(url, /*options,*/ callback);
};

var roomname = 'testING';

var createMessage = function(message) {
    postMessage(
        JSON.stringify({
            username: username,
            text: message,
            roomname: roomname
        })
    );
};

var checkRooms = function() {
    var addRoom = function(roomname) {
        if (roomname === 'undefined' ||
            roomname === 'null' ||
            roomname === "" ||
            typeof roomname !== 'string' ||
            chatRooms[roomname]) {
            //doNothing
        } else {
            chatRooms[roomname] = roomname;
            var $newOption = $('<option value=' + JSON.stringify(roomname) + ' selected></option>').text(roomname);
            $('.chatRooms').prepend($newOption);
        }
    };
    getMessages(undefined, function(data) {
        _.each(data.results, function(result) {
            addRoom(result.roomname);
        });
    });
};

var highlightFriends = function() {
    _.each(friends, function(username) {
        $('.name').each(function() {
            var $user = $(this);
            if ($user.text().split('@')[1] === username) {
                $user.addClass('friend');
            }
        })
    });
}

var pushFriend = function(username) {
    friends.push(username);
    $('<li></li>').text('@' + username).addClass('friend').addClass('toShow').appendTo('.friends');
}

var showMessagesByFriend = function(username) {
    getMessages(undefined, function(data) {
        var results = data.results;
        var resultsByUser = _.filter(results, function(result) {
            return result.username === username;
        });
        parseGet({
            results: resultsByUser
        });
    });
}


$(document).ready(function() {
    var username = window.location.search.split('=')[1];
    roomname = '4chan';
    checkRooms();
    var getByChatRoom = function() {
        getMessages(undefined, function(data) {
            var results = _.map(data, function(value){
                return JSON.parse(value);
            });
            var resultsInRoom = _.filter(results, function(result) {
                return result.roomname === roomname
            });
            parseGet({
                results: resultsInRoom
            });
        });
        setTimeout(function() {
            $('.loadingMessage').fadeOut().hide();
        }, 1500);
    };
    var autoRefresh = setInterval(getByChatRoom, 1000);
    $('.username').text('Hello, @' + username);
    $('.sendMessage').submit(function(e) {
        e.preventDefault();
        createMessage($('input[name="message"]').val());
    });
    $('.createChatRoom').submit(function(e) {
        e.preventDefault();
        roomname = $('input[name="chatRoomName"]').val();
        createMessage('New room created by @' + username);
        checkRooms();
    })
    $('select').on('change', function(e) {
        e.preventDefault();
        roomname = $('select option:selected').val();
        $('.chatRoomLabel').text('Welcome to chatroom: ' + roomname);
        clearInterval(autoRefresh);
        autoRefresh = setInterval(getByChatRoom, 1000);
    });
    $('.chats').click('.name', function(e) {
        e.preventDefault();
        var $user = $(e.target);
        pushFriend($user.text().split('@')[1])
        highlightFriends();
    });
    $('.friends').click('.toShow', function(e) {
        e.preventDefault();
        var $user = $(e.target);
        clearInterval(autoRefresh);
        autoRefresh = setInterval(function() {
            showMessagesByFriend($user.text().split('@')[1])
        }, 1000);
    })
});