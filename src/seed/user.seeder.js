require('dotenv/config');
const { logError } = require('../utils/log.util');

class UserSeeder {
  constructor(dynamodb, documentClient) {
    this.documentClient = documentClient;
    this.dynamodb = dynamodb;
    this.tablename = process.env.TABLE_NAME;
  }

  async hasTable() {
    try {
      const tables = await this.dynamodb
        .listTables()
        .promise();

      return tables.TableNames[0] === this.tablename;
    } catch (error) {
      logError(error);
    }
  }

  async createTable() {
    try {
      const tableParams = {
        TableName: this.tablename,
        KeySchema: [
          {
            AttributeName: 'Login',
            KeyType: 'HASH'
          }
        ],
        AttributeDefinitions: [
          {
            AttributeName: 'Login',
            AttributeType: 'S'
          }
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        },
        StreamSpecification: {
          StreamEnabled: false
        }
      };

      const result = await this.dynamodb
        .createTable(tableParams)
        .promise();

      return Boolean(result.$response.error);
    } catch (error) {
      logError(error);
    }
  }

  async deleteTable() {
    try {
      const result = await this.dynamodb
        .deleteTable({ TableName: this.tablename })
        .promise();

      return Boolean(result.$response.err)
    } catch (error) {
      logError(error);
    }
  }

  async seed(users = []) {
    try {
      const putRequests = users.map(user => ({
        PutRequest: {
          Item: Object.assign({}, user)
        }
      }));
      const params = {
        RequestItems: {
          [process.env.TABLE_NAME]: putRequests
        }
      };

      await this.documentClient
        .batchWrite(params)
        .promise();
    } catch (error) {
      logError(error);
    }
  }
}

exports.UserSeeder = UserSeeder;
