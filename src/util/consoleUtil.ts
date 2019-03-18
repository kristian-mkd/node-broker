var figlet = require("figlet");

const printAppInfo = (appName: string, port: number) => {
  figlet(appName, function(err: Object, data: Object) {
    if (err) {
      console.log("Something went wrong...");
      console.dir(err);
      return;
    }
    console.log(data);
    console.log(`app running on port: ${port}.`);
  });
};

module.exports = {
  printAppInfo
};
