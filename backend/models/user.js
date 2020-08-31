const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Week = require('./week');

const TargetSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Title is required']
    },
    notes: String,
    weeklyTargetTime: {
        type: Number,
        validate: {validator: isPositiveInt, msg: 'weeklyTargetTime must be a positive integer'},
        required: [true, 'Weekly Target Time is required']
    },
    weeks: [{
        type: Schema.Types.ObjectId,    // Not embedded, rather an array of ObjectID
        ref: 'week' 
    }]
})

const UserSchema = new Schema({
    username: {
        type: String,
        required: [true, 'Username field is required']
    },
    password: {
        type: String,
        required: [true, 'Password field is required']
    },
    targets: [TargetSchema]
});


// Create Model from the schema
const User = mongoose.model('user', UserSchema);

module.exports = User;


function isPositiveInt(n){
    return n > 0 && Number.isInteger(n);
}