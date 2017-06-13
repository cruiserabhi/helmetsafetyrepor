var mongoose = require('mongoose');
//! set Promise provider to bluebird
mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;
var moment = require('moment-timezone');        /*For DateTime*/

//! create a schema
var userSchema = new Schema({
    name: String,
    username: { type: String, required: true, unique: true },
    created_at: String,
	helmet: [{
        status: String,
        updated_at: String,
        location: String,
        lat: String,
        long: String
    }],
});

//! Convert CST time to IST
function GetIST() {
    var m = moment.tz("America/Toronto");
    return (m.tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss").replace("+05:30", " "));
}


//! on every save, add the date
userSchema.pre("save", function (next) {
    //! get the current date
    var currentDate = GetIST();

    // if created_at doesn't exist, add to that field
    if (!this.created_at)
        this.created_at = currentDate;

    next();
});

//! we need to create a model using it
var User = mongoose.model('User', userSchema);

//! make this available to our users in our Node applications
module.exports = User;