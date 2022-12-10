const {logEvents} = require("./logger");

const errorHandler=(err,req,res,next)=>{
    logEvents(`${err.name}\t${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,'errLog.log');
    console.log(err.stack);
    
    const status=res.statusCode? res.statusCode:500; //server error 500
    res.status=status;
    res.json({message:err.message});
}

module.exports={errorHandler};