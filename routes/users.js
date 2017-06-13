var express = require('express');
var router = express.Router();
var app = require('../app');
var mongoose = require('mongoose');             /*MongoDB NodeJS Driver*/
const weather = require('openweathermap-js');        /*Open Weather APi*/
var Promise = require('promise');
var moment = require('moment-timezone');        /*For DateTime*/
var User = require("../models/users.js");


//! DB connectin reference

/*
 * HEROKU mLAB ID: mongodb://helmetsafety:heliumneon@ds147711.mlab.com:47711/helmetsafety
*/

//! Convert CST time to IST
function GetIST() {
    var m = moment.tz("America/Toronto");
    return (m.tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss").replace("+05:30", " "));
}


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/attend', function (req, res) {
    var port = process.env.PORT || 8125;
    res.render('pages/index', {
        port: port
    });
});

router.get('/attend/:userID', function (req, res) {
    var info = {};
    info.userID = req.params.userID;
    info.datetime = GetIST();
    io.emit('UserInfo', info);  

    //! create a new user
    var newUser = User({
        name: 'worker name from backend',
        username: info.userID,
        location: ""
    });

    try {
        //! save the user
        newUser.save(function (err) {
            if (err) throw err;
            console.log('User created!');
        });
    }
    catch (err)
    {
        console.log(err);
        res.send(err);
    }
    res.end();
});

router.get('/attend/:userID/:helmetstatus/:zone', function (req, res) {
    var info = {};
    info.userID = req.params.userID;
    info.datetime = GetIST();
    info.helmetstatus = req.params.helmetstatus;
    info.zone = req.params.zone;
    io.emit('UserHelmetInfo', info);
    try
    {
        User.findOneAndUpdate({ username: info.userID },
            {
                "$push":
                {
                    "helmet": {
                        "status": info.helmetstatus,
                        "updated_at": GetIST(),
                        "location": info.zone
                    }
                }
            },
            function (err, user) {
                if (err) throw err;
                console.log(user);
            });
    }
    catch (err) {
        console.log(err);
        res.send(err);
    }
    res.end();
});

router.get('/attend/:userID/:helmetstatus/:zone/:lat/:long', function (req, res) {
    var info = {};
    info.userID = req.params.userID;
    info.datetime = GetIST();
    info.helmetstatus = req.params.helmetstatus;
    info.zone = req.params.zone;
    info.lat = req.params.lat;
    info.long = req.params.long;
    io.emit('UserHelmetInfoTracking', info);
    try {
        User.findOneAndUpdate({ username: info.userID },
            {
                "$push":
                {
                    "helmet": {
                        "status": info.helmetstatus,
                        "updated_at": GetIST(),
                        "location": info.zone,
                        "lat": info.lat,
                        "long": info.long,
                    }
                }
            },
            function (err, user) {
                if (err) throw err;
                console.log(user);
            });
    }
    catch (err) {
        console.log(err);
        res.send(err);
    }
    res.end();
});

router.get('/history', function (req, res) {
    User.find({}, function (err, users) {
        if ((users != undefined) && (users.length != 0) && (err == null)) {
            res.render('pages/history', {
                users: users
            });
        }
        else {
            res.send("<html><body><h1>Worker Safety</h1><b>No Data Found in Database as of now...</b></body></html>");
            res.end();
        }
    });
});

module.exports = router;
