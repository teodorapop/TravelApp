require('dotenv').config();
const cloudinary = require('cloudinary').v2;
// const config = require("./config.json");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const upload = require("./multer");
const fs = require("fs");
const path = require("path");

const {authenticateToken} = require("./utilities");

const User = require("./models/user.model");
const TravelPost = require("./models/travelPost.model");
const {parse} = require("dotenv");

mongoose.connect(process.env.CONNECTDB);
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
app.use(express.json());
// app.use(cors({origin: "*"}));

app.use(cors({
    origin: "https://travel-app-frontend-grrx.onrender.com",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

// Create account
app.post("/create-account", async (req, res) => {
    console.log("Received data:", req.body);

    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({ error: true, message: "All fields are required" });
    }

    const isUser = await User.findOne({email});
    if(isUser){
        return res.status(400).json({error: true, message: "User already exists"});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
        fullName,
        email,
        password: hashedPassword,
    });

    await user.save();

    const accessToken = jwt.sign(
        {userId: user._id},
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: "72h",}
    );

    return res.status(201).json({
        error: false,
        user: {fullName: user.fullName, email: user.email},
        accessToken,
        message: "Account created successfully",
    });
});

//Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if(!email || !password){
        return res.status(400).json({error: true, message: "Email and password are required"});
    }

    const user = await User.findOne({email});
    if(!user){
        return res.status(400).json({error: true, message: "User does not exist"});
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid){
        return res.status(400).json({error: true, message: "Incorrect password"});
    }

    const accessToken = jwt.sign(
        {userId: user._id},
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: "72h",}
    );

    return res.json({
        error: false,
        message: "User login successfully",
        user: {fullName: user.fullName, email: user.email},
        accessToken,
    });
});

// Get User
app.get("/get-user", authenticateToken, async (req, res) => {
    const {userId} = req.user;

    const isUser = await User.findOne({_id: userId});

    if(!isUser){
        return res.sendStatus(401);
    }

    return res.json({
        user: isUser,
        message:"",
    });
});

// Add travel post
app.post("/add-travel-post", authenticateToken, async (req, res) => {
    const {title, description, visitedLocation, imageUrl, visitedDate} = req.body;
    const { userId } = req.user;

    // validate required fields
    if (!title || !description || !visitedLocation || !imageUrl || !visitedDate){
        return res.status(400).json({error: true, message: "All fields are required"});
    }

    // Convert visitedDate from milliseconds to Date object
    const parsedVisitedDate = new Date(parseInt(visitedDate));

    try{
        const travelPost = new TravelPost({
            title,description,visitedLocation, userId, imageUrl, visitedDate: parsedVisitedDate,
        });
        await travelPost.save();
        res.status(201).json({posts: travelPost, message: "Added successfully"});
    } catch(error){
        res.status(400).json({error: true, message: "Something went wrong"});
    }
});

// Get all travel posts
app.get("/get-all-posts", authenticateToken, async (req, res) => {
    const {userId} = req.user;

    try{
        const travelPosts = await TravelPost.find({userId: userId}).sort({
            isFavourite: -1,
        });
        res.status(200).json({
            posts: travelPosts
        });
    } catch (error) {
        res.status(400).json({error: true, message: "Something went wrong"});
    }
})

// Route to handle image upload
// app.post("/image-upload", upload.single("image"), async (req,res) =>{
//     try{
//         if(!req.file){
//             return res.status(400).json({error: true, message: "File is required"});
//         }
//
//         const imageUrl = `https://travel-app-backend-7eko.onrender.com/uploads/${req.file.filename}`;
//
//         res.status(201).json({imageUrl});
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({error: true, message: "Something went wrong"});
//     }
// });

// Route to handle image upload
app.post("/image-upload", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: true, message: "File is required" });
        }

        // Upload image to Cloudinary
        const cloudinaryResult = await cloudinary.uploader.upload(req.file.path);

        // Get the Cloudinary URL for the image
        const imageUrl = cloudinaryResult.secure_url;

        res.status(201).json({ imageUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: "Something went wrong" });
    }
});


// Serve static files from the uploads and assets directory
//app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Delete an image from uploads folder
// app.delete("/delete-image", async (req,res) =>{
//     const {imageUrl} = req.query;
//
//     if(!imageUrl){
//         return res.status(400).json({error: true, message: "Image is required"});
//     }
//
//     try{
//         // Extract the filename from the imageUrl
//         const filename = path.basename(imageUrl);
//
//         // Define the file path
//         const filePath = path.join(__dirname, "uploads", filename);
//
//         // Check if the file exists
//         if(fs.existsSync(filePath)){
//             // Delete the file from the uploads folder
//             fs.unlinkSync(filePath);
//             res.status(200).json({message:"Image deleted successfully"});
//         } else {
//             res.status(200).json({error: true, message: "Image not found"});
//         }
//     } catch (error) {
//         res.status(500).json({error: true, message: error.message});
//     }
// })

