var mongoose = require( 'mongoose' );
mongoose.connect( 'mongodb://localhost/youtubechat_db' );
var Schema   = mongoose.Schema;
var Schema1 = mongoose.Schema;
 
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
 


