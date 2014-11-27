//load local modules
var db = require('./db');

//require necessary modules
var http = require('http')
  , express = require('express')
  , socketIO = require("socket.io")
  , path = require('path');
var _redis = require('redis'),
 redis = _redis.createClient();
 //to run code synchronously 
var async = require('async');
//initialize our application
var app = express();
app.use(express.static(path.join(__dirname, 'assets')));
var server = http.createServer(app).listen(3000);
var io = socketIO.listen(server);

//settings
var settings = {
  'view_directory': '/views'
}
var timee = Date.now();
var datediff = new Date(timee);

app.get('/', function(request, response){
  response.sendfile(__dirname + settings.view_directory + '/index.html')
});
app.get('/chat' , function(request, response){
  response.sendfile(__dirname + settings.view_directory + '/chat.html')
});

 
//async parallel execution sample code

             async.parallel([
                    function(callback) { //This is the first task, and callback is its callback task
                 db.likes_info.find({"chat_id":chatid,"like_mail_id":google_id}).count().exec(function(err,data){
                                                if(data==0){
                                                  userlike = false;
                                                   }
                                                else{
                                                  userlike = true;
                                                    }
                                          console.log('userlike is '+userlike);  
                                          callback();       
                                               });
                     }
                ], function(err) { //This is the final callback
                    console.log('Both a and b are saved now');
                              client.broadcast.to(room_name).emit('message', { message : data, username : google_id, timest : datediff, chat_id : chatid, userlike : userlike});      

                });



