const jwt = require("jsonwebtoken");
const User = require("./user")
const secret = "chaithanyasecret";
const Login = async (req, res) => {
    try {
        let user = await User.findOne({ phone: req.body.username });
        if (user) {
            if (user.password !== req.body.password) {
                throw new Error("Incorrect Password")
            } else {
                const token = jwt.sign({ userId: user._id }, secret);
                return res.json({ token: token });
            }
        } else {
            throw new Error("User Does not exist ")
        }

    } catch (err) {
        return res.status(400).json({ errMsg: err.message })
    }
}

const TokenMiddleware = async (req, res, next) => {
    try {
        let decoded = jwt.verify(req.headers["x-access-token"], secret);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.status(401).json({ errMsg: err.message })
    }
}

const GetProfile = async (req, res) => {
    try {
        let user = await User.findById(req.userId);
        return res.json(user);
    } catch (err) {
        return res.status(401).json({ errMsg: err.message })
    }
}
module.exports = {
    Login,
    TokenMiddleware,
    GetProfile
}