const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },


  permissions: [{
    type: String,
    enum: [
      'add_student', 'edit_student', 'delete_student',
      'manage_fees', 'update_results', 'edit_class_info',
      // Add more permissions as needed
    ],
    required: [true, 'At least one permission is required'],
  }],
  // Additional fields for admin and teachers can be added here if necessary
});
userSchema.path('permissions').validate(function (value) {
  return value.length > 0;
}, 'At least one permission is required.');


const User = mongoose.model('User', userSchema);

module.exports = User;