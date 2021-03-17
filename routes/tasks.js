const express = require('express');
const router = express.Router();

const _ = require('lodash');

const auth = require('../middleware/auth');

const {Task , taskValidation} = require('../models/task');
const {User} = require('../models/user');

router.get('/' , async (req, res) => {
    const tasks = await Task.find();
    if(!tasks || tasks.length === 0) return res.status(404).send('No tasks in the database!');
    
    res.send(tasks);
});

router.get('/:id' , async (req, res) => {
    const task = await Task.findById(req.params.id);
    if(!task) return res.status(404).send('Task was not found!');
    
    res.send(task);
});

router.post('/' , auth, async (req, res) => {
    const {error} = taskValidation(req.body);
    if (error) return res.status(400).send('Bad request: ' + error.details[0].message);

    const task = new Task(_.pick(req.body , ['title' , 'content' , 'status' , 'priority']));
    task.userId = req.user._id;
    
    await task.save();

    res.send(task);
});

router.put('/:id' , auth, async (req, res) => {
    const {error} = taskValidation(req.body);
    if (error) return res.status(400).send('Bad request: ' + error.details[0].message);

    const task = await Task.findByIdAndUpdate(req.params.id, 
        _.pick(req.body , ['title' , 'content' , 'status' , 'priority']), 
        {new: true});
    if(!task) return res.status(404).send('The Task you want to update was not found!');

    res.send('Update Successful: \n' + task);
});

router.delete('/:id' , auth, async (req , res) => {
    const task = await Task.findByIdAndRemove(req.params.id);
    if(!task) return res.status(404).send('The Task you want to delete was not found!');

    res.send('Delete Successful: \n' + task);
});

module.exports = router;