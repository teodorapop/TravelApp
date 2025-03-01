const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const travelPostSchema = new Schema({
    title:{type:String,required: true},
    description:{type:String,required: true},
    visitedLocation:{type:[String], default:[]},
    isFavourite:{type:Boolean, default: false},
    userId:{type:Schema.Types.ObjectId, ref:'User', required:true},
    createdOn:{type:Date, default:Date.now},
    imageUrl:{type:String, required:true},
    visitedDate:{type:Date, required:true},
    isPublic:{type:Boolean, default: false},
});

module.exports = mongoose.model("TravelPost", travelPostSchema);