// Delete an image from Cloudinary
// Delete an image from Cloudinary
app.delete("/delete-image", async (req, res) => {
    const { imageUrl } = req.query;

    if (!imageUrl) {
        return res.status(400).json({ error: true, message: "Image URL is required" });
    }

    try {
        // Extract public_id from the image URL
        const publicId = imageUrl.split("/").pop().split(".")[0];

        // Delete the image from Cloudinary
        await cloudinary.uploader.destroy(publicId);

        res.status(200).json({ message: "Image deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: "Failed to delete image" });
    }
});


// Edit travel post
app.put("/edit-post/:id", authenticateToken, async (req,res) =>{
    const {id} = req.params;
    const {title, description, visitedLocation, imageUrl, visitedDate} = req.body;
    const {userId} = req.user;

    // Validate required fields
    if (!title || !description || !visitedLocation || !visitedDate || !imageUrl){
        return res.status(400).json({error: true, message: "All fields are required"});
    }

    // Convert visitedDate from milliseconds to Date object
    const parsedVisitedDate = new Date(parseInt(visitedDate));

    try{
        // Find the travel post by ID and ensure it belongs to the authenticated user
        const travelPost = await TravelPost.findOne({_id: id, userId: userId});

        if(!travelPost){
            return res.status(404).json({error: true, message: "Travel post not found"});
        }

        const placeholderImgUrl = `https://travel-app-backend-7eko.onrender.com/assets/placeholder.png`;

        travelPost.title = title;
        travelPost.description = description;
        travelPost.visitedLocation = visitedLocation;
        travelPost.imageUrl = imageUrl || placeholderImgUrl;
        travelPost.visitedDate = parsedVisitedDate;

        await travelPost.save();
        res.status(200).json({post: travelPost, message:"Successfully updated"});
    } catch(error){
        res.status(500).json({error: true, message: "Something went wrong"});
    }
})

// Delete a travel post
// app.delete("/delete-post/:id", authenticateToken, async (req,res) =>{
//     const {id} = req.params;
//     const {userId} = req.user;
//
//     try{
//         // Find the travel post by ID and ensure it belongs to the authenticated user
//         const travelPost = await TravelPost.findOne({_id: id, userId: userId});
//
//         if(!travelPost){
//             return res.status(404).json({error: true, message: "Travel post not found"});
//         }
//
//         // Delete the travel post from the database
//         await travelPost.deleteOne({_id:id, userId: userId});
//
//         // Extract the filename from the imageUrl
//         const imageUrl = travelPost.imageUrl;
//         const filename = path.basename(imageUrl);
//
//         // Define the file path
//         const filePath = path.join(__dirname, "uploads", filename);
//
//         // Delete the image file from the uploads folder
//         fs.unlink(filePath, (err) =>{
//             if(err){
//                 console.error("Failed to delete the image file: ", err);
//             }
//         });
//
//         res.status(200).json({message:"Successfully deleted"});
//     } catch(error){
//         res.status(500).json({error: true, message: "Something went wrong"});
//     }
//
// })

// Delete a travel post
app.delete("/delete-post/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;

    try {
        // Find the travel post by ID and ensure it belongs to the authenticated user
        const travelPost = await TravelPost.findOne({ _id: id, userId: userId });

        if (!travelPost) {
            return res.status(404).json({ error: true, message: "Travel post not found" });
        }

        // Extract the image URL
        const imageUrl = travelPost.imageUrl;

        // Delete the image from Cloudinary if it's not the placeholder image
        if (imageUrl && !imageUrl.includes("placeholder.png")) {
            const publicId = imageUrl.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(`uploads/${publicId}`);
        }

        // Delete the travel post from the database
        await travelPost.deleteOne({ _id: id, userId: userId });

        res.status(200).json({ message: "Successfully deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: "Something went wrong" });
    }
});

// Update isFavourite
app.put("/update-is-favourite/:id", authenticateToken, async (req, res) =>{
    const {id} = req.params;
    const {isFavourite} = req.body;
    const {userId} = req.user;

    try{
        const travelPost = await TravelPost.findOne({_id: id, userId: userId});

        if(!travelPost){
            return res.status(404).json({error: true, message: "Travel post not found"});
        }

        travelPost.isFavourite = isFavourite;

        await travelPost.save();
        res.status(200).json({post: travelPost, message:"Successfully updated"});
    } catch(error){
        res.status(500).json({error: true, message: "Something went wrong"});
    }
})

app.get("/search", authenticateToken, async (req,res) =>{
    const {query} = req.query;
    const {userId} = req.user;

    if(!query){
        return res.status(404).json({error: true, message: "query is required"});
    }

    try{
        const searchResults = await TravelPost.find({
            userId: userId,
            $or: [
                {title: { $regex:query, $options: "i" } },
                {description: { $regex:query, $options: "i" } },
                {visitedLocation: { $regex:query, $options: "i" } },
            ],
        }).sort({ isFavourite: -1 });

        res.status(200).json({stories: searchResults});
    } catch(error){
        res.status(500).json({error: true, message: "Something went wrong"});
    }
})

// Filter travel posts by date
app.get("/travel-posts/filter", authenticateToken, async (req,res) =>{
    const { startDate, endDate } = req.query;
    const { userId } = req.user;

    try{
        // Convert startDate and endDate from milliseconds to Date objects
        const start = new Date(parseInt(startDate));
        const end = new Date(parseInt(endDate));

        // Find travel posts that belong to the authenticated user and filter within the date range
        const filteredPosts = await TravelPost.find({
            userId: userId,
            visitedDate: { $gte: start, $lte: end },
        }).sort({ isFavourite: -1 });

        res.status(200).json(filteredPosts);

    } catch(error){
        res.status(500).json({error: true, message: "Something went wrong"});
    }
})

app.listen(process.env.PORT || 8000);
module.exports = app;
