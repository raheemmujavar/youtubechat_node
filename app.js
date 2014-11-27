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

var sub = _redis.createClient();
var pub = _redis.createClient();
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

   
//chat using socket.io
io.sockets.on('connection', function(client){

  //when client sends a you tube url event
        var room_name = '',google_id = '';
            client.on('room', function(data){
               room_name = data;
              client.join(room_name);
              
          });

  //room socket ends here

  //when clinet sends a join event
            client.on('join', function(data){
              google_id = data;
                console.log(room_name);
                sub.subscribe(room_name);
                  client.set('google_id', data);
                     console.log('room name at join-------------------'+room_name);
              //add url to redis and store the user information for watch count
                      redis.sadd(room_name, data, function (err,reply){ });
                      //to retrieve no of users at youtube url.
                      redis.scard(room_name, function (err, data){
                        client.emit('roomcount', { visits : data });
                          console.log('no of records in redis is ---------'+data);
                      });
              //client.broadcast.to(room_name).emit('message', { message: data + " just joined!", username: "Server Announcement", timest : datediff });
             });
  //join socket ends

  //like socket starts
      client.on('like', function(data){
     //push(add) like userid in array with the referance of chatid
     //if(data.msglike_status=)
     console.log('data like status '+data.like_msgstatus);
     if(data.like_msgstatus==false)
     {
      console.log('userlike is false ---------------');
             db.likes_info.update({
            chat_id : data.like_chat_id},
            {$pull:{like_mail_id : data.like_mail_id}}, function (err,updated)
            {
               if(err) throw err;
              else
                console.log('unlikes info saved');
              var likescount1;
                   db.likes_info.aggregate([{ $match : { chat_id : data.like_chat_id } },{$project: { count: { $size:'$like_mail_id' },_id:false}}]).exec(function(err,data1){
                              if(err) throw err;
                              else
                                if(data1.length<1)
                                {
                                  likescount1 = 0;
                                  console.log('unlike not work '+data1+' is '+data1.length);
                                  io.sockets.to(room_name).emit('like', { chatid : data.like_chat_id, likescount : likescount1, youtubeid : room_name, username : google_id, userlike : false});      

                                 }                                
                                else
                                {
                                 likescount1 = data1[0].count;
                                   console.log('un likescount1 is '+likescount1);
                                    io.sockets.to(room_name).emit('like', { chatid : data.like_chat_id, likescount : likescount1, youtubeid : room_name, username : google_id, userlike : false});      

                                 }
                             });
  

            });
     }
     else
     {
      console.log('userlike is true ----------------');
             db.likes_info.update({
            chat_id : data.like_chat_id},
            {$addToSet:{like_mail_id : data.like_mail_id}},{upsert:true}, function (err,updated)
            {
               if(err) throw err;
              else
                console.log('likes info saved fro '+data.like_chat_id);
              var likescount1;
                   db.likes_info.aggregate([{ $match : { chat_id : data.like_chat_id } },{$project: { count: { $size:'$like_mail_id' },_id:false}}]).exec(function(err,data1){
                              if(err) throw err;
                              else
                                if(data1.length<1)
                                {
                                  likescount1 = 1;
                                  console.log('like not work '+data1+' is '+data1.length);
                                  io.sockets.to(room_name).emit('like', { chatid : data.like_chat_id, likescount : likescount1, youtubeid : room_name, username : google_id, userlike : true});      

                                 }                                
                                else
                                {
                                 likescount1 = data1[0].count;
                                   console.log('likescount1 is '+likescount1);
                                    io.sockets.to(room_name).emit('like', { chatid : data.like_chat_id, likescount : likescount1, youtubeid : room_name, username : google_id, userlike : true});      

                                 }
                             });
  

            });
   
     }


           });

  //like socket end

    //un like socket starts
      client.on('unlike', function(data){
     //pull(remove) like userid in array with the referance of chatid
           db.likes_info.update({
            chat_id : data.chat_id},
            {$pull:{like_mail_id : data.like_mail_id}},{upsert:true}, function (err,updated)
            {
               if(err) throw err;
              else
                console.log('unlikes info saved');
            });
           });

  //un like socket end

   //Block socket starts
       client.on('block', function(data){
     //pull(remove) like userid in array with the referance of chatid
           db.spam_info.update({
            actusr_mail_id : google_id},
            {$addToSet:{spamusr_mail_id : data.spamusr_mail_id}},{upsert:true}, function (err,updated)
            {
               if(err) throw err;
              else
                console.log('block info saved');
            });
           });
  //Block socket end

     //spoiler socket starts
       client.on('spoiler', function(data){
     //pull(remove) like userid in array with the referance of chatid
           db.spoiler_info.update({_id:null},{$addToSet:{spoilers : data.chatid}},{upsert:true}, function (err,updated)
            {
               if(err) throw err;
              else
                console.log('spoilers info saved');
                io.sockets.to(room_name).emit('spoiler', { chatid : data.chatid, spoiler : "1", youtubeid : room_name});      

            });
           });
  //spoiler socket end

  //urlinfo socket for retrieve previous chat information
      client.on('urlinfo', function(data){
            var arraychat_id = [], arraychat_msg = [], arraychat_time = [], arrayuserlike = [], arraymail_id =[];
            var arraylikescount = [], arrayspoilers = [];
            var spamusers;
            var arrayspamusers = [];
            var arrayspamusers1=[];

            var chatinfo = function()
            {
                var array = arrayspamusers.toString().split(",");
                  for(i in array) {
                    arrayspamusers1.push(array[i]);
                  }
          
                 db.chat_info.find({"url_path" : data,"mail_id":{$nin:arrayspamusers1}},function(err,info){
                  if(err) throw err;
                  else{
                  var i = 0;

                   while(i<info.length){
                  var userlike = 'false';
                  arraychat_id.push(info[i].chat_id);
                  arraychat_msg.push(info[i].chat_msg);
                  arraychat_time.push(info[i].chat_time);
                  arraymail_id.push(info[i].mail_id);
                    i++;
                 }
               //while ends here

               //async function to execute db operation synchronous
               //arraychat_id is the array in that each array element will allocate to item argument
                async.eachSeries(arraychat_id, function(item, callback){
                         db.likes_info.aggregate([{ $match : { chat_id : item } },{$project: { count: { $size:'$like_mail_id' },_id:false}}]).exec(function(err,data){
                              if(err) throw err;
                              else
                                if(data.length<1)
                                {
                                  arraylikescount.push("0");
                                }
                                else
                                {
                                  arraylikescount.push(data[0].count);
                                 }
                             });
                         db.spoiler_info.find({"_id":null,"spoilers":item}).count().exec(function(err,data){
                                if(data==0){
                                  arrayspoilers.push("0");
                                   }
                                else{
                                 arrayspoilers.push("1");
                                    }
                                 });
                         console.log(arrayspoilers);

                         db.likes_info.find({"chat_id":item,"like_mail_id":google_id}).count().exec(function(err,data){
                                if(data==0){
                                  arrayuserlike.push(false);
                                   }
                                else{
                                 arrayuserlike.push(true);
                                    }
                                  callback(); //tells that function completed the operation
                                });
                   //find query ends here
                         },      //async first function ends here
                      function(err){
                                for(var i=0;i<arraychat_id.length;i++){
                                   client.emit('message', { message: arraychat_msg[i], username: arraymail_id[i], timest : arraychat_time[i], chatid : arraychat_id[i], userlike : arrayuserlike[i], likescount : arraylikescount[i], youtubeid : room_name, spoiler : arrayspoilers[i] });
                                            } // for loop ends here
                });
              //end of async module
                }
                //else loop for url_info collection data ends here
              });

              //db find loop ends here
          }
            //chat info function ends here

               async.parallel([function(callback){
                         db.spam_info.find({"actusr_mail_id":google_id},{"spamusr_mail_id":1,"_id":0,"actusr_mail_id":1}).exec(function(err,result){
                                     if(err) throw err
                                      else{
                                        spamusers = JSON.stringify(result);
                                            if(result.length>0){
                                                   arrayspamusers.push(result[0].spamusr_mail_id);
                                                }
                                            callback();
                                               }
                                    });
                    }],
                      function(err){
                              console.log('succesfully=================');
                              console.log('array spam users are '+arrayspamusers);
                              chatinfo();
                })
            //async parallel ends here
          });
  //url info socket ends here

                var maxid ='';
      
          sub.on('message', function(channel,msg){
              client.emit('message', msg);
          })
            //message socket to send messages starts here
        client.on('message', function(data){
            //find loop ends here
           //query to retrieve last chat message   
          db.chat_info.find().sort({"chat_time":-1,"chat_id":-1}).limit(1).exec(function(err, docs) {
          //generate time for adding chat_id
              var date = new Date();
              var current_year = date.getFullYear();
              var current_month = date.getMonth();
              var current_date = date.getDate();
              var chatidtime = current_year+''+(current_month+1)+''+current_date;

                   if(docs.length!=0){
                          if(chatidtime==docs[0].chat_id.substr(0,8))
                               {
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
                     new db.chat_info({
                          url_path : room_name,
                        mail_id : google_id,
                        chat_time : Date.now(),
                        chat_msg : data,
                        chat_id : chatidtime+maxid1
                      }).save( function( err, comment, count ){
                        console.log('data saved');
                      });

               var chatid = chatidtime+maxid1;
               var userlike ='';
               console.log('google_id is '+google_id);

           var info = { message : data, username : google_id, timest : datediff, chatid : chatid, userlike : false, likescount : 0, youtubeid : room_name, spoiler : "0"};

               //pub.publish(room_name,JSON.stringify(info));
            io.sockets.to(room_name).emit('message', info);      
        
          });
          //find query ends here which is for retrive last chat message id
         
            });

    //message socket ends here

    //disconnect socket code starts form here
        client.on('disconnect', function  () {
             console.log('client disconnected for '+room_name+' and mail_id is '+google_id+'');
                 redis.srem(room_name, google_id, function (err,reply){ });
            });
        //disconnect socket ends here

});
 //connection socket ends here

redis.on("error", function (err) {
console.log("Error " + err);
});

