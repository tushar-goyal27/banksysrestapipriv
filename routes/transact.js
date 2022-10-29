const express = require("express");

const User = require("../models/User");
const Account = require("../models/Account");

const auth = require("../middleware/auth");

require("dotenv/config");

const router = express.Router();

router.post("/deposit", auth, (req, res) => {
    const username = req.userdata.username;
    const accnum = req.body.accnum;

    // Check if every req parameter is passed
    if (!(req.body.accnum && parseInt(req.body.amount))) {
        return res.status(500).json({
            message: "Required Parameters accnum and amount not passed"
        });
    }

    // Find account to which to deposit the money
    Account.findOne({accnum: accnum}).exec()
    .then(account => {
        if (account.username != username) {
            return res.status(500).json({
                message: "Unauthorized"
            });
        }
        if (parseInt(req.body.amount) <= 0) {
            return res.status(409).json({
                message: "Invalid Amount"
            });
        }
        account.balance += parseInt(req.body.amount);
        const today = new Date();

        account.transactions.push({
            otherPartyAccNum: accnum,
            type: "credit",
            source: "deposit",
            amount: parseInt(req.body.amount),
            dateOfTrans: today
        });

        // Saving the updated account to Accounts Model
        account.save()
        .then(savedaccount => {
            res.status(200).json({
                message: "Deposited"
            });
        })
        .catch(err => {
            console.log(err);
        });
    })
    .catch(err => {
        console.log(err);
        res.status(404).json({error: err});
    });
});

router.post("/withdraw", auth, (req, res) => {
    const username = req.userdata.username;
    const accnum = req.body.accnum;

    // Check if every req parameter is passed
    if (!(req.body.accnum && parseInt(req.body.amount) && req.body.transtype)) {
        return res.status(500).json({
            message: "Required Parameters accnum, amount or transtype not passed"
        });
    }

    if (req.body.transtype != "atm" && req.body.transtype != "direct") {
        return res.status(500).json({
            message: "Invalid Transtype"
        });
    }
    

    Account.findOne({accnum: accnum}).exec()
    .then(account => {
        if (account.username != username) {
            return res.status(500).json({
                message: "Unauthorized"
            });
        } 

        if(account.acctype != "savings") {
            return res.status(500).json({
                message: "Withdrawl are from only savings account"
            });
        } else {
            if (parseInt(req.body.amount) <= 0 || parseInt(req.body.amount) > 50000) {
                return res.status(409).json({
                    message: "Invalid Amount"
                });
            }

            if (parseInt(req.body.amount) > account.balance) {
                return res.status(409).json({
                    message: "Insufficient Balance"
                });
            }

            // Calculating transaction amount for all transactions for the current day
            const today = new Date();
            const beginToday = new Date();
            beginToday.setUTCHours(0, 0, 0);
            var i = account.transactions.length - 1;
            var dailywithsum = 0
            while(i >= 0 && account.transactions[i].dateOfTrans > beginToday) {
                if (account.transactions[i].source == "atm" || account.transactions[i].source == "direct") {
                    dailywithsum += account.transactions[i].amount;
                }
                i--;
            }

            // Calculating total number of atm transactions in the past month
            const beginMonth = new Date();
            beginMonth.setUTCHours(0, 0, 0);
            beginMonth.setUTCDate(1);
            i = account.transactions.length - 1;
            var monthatmtrans = 0;
            while(i >= 0 && account.transactions[i].dateOfTrans > beginMonth) {
                if (account.transactions[i].source == "atm") {
                    monthatmtrans++;
                }
                i--;
            }

            if (dailywithsum + parseInt(req.body.amount) > 50000) {
                console.log(dailywithsum + parseInt(req.body.amount));
                return res.status(409).json({
                    message: "Daily withdrawal limit passed"
                });
            }

            if (parseInt(req.body.amount) > 20000 && req.body.transtype == "atm") {
                return res.status(409).json({
                    message: "Transactional Amount limit crossed"
                });
            }

            account.balance -= parseInt(req.body.amount);

            // Check if account has more than 5 atm transactions
            if (monthatmtrans >= 5 && req.body.transtype == "atm") {
                account.balance -= 500;
                account.transactions.push({
                    otherPartyAccNum: 987654321012, // Account number of the bank
                    type: "debit",
                    source: "bank",
                    amount: 500,
                    dateOfTrans: today
                });
            }

            // Adding this transaction to account
            account.transactions.push({
                otherPartyAccNum: accnum,
                type: "debit",
                source: req.body.transtype,
                amount: parseInt(req.body.amount),
                dateOfTrans: today
            });

            // Saving the account in Account Models
            account.save()
            .then(savedaccount => {
                res.status(200).json({
                    message: "Withdrawal Successfull"
                });
            })
            .catch(err => {
                console.log(err);
            });
        }
    })
    .catch(err => {
        console.log(err);
        res.status(404).json({error: err});
    });
});

