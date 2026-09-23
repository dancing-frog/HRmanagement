const mongoose = require("mongoose");
const dns = require("dns");
require("dotenv").config();

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const { MONGODB_URL } = process.env;

exports.connectDB = () => {
    mongoose
        .connect(MONGODB_URL)
        .then(() => console.log("DB Connection Success"))
        .catch((err) => {
            console.log("DB Connection Failed");
            console.log(err);
            process.exit(1);
        });
};