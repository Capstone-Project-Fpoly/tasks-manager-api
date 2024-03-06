const adminRouter = require("./admin");

function route(app) {
  app.use("/admin", adminRouter);
}
module.exports = route;
