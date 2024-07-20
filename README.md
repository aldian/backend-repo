# backend-repo

An ExpressJS example app that provides endpoints to read values from a Firestore database and write values to a Firestore database.
This backend app will be paired with a frontend, exemplified [here](https://github.com/aldian/frontend-repo).

## Local manual test

### 1. Set up environment variables

To run the backend, you need to specify some environment variables. To do that easily on your local machine, add a `.env` file with content similar to the following:
```
FIREBASE_PROJECT_ID=your-project-id
FIRESTORE_EMULATOR_HOST=localhost:8080
SECRET_TOKEN=your-secret-token
```
The value in `SECRET_TOKEN` is an internal service to service token, so you just need to make sure communicating services to use the same value. 

### 2. Run Firebase emulator

Please follow the official guide to install Firebase emulator on your machine.
Run the following command to start the emulator:
```
firebase emulators:start --project=your-project-id
```

### 3. Run the app locally
Install the `node` packages:
```
npm install
```
Run the following command to start the app server:
```
npm run dev
```

### 4. Access/Test the endpoints

You can use command line tools such as `curl` to test the API.

#### Getting all users
```
curl -i "$YOUR_EXPRESSJS_BASE_URL/fetch-user-data" -H "Authorization: Bearer $SECRET_TOKEN"
```
It will return a list if users like this:
```
[{"id":"1b6f431e-b26a-459f-8677-3a82cdd670be","name":"Aldian Fazrihady"},{"id":"41c36348-4f09-45ee-9b99-8feee475688e","name":"Elvia Riyani"}]
```
#### Getting a specific user
You need to pass the `id` of the user. Using the example above, you can call it like this:
```
curl -i "$YOUR_EXPRESSJS_BASE_URL/fetch-user-data?id=1b6f431e-b26a-459f-8677-3a82cdd670be" -H "Authorization: Bearer $SECRET_TOKEN"
```
If will return a json similar to this:
```
{"id":"1b6f431e-b26a-459f-8677-3a82cdd670be","name":"Aldian Fazrihady"}
```
#### Updating a user
You need to pass the `id` of the user. Using the example above, you can call it like this:
```
curl -i "$YOUR_EXPRESSJS_BASE_URL/update-user-data" -X POST -H "Authorization: Bearer $SECRET_TOKEN" -H "Content-Type: application/json" -d '{"id": "1b6f431e-b26a-459f-8677-3a82cdd670be", "name": "Bisma Julian"}'
```
It will return a json similar to this:
```
{"message":"User updated!","id":"1b6f431e-b26a-459f-8677-3a82cdd670be"}
```
#### Adding a new user
```
curl -i "$YOUR_EXPRESSJS_BASE_URL/update-user-data" -X POST -H "Authorization: Bearer $SECRET_TOKEN" -H "Content-Type: application/json" -d '{"name": "Zidan Okta"}'
```
It will return a json containing a new `id` like this:
```
{"message":"User created!","id":"7a3d745e-6621-4a2b-9e4e-08e2bb82a274"}
```  

## Deployment to staging