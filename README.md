# Banking System RESTAPI

REST API for a model Banking System developed with ExpressJS and MongoDB.

To run locally, dowload the code or clone the repository  
Open the terminal in the folder where app.js is present and run the following command
```
npm install
```

In .env-sample file add the following data and rename the file to .env
```
DB_CONNECTION = YOUR DB CONNECTION URL
JWT_KEY = YOUR JWT SECRET KEY
```

To run the server, execute the following command in the terminal where app.js is
```
npm start
```

## API Routes

### SignUp
Request Url 
```
localhost:5000/user/signup
```
Request Mandatory Headers: None  
Request Body: JSON(All required Parameters)  
Example:
```json
{
    "username": "testuser",
    "password": "abcdefv",
    "address": "Anywhere Street, Any City, Country",
    "email": "anything@anything.com",
    "dob": "2-2-2000",
    "phonenum": "0123456789",
    "fullname": "Test User"
}
```

### Login
Request Url 
```
localhost:5000/user/login
```
Request Mandatory Headers: None  
Request Body: JSON(All required Parameters)  
Example:
```json
{
    "username": "testuser",
    "password": "abcdefv"
}
```

IMPORTANT: This request will return a token. Add it to all the further urls as a header with key "Authorization" and value as "Bearer <token>".  

### Create Account
Request Url 
```
localhost:5000/account/create
```
Request Mandatory Headers: 
```
Authorization: Bearer <your token>
```

Request Body: JSON(All required Parameters)  
acctype can be: "current", "savings", "loan"  
For type "current" and "savings", the request body json parameters are
```json
{
    "acctype": "current or savings",
    "balance": "<your amount as a number>"
}
```
For type "loan", the request body json parameters are
```json
{
    "acctype": "loan",
    "loanAmount": "<your amount as a number>",
    "loanType": "<your loan type as a string>",
    "loanDurYears": "<your loan duration in years as number>"
}
```
### Get Details
Request Url 
```
localhost:5000/account/getdetails
```
Request Mandatory Headers: 
```
Authorization: Bearer <your token>
```

Request Body: JSON(All required Parameters)  
```json
{
    "accnum": "<your accnum as a number>"
}
```

### Get Passbook
Request Url 
```
localhost:5000/account/getpassbook
```
Request Mandatory Headers: 
```
Authorization: Bearer <your token>
```

Request Body: JSON(All required Parameters)  
```json
{
    "accnum": "<your accnum as a number>"
}
```

### Deposit
Request Url 
```
localhost:5000/transact/deposit
```
Request Mandatory Headers: 
```
Authorization: Bearer <your token>
```

Request Body: JSON(All required Parameters)  
```json
{
    "accnum": "<your accnum as a number>",
    "amount": "<your amount to deposit as number>"
}
```

### Withdraw
Request Url 
```
localhost:5000/transact/transfer
```
Request Mandatory Headers: 
```
Authorization: Bearer <your token>
```

Request Body: JSON(All required Parameters)  
```json
{
    "accnum": "<your accnum as a number>",
    "amount": "<your amount to withdraw as number>",
    "transtype": "<direct or atm>"
}
```

### Transfer
Request Url 
```
localhost:5000/transact/transfer
```
Request Mandatory Headers: 
```
Authorization: Bearer <your token>
```

Request Body: JSON(All required Parameters)  
```json
{
    "accnum": "<your accnum as a number>",
    "amount": "<your amount to transfer as number>",
    "transferTo": "<acc num of the reciver as number>"
}
```

### Repay Loan
Request Url 
```
localhost:5000/transact/repay
```
Request Mandatory Headers: 
```
Authorization: Bearer <your token>
```

Request Body: JSON(All required Parameters)  
```json
{
    "accnum": "<your accnum as a number>",
    "amount": "<your amount to repay as number>",
}
```
