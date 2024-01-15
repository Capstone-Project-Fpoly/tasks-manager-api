const mongoose = require('mongoose');

const checkListSchema = new mongoose.Schema({
    card: { type: String , required: true },
    content: { type: String, required: true },
    isChecked: { type: Boolean, required: true }
});

const CheckListModel = mongoose.model('checkLists', checkListSchema);

module.exports = CheckListModel;
