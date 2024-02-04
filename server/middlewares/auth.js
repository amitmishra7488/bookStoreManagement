require("dotenv").config();
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");
const generateToken = (user) => {
  const payload = {
    userId: user._id,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
};

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res
        .status(401)
        .json({ error: "Unauthorized", reason: "Token not provided" });
    }

    const verify = await jwt.verify(token, process.env.JWT_SECRET);
    if (!verify) {
      return res.status(401).json({ error: "Unauthorized", reason: "Invalid token" });
    }

    req.userId = verify.id;
    next();
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", reason: error.message });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized"});
    }
    const user = await UserModel.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

const isAuthor = async (req,res,next) =>{
  try {
    
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized"});
    }
    const user = await UserModel.findById(userId);
    if (!user || user.role !== 'author') {
      return res.status(403).json({ error: 'Forbidden Access Denied' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}



module.exports = {
  generateToken,
  auth,
  isAdmin,
  isAuthor,
};
