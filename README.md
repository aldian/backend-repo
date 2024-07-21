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

## Cloud deployment

### Infrastructure provisioning

Terraform code is used to provision the GCP infrastructure.
Let's say your GCP project is `my-gcp-project`. You will create a VM for staging named `backend-reop-vm-staging`, and a VM for production named `backend-repo-vm-production`. Then you need to create a GCS bucket named `my-gcp-project-terraform`, create a service account that allows the creation of VMs, and run the following commands:
1. `GCP_PROJECT_ID=my-gcp-project make terraform-bootstrap`.
2. `ENV=staging make terraform-create-workspace`. It creates the staging environment.
3. `ENV=production make terraform-create-workspace`. It creates the production environment.
4. `ENV=production make terraform-create-workspace`. It creates the production environment.
5. `GCP_PROJECT_ID=my-gcp-project ENV=staging make terraform-init`. It initializes the staging environment.
6. `GCP_PROJECT_ID=my-gcp-project ENV=production make terraform-init`. It initializes the production environment.
7. `ENV=staging GCP_PROJECT_ID=my-gcp-project GCP_CREDENTIALS=../terraform-sa-key.json GCP_ZONE=us-central1-a SSH_STRING="john@backend-repo-vm-staging" VM_INSTANCE_NAME_PREFIX=backend-repo-vm APP_NAME=backend-repo GCP_MACHINE_TYPE=f1-micro GCP_PROJECT_ID=my-gcp-project TF_ACTION=apply make -f Makefile.gcp_vm_docker terraform-action`. This assumes that the service account file is named `terraform-sa-key.json` and located in the folder `terraform/gcp`.
8. `ENV=staging GCP_PROJECT_ID=my-gcp-project GCP_CREDENTIALS=../terraform-sa-key.json GCP_ZONE=us-central1-a SSH_STRING="john@backend-repo-vm-production" VM_INSTANCE_NAME_PREFIX=backend-repo-vm APP_NAME=backend-repo GCP_MACHINE_TYPE=n1-standard-4 GCP_PROJECT_ID=my-gcp-project TF_ACTION=apply make -f Makefile.gcp_vm_docker terraform-action`. This assumes that the service account file is named `terraform-sa-key.json` and located in the folder `terraform/gcp`.

After running those commands, the infrastucture should be ready to receive app deployments.

### CI/CD

GitHub Actions is used as the CI/CD tool. 
Each time a code is pushed to the master branch, deployment to the staging infrastructure is started.
Each time a code is tagged with the format `v\d+\.\d+\.\d+`, deployment to the production infrastructure is started.
Before starting a deployment, some variables and secrets need to be set.

#### Set repository variables
* `FIREBASE_PROJECT_ID`
* `GCP_PROJECT_ID`
* `GCP_ZONE`. The Google data center to be used, for example, `us-central1-a`.
* `GOOGLE_APPLICATION_CREDENTIALS`. The location of the GCP service account file. The service account should have the right to access the Firestore database.
* `SSH_STRING_PREFIX`. If the VM instances will be `backend-repo-vm-staging` and `backend-repo-vm-production`, then `SSH_STRING_PREFIX` is `<your name>@backend-repo-vm`. If your name is John, then `SSH_STRING_PREFIX` is `john@backend-repo-vm`.

#### Set repository secrets
* `APP_SECRET_TOKEN`. To token to be used by the client to access this backend app.
* `GCE_SA_KEY`. The content of the service account file that allows GitHub Actions to access GCP infrastructure.
* `GOOGLE_APPLICATION_CREDENTIALS`. The content of the service account file that allows the backend app to access Firebase.