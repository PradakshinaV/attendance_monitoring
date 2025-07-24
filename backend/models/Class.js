const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  className: String,
  teacher: String,
  students: [String]  // student emails or IDs
});

module.exports = mongoose.model('Class', classSchema);
