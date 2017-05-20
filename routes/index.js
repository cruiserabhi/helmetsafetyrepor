var express = require('express');
var request = require('request');               /*Express Request model*/
var mongoose = require('mongoose');             /*MongoDB NodeJS Driver*/
const weather = require('openweathermap-js');        /*Open Weather APi*/
var Promise = require('promise');

//! DB connectin reference

var db = mongoose.connection;
//! When there is an ERROR in connnection
db.on('error', function callback(err) {console.log("Database connection failed. Error: " + err);});
//! When DB Connection is made successfully
db.once('open', function callback() {console.log("Database connection successful.");});
//! Mongoose connection to MongoDB 
mongoose.connect(process.env.MONGODB_URI||'mongodb://localhost:27017/helmetsafety', function (error) {
    if (error != null) {
        console.log(error);
    }
});


/*OpenWeather API KEY*/
var weatherkey = "0078a5fc6f82112d6c8c3587c19ec745";

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

function requestData(lat, long)
{
    var ret = new Promise(function (resolve, reject) {
        /*
         Request for weather corresponding to a Lat/Long
         */
        var url = "http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + long +
            "&appid=" + weatherkey;

        request(url, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                try {
                    var weatherData = JSON.parse(body);
                    resolve(weatherData);
                } catch (e) {
                    reject('URL could not be resolved. ' +
                        'Hint from the provider was received ' +
                        'instead of JSON.');
                }
            } else {
                reject('Requesting data from openweathermap has failed completely.\n' + 'Please check the provided location-argument.');
            }
        });
    });
    return ret;
};

/*Get Weather Data*/
router.get('/weather/:lat/:lon', function (req, res, next) {
    var lat = req.params.lat;
    var lon = req.params.lon;
    requestData(lat, lon).then(function (weatherData) {
        res.json(weatherData);
        res.end();
    }).catch(function (errorMessage) {
        res.json(errorMessage);
        res.end();
    });
});

module.exports = router;
