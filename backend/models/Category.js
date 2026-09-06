const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  keywords: [{ type: String }]
});

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  subcategories: [subcategorySchema]
});

module.exports = mongoose.model('Category', categorySchema);
