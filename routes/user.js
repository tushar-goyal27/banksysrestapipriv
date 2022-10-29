const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

require("dotenv/config");

const router = express.Router();

function calcser(ch) {
    // function to calculate the series of each alphabet
    if (ch == "a") {
        return 1;
    }
    return 2 * calcser(String.fromCharCode(ch.charCodeAt(0) - 1)) + ch.charCodeAt(0) - "a".charCodeAt(0) + 1;
}

router.post('/signup', (req, res) => {
    var usernameLower = req.body.username.toLowerCase();

    User.find({username: usernameLower}).exec()
    .then(users => {
        if (users.length != 0) {
            return res.status(409).json({message: "Username already exists"});
        }

        // calculation of customer id
        var sum = 0;
        for (let i = 0; i < usernameLower.length; i++) {
            sum += calcser(usernameLower[i]);
        }

        // hashing the password before storing in database
        bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
                console.log(err);
                return res.status(500).json({error: err});
            }
            const newuser = new User({
                username: usernameLower,
                customerid: sum,
                fullname: req.body.fullname,
                email: req.body.email,
                phonenum: req.body.phonenum,
                dob: req.body.dob,
                address: req.body.address,
                password: hash
            });
        
            newuser.save()
            .then(data => {
                res.status(200).json({
                    message: "User with username " + usernameLower + " created"
                });
            })
            .catch(err => {
                console.log(err);
                res.status(404).json({error: err});
            });
        })
    })
    .catch(err => {
        console.log(err);
        res.status(404).json({error: err});
    }); 
});

router.post('/login', (req, res) => {
    var usernameLower = req.body.username.toLowerCase();

    User.find({username: usernameLower}).exec()
    .then(user => {
        if (user.length == 0) {
            return res.status(401).json({
                message: "Auth Failed"
            });
        }
        
        // Comparing the hashed passwords
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(401).json({
                    message: "Auth Failed"
                });
            }
            if (result) { 
                // jwt token for verifying auth for protected routes
                const token = jwt.sign({
                    username: usernameLower,
                    userid: user[0]._id
                }, process.env.JWT_KEY);

                res.status(200).json({
                    message: "Auth Passed",
                    token: token
                });
            } else {
                res.status(401).json({
                    message: "Auth Failed"
                });
            }
        })
    })
});

module.exports = router;