const User=require('../models/User')
const Note=require('../models/Note')
const asyncHandler=require('express-async-handler')
const bcrypt=require('bcrypt')

// @desc Get all users
// @route GET /users 
// @access private
const getAllUsers= asyncHandler(
    async (req,res)=>{
        const users= await User.find().select('-password').lean()
        if(!users){
            return res.status(400).json({message: 'No users found'})
        }
        res.json(users)
    }
)

// @desc Create new users
// @route POST /users 
// @access private
const createNewUser= asyncHandler(
    async (req,res)=>{
        const {username,password,roles}=req.body

        //confirm data
        if(!username || !password || !Array.isArray(roles) || !roles.length){
            return res.status(400).json({message: 'All fields are required'})
        }

        //check for duplicates
        const duplicates= await User.findOne({username}).lean().exec()
        if(duplicates){
            return res.status(409).json({message: 'Duplicate username'})
        }

        //hash password
        const hashedPwd= await bcrypt.hash(password,10)// salt rounds
        const userObject= {username,"password": hashedPwd,roles}

        //create and store new user 
        const user= await User.create(userObject)

        if(user){
            res.status(201).json({message: `New user ${username} created`})
        }else{
            res.status(400).json({message: 'Invalid user data'})
        }
    }
)
// @desc Update a users
// @route PATCH /users 
// @access private
const updateUser= asyncHandler(
    async (req,res)=>{
        const {id,username,roles,active,password}= req.body

        //confirm data
        if(!id || !username || !Array.isArray(roles) ||! roles.length || typeof(active)!='boolean'){
            return res.status(400).json({message: "All fields are required"})
        }
        const user = await User.findById(id).exec()

        if(!user){
            return res.status(400).json({message: "User not found"})
        }

        //check for duplicates
        const duplicates=await User.findOne({username}).lean().exec()

        //allow updates to the original User
        if(duplicates && duplicates?._id.toString()!=id){
            return res.status(409).json({message: "Duplicate username"})
        }

        user.username=username 
        user.roles=roles 
        user.active=active 

        if(password){
            user.password=bcrypt.hash(password,10)
        }

        const updatedUser= await user.save()

        res.json({message: `Updated ${user.username}`})
    }
)
// @desc Delete a users
// @route DELETE /users 
// @access private
const deleteUser= asyncHandler(
    async (req,res)=>{
        const {id} =req.body 
        if(!id){
            return res.status(400).json({message: 'User id required'})
        }

        const note= await Note.findOne({user: id}).lean().exec()
        if(note){
            return res.status(400).json({message:'User has assigned notes'})
        }

        const user=await User.findById(id).exec()

        if(!user){
            return res.status(400).json({message: 'User not found'})
        }

        const result=await user.deleteOne()

        res.json({message: `Username ${result.username}  with ID ${result._id} deleted`})
    }
)


module.exports={
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}

