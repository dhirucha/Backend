import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { upload } from "../middlewares/multer.middleware.js";
import { ApiResponse } from "../utils/apiResponse.js";


const registerUser = asyncHandler(async (req,res) => {
    //get user details from frontend
    //validation --not empty
    //check if user already exists username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response


    const {fullname, email, username, password} = req.body

    console.log("email :",email);

    if(
        [fullname,email,password,username].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

   const existedUser = User.findOne({
        $or: [{ username },{ email }]
    })

    if(existedUser){
        throw new ApiError(409,"User with email or username already exists")
    }

   const avatarLocalPath = req.files?.avatar[0].path;
   const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath)
    {
        throw new ApiError(400, "avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar)
        {
            throw new ApiError(400, "avatar file is required")
        }


      const user =  User.create({
            fullname,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        })
    
       const userCreated = await User.findById(user._id).select(
            "-password -refreshToken"
       )

       if(!userCreated){
        throw new ApiError(500, "something went wrong while registering a user")
       }


       return res.status(201).json(
        new ApiResponse(200, createdUser,"User registered successfully")
       )

})



export {registerUser}