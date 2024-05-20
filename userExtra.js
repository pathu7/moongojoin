const mongoose = require("mongoose");

const deptSchema = mongoose.Schema({
  name: { type: String, require: true },
});
const dept = mongoose.model("dept", deptSchema);

const stateSchema = mongoose.Schema({
  name: { type: String, required: true },
});
const state = mongoose.model("state", stateSchema);

const disSchema = mongoose.Schema({
  name: { type: String, require: true },
  state_id: { type: mongoose.Types.ObjectId, require: true },
});
const dis = mongoose.model("dis", disSchema);

const takulaSchema = mongoose.Schema({
  name: { type: String, require: true },
  dis_id: { type: mongoose.Types.ObjectId, require: true },
});
const takula = mongoose.model("takula", takulaSchema);

const citySchema = mongoose.Schema({
  name: { type: String, require: true },
});
const city = mongoose.model("city", citySchema);

const adminUserSchema = mongoose.Schema({
  name: { type: String, require: true },
  mobile: { type: Number, require: true },
});
const adminUser = mongoose.model("adminuser", adminUserSchema);

const deptMasterSchema = mongoose.Schema({
  user_id: { type: mongoose.Types.ObjectId, require: true },
  dept_id: { type: mongoose.Types.ObjectId, require: true },
  subdept: { type: String, require: false },
  post: { type: String, require: false },
});
const deptMaster = mongoose.model("deptmaster", deptMasterSchema);

module.exports = { state, dept, dis, takula, city, adminUser, deptMaster };
