/*
CSC3916 HW3
File: Server.js
Description: Movie API using MongoDB
*/

var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var passport = require('passport');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var User = require('./Users');
var Movie = require('./Movies');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

router.post('/signup', function (req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({ success: false, msg: 'Please include both username and password to signup.' })
    } else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function (err) {
            if (err) {
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists.' });
                else
                    return res.json(err);
            }

            res.json({ success: true, msg: 'Successfully created new user.' })
        });
    }
});

router.post('/signin', function (req, res) {
    var userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function (err, user) {
        if (err) {
            res.send(err);
        }

        user.comparePassword(userNew.password, function (isMatch) {
            if (isMatch) {
                var userToken = { id: user.id, username: user.username };
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json({ success: true, token: 'JWT ' + token });
            }
            else {
                res.status(401).send({ success: false, msg: 'Authentication failed.' });
            }
        })
    })
});

router.route('/movies')
    .post(authJwtController.isAuthenticated, function (req, res) {
        var newMovie = new Movie();
        newMovie.title = req.body.title;
        newMovie.yearReleased = req.body.yearReleased;
        newMovie.genre = req.body.genre;
        newMovie.actors = req.body.actors;
        newMovie.save(function (err) {
            if (err) {
                return res.status(400).json(err);
            }
            res.json({ success: true, msg: 'Successfully created new movie.' })
        });
    })

app.use('/', router);

app.use(function (req, res) {
    res.status(405).send("Method not allowed");
});

app.listen(process.env.PORT || 8080);
// module.exports = app; // for testing only
