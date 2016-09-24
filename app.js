var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var users = require('./routes/users');
var app = express();
var GooglePlaces = require('google-places');
var places = new GooglePlaces('AIzaSyAP8KGW9N3KPxDiPhqPWC0WAC2-BUwK64M');
var _ = require('underscore');
var request = require("request");
var twilio = require('twilio')('AC22b9e3d62610aaef92c4bdab5c7b811a', '251943b2b70688e5d59e8509f7427d78');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.get('/index', function(req, res) {
    res.sendfile(path.join(__dirname + '/public/index.html'));
});

app.get('/places', function(req, res) {
    places.search({
      keyword: "hospital", 
      location: [req.query.lat, req.query.lon],
      radius: 49999,
      opennow: true
    }, function(err, response) {
    if (err) {
      console.error(err);
      res.send(err);
    } else {
      if (response.results.length > 0) {
        var thePlace = response.results[0];
        places.details({reference: thePlace.reference}, function(err, response) {
          if (err) {
            console.error(err)
            req.err = 500;
            next();
          } else {
            req.place = {
              name: response.result.name,
              map: response.result.url
            };
            var hospital = _.pluck(response.result.address_components, 'long_name').join(", ");
            res.send(hospital);
          }
        });
      } else {
        console.log("No hospitals found");
        res.send("Nothing found");
      }
    }
  });
});

app.get('/sickweather', function(req, res) {
  request({
    url: "https://mobilesvc.sickweather.com/ws/v1.1/getForecast.php?lat=" + req.query.lat + "&lon=" + req.query.lon + "&api_key=GX3RD5Xx3wJmBSitk9Ee",
    method: "GET",
    json: true,
    headers: {
    },
    body: {}
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      console.log("200: ", body)
    }
    else {
      console.log("error: " + error)
      console.log("response.statusCode: " + response.statusCode)
      console.log("response.statusText: " + response.statusText)
    }
    res.send(body);
  });
});

app.get('/twiliotest', function(req, res) {
  twilio.sendMessage({
    to: "+16507993840",
    from: '+16503004250',
    body: "Ola twilio!",
    }, function(err, responseData) { //this function is executed when a response is received from Twilio
        if (!err) { // "err" is an error received during the request, if any
            console.log(responseData.from); // outputs "+14506667788"
            console.log(responseData.body); // outputs "word to your mother."
        }
    });
});

app.get('/getinfotext', function(req, res) {
  request({
    url: "https://mobilesvc.sickweather.com/ws/v1.1/getForecast.php?lat=" + req.query.lat + "&lon=" + req.query.lon + "&api_key=GX3RD5Xx3wJmBSitk9Ee",
    method: "GET",
    json: true,
    headers: {},
    body: {}
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      console.log("200: ", body)
      myWords = []
      for (i = 0; i < body.words.length; i++) {
        myWords.push(body.words[i].toUpperCase())
      }
      var words = [myWords.slice(0, -1).join(', '), myWords.slice(-1)[0]].join(myWords.length < 2 ? '' : ' and ');
      var message = "Thanks to Sick Weather, you have " + body.words.length + " warnings in your area. They are: " + words + ". Reply the name of the warning you are interested in to get more information dawg."
      twilio.sendMessage({
        to: "+16507993840",
        from: '+16503004250',
        body: message,
        }, function(err, responseData) { //this function is executed when a response is received from Twilio
            if (!err) { // "err" is an error received during the request, if any
                console.log(responseData.from); // outputs "+14506667788"
                console.log(responseData.body); // outputs "word to your mother."
            }
            res.send(responseData);
        });
    }
    else {
      console.log("error: " + error)
      console.log("response.statusCode: " + response.statusCode)
      console.log("response.statusText: " + response.statusText)
    }
  });
})

module.exports = app;
