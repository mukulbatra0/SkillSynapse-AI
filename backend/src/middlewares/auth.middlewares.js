import jwt from 'jsonwebtoken';
import blacklistTokenModel from '../models/blacklistToken.models.js';

const authUser = async (req, res, next) => {
  // Check for token in Authorization header first, then fall back to cookie
  let token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    token = req.cookies.token;
  }

  if(!token){
    return res.status(401).json({
      message: "Unauthorized"
    })
  }
  const blacklistedToken = await blacklistTokenModel.findOne({token})

  if(blacklistedToken){
    return res.status(401).json({
      message: "Unauthorized"
    })
  }

  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  }catch (err){
    return res.status(401).json({
      message: "Invalid token"
    })
  }
}


export default {
  authUser
}