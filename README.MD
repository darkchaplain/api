# Users API
## Dependencies
* Docker
* NodeJS
* Global **serverless** package (`npm i serverless -g`)
* **Localstack** docker image `docker pull localstack/localstack`
## Running
* Start local DynamoDB with `docker run --name 'dynamodb_localstack' -d -p 8000:8000 -e SERVICES=dynamodb:8000 -e DATA_DIR='/tmp/localstack/data' localstack/localstack`
* Run `npm i` to install dependencies
* Run `npm run seed` to create `Users` table and populate it with initial data
* Run `npm start`
## Usage
* Table is populated with initial admin user. To create any initial request (but add user request) you need to add **authToken** key with value `cm9vdCwxMjM=` to request header
* **authToken** has the next principle of generation: `btoa(username,password)`
* API accepts `application/x-www-form-urlencoded` content type
* API accepts following body fields: `password`, `login`, `address`, `role`, `name` 
* Fields `login` and `password` are required for adding user
* `login` is unique field
* Field `role` cannot be changed by non-admin user
* Passwords in DB are stored as md5 check sums of user passwords
## Routes
* list users: `GET /users` (admin access)
* get user: `GET /user/{login}` (admin access, user access)
* add user: `POST /user` (open access)
* update user: `PUT /user/{login}` (admin access, user access)
* delete user: `DELETE /user/{login}` (admin access, user access)

`admin access`, `user access` - authToken is required
`open access` - authToken is not required
## Testing
`npm run test`
