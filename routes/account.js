const express = require("express");

const User = require("../models/User");
const Account = require("../models/Account");

const auth = require("../middleware/auth");

require("dotenv/config");

const router = express.Router();

router.post("/create", auth, (req, res) => {
    const username = req.userdata.username;
    
    
    
    if (req.body.acctype.toLowerCase() == "savings") {
        // Check if every req parameter is passed
        if (!(req.body.acctype && req.body.balance)) {
            return res.status(500).json({
                message: "Required Parameters acctype, balance not passed"
            });
        }
        if (req.body.balance < 10000 || !req.body.balance) {
            return res.status(400).json({
                message: "Invalid ammount"
            });
        }
        const accnum = Math.floor(Math.random() * (987654321012 - 123456789012) + 123456789012);

        // Generating random atm number and cvv
        const atmcardnum1 = Math.floor(Math.random() * (99999999 - 11111111) + 11111111);
        const atmcardnum2 = Math.floor(Math.random() * (99999999 - 11111111) + 11111111);
        const atmcardnum = atmcardnum1.toString().concat("", atmcardnum2.toString());

        const cvv = Math.floor(Math.random() * (999 - 100) + 100);

        const today = new Date();

        // Calculating Expiry after 10 years
        const exp = new Date();
        exp.setDate(exp.getDate() + 3650);
        exp.setUTCDate(30);

        const newacc = new Account({
            username: username,
            acctype: req.body.acctype.toLowerCase(),
            accnum: accnum,
            openingdate: today,
            balance: req.body.balance,
            atmcardnum: atmcardnum,
            atmcardcvv: cvv,
            atmcardexp: exp,
            transactions: [{
                otherPartyAccNum: accnum,
                type: "credit",
                source: "deposit",
                amount: req.body.balance,
                dateOfTrans: today
            }]
        });

        // Saving the account number to User Model for the current user
        User.findOne({username: username}).exec()
        .then(user => {
            user.accounts.push(accnum);

            user.save()
            .then(saveduser => {
                console.log("User Saved");
            })
            .catch(err => {
                console.log(err);
            });
        });

        newacc.save()
        .then(data => {
            res.status(200).json(data);
        })
        .catch(err => {
            console.log(err);
            res.status(404).json({error: err});
        });
    } else if (req.body.acctype.toLowerCase() == "current") {
        // Check if every req parameter is passed
        if (!(req.body.acctype && req.body.balance)) {
            return res.status(500).json({
                message: "Required Parameters acctype, balance not passed"
            });
        }
        if (req.body.balance < 100000 || !req.body.balance) {
            return res.status(400).json({
                message: "Invalid ammount"
            });
        }

        const today = new Date();
        User.findOne({username: username}).exec()
        .then(user => {
            const dob = user.dob;
            if(Math.abs(today - dob) < 569000000000) {
                // Age must be greater than 18
                return res.status(400).json({
                    message: "Age must be 18"
                });
            }

            const accnum = Math.floor(Math.random() * (987654321012 - 123456789012) + 123456789012);
        
            const newacc = new Account({
                username: username,
                acctype: req.body.acctype.toLowerCase(),
                accnum: accnum,
                openingdate: today,
                balance: req.body.balance,
                transactions: [{
                    otherPartyAccNum: accnum,
                    type: "credit",
                    source: "deposit",
                    amount: req.body.balance,
                    dateOfTrans: today
                }]
            });

            // Saving the account number to User Model for the current user
            User.findOne({username: username}).exec()
            .then(user => {
                user.accounts.push(accnum);

                user.save()
                .then(saveduser => {
                    console.log("User saved");
                })
                .catch(err => {
                    console.log(err);
                });
            })

            // saving the account to Account Model
            newacc.save()
            .then(data => {
                res.status(200).json(data);
            })
            .catch(err => {
                console.log(err);
                res.status(404).json({error: err});
            });
        })
        .catch(err => {
            console.log(err);
            res.status(404).json({error: err});
        });
    } else if(req.body.acctype.toLowerCase() == "loan") {
        const today = new Date();
        const accnum = req.body.accnum;

        // Check if every req parameter is passed
        if (!(req.body.accnum && req.body.loanAmount && req.body.loanDurYears && req.body.loanType)) {
            return res.status(500).json({
                message: "Required Parameters accnum, loanAmount, loanType or loanDurYears not passed"
            });
        }

        User.findOne({username: username}).exec()
        .then(user => {
            if (user.accounts.length < 1) {
                return res.status(403).json({
                    message: "User must have atleast one account with the bank"
                });
            }

            // Loan account must be linked with an account in the same bank
            Account.findOne({accnum: accnum}).exec()
            .then(account => {
                if(account.username != username) {
                    return res.status(500).json({
                        message: "Auth Failed"
                    });
                }
                if (req.body.loanAmount < 500000 || Math.abs(today - user.dob) < 7899000000000 || req.body.loanDurYears < 2) {
                    return res.status(409).json({
                        message: "Can't give loan"
                    });
                }

                account.loan = {
                    loanType: req.body.loanType.toLowerCase(),
                    loanDurYears: req.body.loanDurYears,
                    loanAmount: req.body.loanAmount,
                    amountLeft: req.body.loanAmount,
                    loanDate: today
                }

                account.balance += req.body.loanAmount;

                account.transactions.push({
                    otherPartyAccNum: 987654321012, // Account number of the bank from which loan was given
                    type: "credit",
                    source: "loan",
                    amount: req.body.loanAmount,
                    dateOfTrans: today
                });

                account.save()
                .then(savedaccount => {
                    res.status(200).json({
                        message: "Loan initiated and added to account " + accnum
                    });
                })
                .catch(err => {
                    console.log(err);
                });
            })

                
        });
    } else {
        res.status(400).json({
            message: "Invalid Acc Type"
        });
    }
})

router.get("/getdetails", auth, (req, res) => {
    const username = req.userdata.username;
    const accnum = req.body.accnum;

    if (!req.body.accnum) {
        return res.status(500).json({
            message: "Required parameter accnum not passed"
        });
    }

    // get details of the given account
    Account.findOne({accnum: accnum}).exec()
    .then(account => {
        if (account.username != username) {
            res.status(500).json({
                message: "Unauthorized"
            });
        } else {
            res.status(200).json({
                accnum: accnum,
                balance: account.balance,
                openingdate: account.openingdate
            });
        }
    })
    .catch(err => {
        console.log(err);
        res.status(404).json({error: err});
    });
})

router.get("/getpassbook", auth, (req, res) => {
    const username = req.userdata.username;
    const accnum = req.body.accnum;

    if (!req.body.accnum) {
        return res.status(500).json({
            message: "Required parameter accnum not passed"
        });
    }

    // get passbook containing all the transactions of the given account
    Account.findOne({accnum: accnum}).exec()
    .then(account => {
        if (account.username != username) {
            res.status(500).json({
                message: "Unauthorized"
            });
        } else {
            res.status(200).json({
                transactions: account.transactions
            });
        }
    })
    .catch(err => {
        console.log(err);
        res.status(404).json({error: err});
    });
})

module.exports = router;