const { model, Schema } = require('mongoose');

const companySchema = new Schema({
    title: String,
    link: String,
    emails: Array
});

module.exports = model('Company', companySchema);
