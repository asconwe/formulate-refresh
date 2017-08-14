const mongoose = require('mongoose');

const pointedResponseSchema = new mongoose.Schema({
    email: String,
    response: Object,
    submitted: Boolean
});

module.exports = pointedResponseSchema;