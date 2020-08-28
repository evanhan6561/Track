const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DaySchema = new Schema({
    workTime: {
        type: Number,
        validate: {validator: isPositiveInt, msg: 'workTime must be a positive integer'},
        required: [true, 'Work Time is required to create a Day.']
    },
    date: {
        type: Date,
        required: [true, 'Date is required to create a Day.']
    }
})

let weekValidators = [
    {validator: isNotEmpty, msg: "At least one Day is required to create a Week."},
    {validator: validDays, msg: "A Week should have no more than 7 days."}
]

const WeekSchema = new Schema({
    weeklyTargetTime: {
        type: Number,           // in seconds
        required: [true, 'Weekly Target Time is required to create a Week.']
    },
    days: {
        type: [DaySchema],
        validate: weekValidators
    }
});

function isPositiveInt(n){
    return n > 0 && Number.isInteger(n);
}

function isNotEmpty(arr){
    return arr.length > 0;
}

function validDays(arr){
    return arr.length >= 0 && arr.length <= 7;
}

// Create Model from the schema
const Week = mongoose.model('week', WeekSchema);

module.exports = Week;

