const mongoose = require('mongoose');
const Joi = require('joi');
const _ = require('lodash');

const statusList = ['Not Started' , 'In Progress' , 'Complete'];
const priorityList = ['Low' , 'Medium' , 'High' , 'Urgent'];

const taskSchema = new mongoose.Schema({
    title : {
        type: String,
        minlength: 3,
        maxlength: 50,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: statusList,
        required: true
    },
    priority: {
        type: String,
        enum: priorityList,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createDate: {
        type: Date,
        default: Date.now()
    }
});

const Task = mongoose.model( 'Task' , taskSchema );

function taskValidation(task) {
    const schema = Joi.object({
        title: Joi.string().min(3).max(50).required(),
        content: Joi.string().required(),
        status: Joi.string().valid(...statusList).required(),
        priority: Joi.string().valid(...priorityList).required(),
    });

    return schema.validate(task);
}

exports.Task = Task;
exports.taskValidation = taskValidation;

