const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  "de6j95f54v1pv2",
  "tyyyxkebhtlrnt",
  "79e9c07f10272273418842c14953e0f8c70630ecb654f107a7353becf6b2a191",
  {
    host: "ec2-54-247-85-251.eu-west-1.compute.amazonaws.com",
    port: 5432,
    dialect: "postgres",
    dialectOptions: {
      ssl: true
    }
  }
);

export const Message = sequelize.define(
  "message",
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    content: {
      type: Sequelize.STRING
    }
  },
  {
    timestamps: false
  }
);

export const deleteMessages = () => {
  Message.destroy({
    where: {},
    truncate: false
  }).then(() => console.log("All messages are deleted."));
};

export const checkDbConnection = () => {
  sequelize
    .authenticate()
    .then(() => {
      console.log("Connection to db has been established successfully.");
    })
    .catch((err: any) => {
      console.error("Unable to connect to the database:", err);
    });
};
