const mongoose = require('mongoose');

const elementSchema = new mongoose.Schema({
    type: String,
    Options: Object,
})

elementSchema.add({ children: [elementSchema] });

const formSchema = new mongoose.Schema({
    title: String,
    topLevelElements: [elementSchema],
    published: Boolean
});

module.exports = formSchema;