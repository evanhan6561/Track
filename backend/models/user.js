const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TargetSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Title is required']
    },
    notes: String,
    weeklyTargetTime: Number,
    weeks: {
        type: [Schema.Types.ObjectId],    // Not embedded, rather an array of ObjectID
        ref: 'Week'
    }
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
