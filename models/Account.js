const mongoose = require("mongoose");

const Account = mongoose.Schema({
    username: {
        type: String,
        required: true
       },
    acctype: {
        type: String,
        required: true
       },
    accnum: {
        type: Number,
        required: true,
        unique: true
       },
    openingdate: {
        type: Date,
        required: true
       },
    balance: Number,
    atmcardnum: String,
    atmcardcvv: Number,
    atmcardexp: Date,
    loan: {
        loanType: {
            type: String
        },
        loanDurYears: {
            type: Number
        },
        loanAmount: {
            type: Number
        },
        amountLeft: {
            type: Number
        },
        loanDate: {
            type: Date
        },
    },
    transactions: [{
        otherPartyAccNum: {
            type: Number
           },
        type: {
            type: String
        },
        source: {
            type: String
        },
        amount: {
            type: Number
           },
        dateOfTrans: {
            type: Date
        }
    }]
})

module.exports = mongoose.model('Account', Account);