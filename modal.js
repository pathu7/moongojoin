const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: Number, required: false },
  alt_number: { type: Number, required: false },
  email: { type: String, required: false },
  address: { type: String, required: false },
  home_address: { type: String, required: false },
  state: { type: mongoose.Types.ObjectId, required: true },
  city: { type: mongoose.Types.ObjectId, required: true },
  dis: { type: mongoose.Types.ObjectId, required: true },
  takula: { type: mongoose.Types.ObjectId, required: true },
});

module.exports = mongoose.model("User", userSchema);
