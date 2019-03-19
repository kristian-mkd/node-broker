var figlet = require("figlet");

export const printAppInfo = (appName: string, port: number) => {
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
