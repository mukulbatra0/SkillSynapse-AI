import jwt from 'jsonwebtoken';
import blacklistTokenModel from '../models/blacklistToken.models.js';

const authUser = async (req, res, next) => {
  const token = req.cookies.token;

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