//load local modules
var db = require('./db');

//require necessary modules
var http = require('http')
  , express = require('express')
  , socketIO = require("socket.io")
  , path = require('path');
var _redis = require('redis'),
 redis = _redis.createClient();

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
var name = 'mujavar hi how russds';

app.get('/', function(request, response){
  response.sendfile(__dirname + settings.view_directory + '/index.html')
});
app.get('/chat' , function(request, response){
  response.sendfile(__dirname + settings.view_directory + '/chat.html')
});

 
//chat using socket.io
io.sockets.on('connection', function(client){
  //when client sends a join event
  var room_name = '';
    client.on('room', function(data){
       room_name = data;
      client.join(room_name);

    //  console.log('room name in room is-------------------'+data);

  })

    console.log('room name is-------------------'+room_name);

  client.on('join', function(data){
    client.set('google_id', data);
     console.log('room name at join-------------------'+room_name);


    redis.sadd(room_name, data, function (err,reply){
        //console.log('redis replay is ---------------'+reply.toString());
    });

     redis.scard(room_name, function (err, data){
        console.log('no of records in redis is ---------'+data);
      })
  


    client.broadcast.to(room_name).emit('message', { message: data + " just joined!", username: "Server Announcement", timest : datediff });

 
  });

  client.on('urlinfo', function(data){
     db.chat_info.find({"url_path" : data},function(err,info){
      if(err){
        //res.json({"status": "error"});
      }
      else{
       // res.json(data);
       // console.log('info length is ;'+info.length);
        var i = 0;
       while(i<info.length){
         var username = 'guest';
          db.usr_info.findOne({"usr_id": info[i].mail_id},{username : true, _id : false}, function (err,usrdata){
           
            if(usrdata==null || usrdata.length<1 ){
               username = 'guest';
            }
            else{
               username = usrdata.username;
            }

            //console.log(usrdata);
            //console.log('usernames are inside ================: '+username);
          });
         //console.log('usernames are outside ================: '+username);
          client.emit('message', { message: info[i].chat_msg, username: info[i].mail_id, timest : info[i].chat_time });
         i++;
       }
        }
      });
   
   });


var google_id = '';
var maxid ='';
  //when client sends a message
  client.on('message', function(data){
       client.get('google_id', function(err, google_id){
       google_id = google_id;
var username = 'guest';
db.usr_info.find({"usr_id" : google_id},function(err,data){
  if(data.length<1){
  //alert('you are not registered');
  }
  else{
   username = data[0].username;
  }
  });


      client.broadcast.to(room_name).emit('message', { message: data, username: google_id, timest : datediff});      
    
db.chat_info.find().sort({"chat_id":-1}).limit(1).exec(function(err, docs) {
   //generate time for adding chat_id
var date = new Date();
var current_year = date.getFullYear();
var current_month = date.getMonth();
var current_date = date.getDate();
var chatidtime = current_year+''+(current_month+1)+''+current_date;

       if(docs.length!=0){
        if(chatidtime==docs[0].chat_id.substr(0,8)){
         maxid = docs[0].chat_id.substr(8);
              }
              else{
                maxid = 0;
              }
         }
        else{
           maxid = 0;
        }

if(maxid<9)
{
var maxid1 = parseInt(maxid)+1;
    maxid1 = '0'+maxid1;
}
else
{
  var maxid1 = parseInt(maxid)+1;
}

//inserting chat informaion in mongodb
 // console.log('date is :'+chatidtime);
 new db.chat_info({
      url_path : room_name,
    mail_id : google_id,
    chat_time : Date.now(),
    chat_msg : data,
    chat_id : chatidtime+maxid1
  }).save( function( err, comment, count ){
    console.log('data saved');
  });


     // console.log('max id in local : ' +maxid);   
});
//console.log('max id is : ' +maxid);   


    });
    
  });

//client.emit('exit', "raeem");
//console.log('room name at before disconnect is '+room_name);
  client.on('disconnect', function  () {
    //console.log('room name at disconnect is '+room_name);
    client.get('google_id', function (err, data){
       //console.log('disconnected user --------------: '+data);
       //console.log('room name at final is '+room_name);
           redis.srem(room_name, data, function (err,reply){
                //console.log('redis replay is ---------------'+reply.toString());
    });
    });
     
    
  //console.log('disconnect event called --------------------------'+socket);
    
    
  });

});

 // io.sockets.on('disconnect', function  (client) {
 //  console.log('disconnect event called --------------------------')
 //    client.on('exit',function(data){
 //      console.log('client disconnectd : '+data);
 //    })
    
 //  });


redis.on("error", function (err) {
console.log("Error " + err);
});

