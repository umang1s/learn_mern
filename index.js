const express = require("express");
const app=express();
const path=require("path")
const {logger}= require('./middleware/logger')
const {errorHandler} = require("./middleware/errorHandler")
const coockieParser= require("cookie-parser")
const cors=require('cors')
const corsOptions=require("./config/corsOptions")
const PORT= process.env.PORT || 8090;

app.use(logger);
app.use(coockieParser())
app.use(express.json())
app.use(cors(corsOptions)) //use for giving access to public api

app.use('/',express.static(path.join(__dirname,'./public')));
app.use('/',require("./routes/root"))

app.all("*",(req,res)=>{
    res.status(404);
    if(req.accepts('html')){
        res.sendfile(path.join(__dirname,'views','404.html'))
    }else if(req.accepts('json')){
        res.json({message:'404 not found'})
    }else{
        res.type('txt').send('404 not found')
    }
})
app.use(errorHandler);

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})