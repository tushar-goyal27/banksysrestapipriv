const jwt = require("jsonwebtoken");

require("dotenv/config");

module.exports = (req, res, next) => {
    // Middleware to check if the user is logged in or not
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.userdata = decoded;
        next();
    } catch (err) {
        console.log(err);
        return res.status(401).json({
            message: "Auth Failed"
        });
    }
    

}