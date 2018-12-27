require('dotenv/config');
const { DynamoDB } = require('aws-sdk');
const { DynamoDB: { DocumentClient } } = require('aws-sdk');
const { logError } = require('../utils/log.util');
const { UserSeeder } = require('./user.seeder');
const users = require('./data.json');

const dynamo = new DynamoDB({
  endpoint: process.env.AWS_ENDPOINT,
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
const documentClient = new DocumentClient({ service: dynamo });
const userSeeder = new UserSeeder(dynamo, documentClient);

const seedUsers = async () => {
  let isTableExists;

  console.log(`Checking if '${process.env.TABLE_NAME}' table exists`);
  isTableExists = await userSeeder.hasTable();

  if (isTableExists) {
    console.log(`Table '${process.env.TABLE_NAME}' exists, deleting`);
    await userSeeder.deleteTable();
  }

  console.log(`Creating '${process.env.TABLE_NAME}' table`);
  await userSeeder.createTable();

  console.log('Seeding data');
  await userSeeder.seed(users);
};

seedUsers()
  .then(() => console.log('Done!'))
  .catch(error => logError(error));
