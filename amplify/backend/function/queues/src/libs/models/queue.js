const { Sequelize } = require('sequelize');
const { DataTypes } = require('sequelize');
const aws = require('aws-sdk');


let sequelize = null;

async function getDBConnection() {
  if (sequelize != null) {
    return sequelize;
  }

  const { Parameters } = await (new aws.SSM())
    .getParameters({
      Names: ["DB_PASSWORD"].map(secretName => process.env[secretName]),
      WithDecryption: true,
    })
    .promise();
  const password = Parameters.pop().Value;

  sequelize = new Sequelize(`postgresql://${process.env.DB_USERNAME}:${password}@${process.env.DB_HOST}/${process.env.DB_NAME}`);

  // await db.authenticate();
  // console.log('connection has been established successfully.');

  return sequelize;
}

async function getQueueModel() {
  const db = await getDBConnection();
  const queueModel = db.define('Queue', {

    // Model attributes are defined here
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      field: 'Key'
    },
    name: {
      type: DataTypes.STRING,
      // allowNull defaults to true
      field: 'Name'
    }
  }, {
    // Other model options go here
    tableName: 'queues',
    timestamps: false,
  });

  return queueModel;
}

module.exports = getQueueModel