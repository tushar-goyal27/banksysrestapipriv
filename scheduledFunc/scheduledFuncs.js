const schedule = require('node-schedule');

const Account = require("../models/Account");

exports.initScheduledFunc = () => {
    const lastDayMonth = new schedule.RecurrenceRule();
    lastDayMonth.date = 31;

    const lastDayMonthjob = schedule.scheduleJob(lastDayMonth, function(){
        // Interest payment at end of the month
        Account.find({acctype: "savings"}).exec()
        .then(savingaccs => {
            savingaccs.forEach(acc => {
                const today = new Date();
                const interest = acc.balance * 0.06;
                acc.balance += interest;

                acc.transactions.push({
                    otherPartyAccNum: 987654321012, // Account number of the bank
                    type: "credit",
                    source: "bank",
                    amount: interest,
                    dateOfTrans: today
                });

                acc.save()
                .then(savedaccount => {
                    console.log("Interest Paid");
                })
                .catch(err => {
                    console.log(err);
                });
            });
        })
        .catch(err => {
            console.log(err);
        })

        // Fees for low number of transactions
        Account.find({acctype: "current"}).exec()
        .then(curraccs => {
            curraccs.forEach(acc => {
                const today = new Date();
                
                const beginMonth = new Date();
                beginMonth.setUTCHours(0, 0, 0);
                beginMonth.setUTCDate(1);
                i = acc.transactions.length - 1;
                var monthtrans = 0;
                while(i >= 0 && acc.transactions[i].dateOfTrans > beginMonth) {
                    monthtrans++;
                    i--;
                }

                if (monthtrans < 3) {
                    acc.balance -= 500;
                    acc.transactions.push({
                        otherPartyAccNum: 987654321012, // Account number of the bank
                        type: "debti",
                        source: "bank",
                        amount: 500,
                        dateOfTrans: today
                    });
                }

                acc.save()
                .then(savedaccount => {
                    console.log("Fees taken");
                })
                .catch(err => {
                    console.log(err);
                });
            });
        })
        .catch(err => {
            console.log(err);
        })
    });
}