const mongoose=require('mongoose');

const blacklistedTokenSchema=new mongoose.Schema({
    token:{type:String, required:true}
})
const BlacklistedToken=mongoose.model('BlacklistedToken', blacklistedTokenSchema);
module.exports=BlacklistedToken;