const mongoose = require('mongoose');

const elementSchema = new mongoose.Schema({
    type: String,
    Options: Object,
    children: [elementSchema]
})

const formSchema = new mongoose.Schema({
    formTitle: String,
    topLevelElements: [elementSchema],
    published: Boolean
});

module.exports = formSchema;