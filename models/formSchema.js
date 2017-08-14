const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
    formTitle: String,
    elements: Array,
    published: Boolean
});

module.exports = formSchema;