var mongoose = require( 'mongoose' );
mongoose.connect( 'mongodb://localhost/youtubechat_db' );
var Schema   = mongoose.Schema;
var Schema1 = mongoose.Schema;
var Schema2 = mongoose.Schema;
var Schema3 = mongoose.Schema;
var Schema4 = mongoose.Schema;
 
var Comment = new Schema({
    usr_id : String,
    username  : String,
    image : String,
    DOB : Date,
    gender : String,
    contact : String,
    online : Boolean,
    created  : Date
});
 var colusrinfo = "usr_info"
exports.usr_info = mongoose.model( 'usr_info', Comment, colusrinfo );


var url = new Schema1({
   url_path  : String,
    mail_id : String,
    chat_time  : Date,
    chat_msg : String,
    chat_id : String
});

 var colname = "chat_info";
exports.chat_info = mongoose.model( 'chat_info', url, colname );


var likes = new Schema2({
   chat_id  : String,
    like_mail_id : String
});

 var colname = "likes_info";
exports.likes_info = mongoose.model( 'likes_info', likes, colname );
 
var spams = new Schema3({
   actusr_mail_id  : String,
    spamusr_mail_id : String
});

 var colname = "spam_info";
exports.spam_info = mongoose.model( 'spam_info', spams, colname );

var spoiler = new Schema4({
   spoilers  : String
});

 var colname = "spoiler_info";
exports.spoiler_info = mongoose.model( 'spoiler_info', spoiler, colname );
 

 