router.post("/transfer", auth, (req, res) => {
    const username = req.userdata.username;
    const accnum = req.body.accnum;

    // Checking if all req params are present
    if (!(req.body.accnum && parseInt(req.body.amount) && req.body.transferTo)) {
        return res.status(500).json({
            message: "Required Parameters accnum, amount or transferTo not passed"
        });
    }

    // Account of the sender
    Account.findOne({accnum: accnum}).exec()
    .then(account => {
        if (account.username != username) {
            return res.status(500).json({
                message: "Unauthorized"
            });
        }
        if (account.acctype != "current") {
            return res.status(403).json({
                message: "Transfer not supported"
            });
        }
        if (parseInt(req.body.amount) <= 0) {
            return res.status(403).json({
                message: "Invalid Amount"
            });
        }
        if (parseInt(req.body.amount) > account.balance) {
            return res.status(403).json({
                message: "Insufficient Balance"
            });
        }

        // Account of the reciever
        const transferTo = req.body.transferTo;
        Account.findOne({accnum: transferTo}).exec()
        .then(recAcc => {
            if (!recAcc) {
                return res.status(403).json({
                    message: "Account doesn't exist"
                });
            }
    
            recAcc.balance += parseInt(req.body.amount);
            account.balance -= parseInt(req.body.amount);
    
            if (parseInt(req.body.amount) * 0.005 >= 500) {
                account.balance -= 500;
                account.transactions.push({
                    otherPartyAccNum: 987654321012, // Account number of the bank
                    type: "debit",
                    source: "bank",
                    amount: 500,
                    dateOfTrans: today
                });
            } else {
                account.balance -= (parseInt(req.body.amount) * 0.005);
                account.transactions.push({
                    otherPartyAccNum: 987654321012, // Account number of the
                    type: "debit",
                    source: "bank",
                    amount: parseInt(req.body.amount) * 0.005,
                    dateOfTrans: today
                });
            }
            
            // Adding transactions to both reciever and sender acc
            const today = new Date();
            recAcc.transactions.push({
                otherPartyAccNum: accnum,
                type: "credit",
                source: "transfer",
                amount: parseInt(req.body.amount),
                dateOfTrans: today
            });
    
            account.transactions.push({
                otherPartyAccNum: transferTo,
                type: "debit",
                source: "transfer",
                amount: parseInt(req.body.amount),
                dateOfTrans: today
            });

            // Saving recivers acc
            recAcc.save()
            .then(savedaccount => {
                console.log("money sent");
            })
            .catch(err => {
                console.log(err);
            });

            // Saving senders acc
            account.save()
            .then(savedaccount => {
                res.status(200).json({
                    message: "Transfer Successful"
                });
            })
            .catch(err => {
                console.log(err);
            });
        })
        .catch(err => {
            console.log(err);
            res.status(404).json({error: err});
        });
    })
});

router.post("/repay", auth, (req, res) => {
    const username = req.userdata.username;
    const accnum = req.body.accnum;

    // Checking if req params are present
    if (!(req.body.accnum && parseInt(req.body.amount))) {
        return res.status(500).json({
            message: "Required Parameters accnum, amount not passed"
        });
    }

    Account.findOne({accnum: accnum}).exec()
    .then(account => {
        if (account.username != username) {
            return res.status(500).json({
                message: "Unauthorized"
            });
        }
        if (!account.loan.loanType) {
            return res.status(409).json({
                message: "No loan on this account"
            });
        }
        if (parseInt(req.body.amount) <= 0) {
            return res.status(409).json({
                message: "Invalid Amount"
            });
        }
        if (parseInt(req.body.amount) > account.balance) {
            return res.status(409).json({
                message: "Insufficient money to repay loan"
            });
        }
        if (parseInt(req.body.amount) > account.loan.loanAmount * 0.1) {
            return res.status(409).json({
                message: "Can repay only 10% at a time"
            });
        }

        // Repayment from linked bank acc
        account.loan.amountLeft -= parseInt(req.body.amount);
        account.balance -= parseInt(req.body.amount);

        const today = new Date();
        account.transactions.push({
            otherPartyAccNum: accnum,
            type: "debit",
            source: "repay",
            amount: parseInt(req.body.amount),
            dateOfTrans: today
        });

        // The loan is payed completely
        if (account.loan.amountLeft == 0) {
            account.loan = {};
        }

        // Saving the account to Accounts Model
        account.save()
        .then(savedaccount => {
            res.status(200).json({
                message: "Repayment Successful"
            });
        })
        .catch(err => {
            console.log(err);
        });
        
    })
    .catch(err => {
        console.log(err);
        res.status(404).json({error: err});
    });
});

module.exports = router;