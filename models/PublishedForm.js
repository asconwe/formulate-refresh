const mongoose = require('mongoose');

const pointedResponseSchema = require('./pointedResponseSchema')

const publishedFormSchema = new mongoose.Schema({
    formTitle: String,
    elements: Array,
    refId: String,
    responses: Array,
    pointedResponses: [pointedResponseSchema]
});

const PublishedForm = mongoose.model('PublishedForm', publishedFormSchema);

module.exports = PublishedForm;