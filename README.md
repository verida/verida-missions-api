# Verida Missions API

This is a REST API for the Verida Missions web app with endpoints to deal with the airdrops and other resources.

## Endpoints

```
GET  /api/rest/v1/airdrops/1/check/:did
GET  /api/rest/v1/airdrops/1/proofs/:did - deprecated

POST /api/rest/v1/airdrops/1/register
POST /api/rest/v1/airdrops/1/proofs - deprecated

POST /api/rest/v1/airdrops/1/claim

POST /api/rest/v1/airdrops/2/check
POST /api/rest/v1/airdrops/2/eligibility/:wallet - deprecated

POST /api/rest/v1/airdrops/2/claim
```

(This list may not be up to date, check the `routes` and the `controller` files)

## Development

This is a serverless application.

### Installation

Install the dependencies with `yarn`:

```
yarn install
```

Some environment variables are required for the application to run. Have a look at the provided examples.

Copy `.env.example`, rename it to `.env` and modify the variables for your local environment:

```
cp .env.example .env
```

### Run

The application can be started with the offline serverless plugin simulating the AWS Lambda environment:

```
yarn run start
```

Note that the offline plugin runs with no timeout, but the deployed lambda will be subject to a 30s timeout. Consider it when developing.

### Test

```
yarn run test
```

### Build

```
yarn run build
```

Messages are compiled automatically before the build.

## Deployment

There are GitHub Actions workflows to deploy the application to AWS lambda.

For now, these deployment workflow are called manually in the GitHub UI but could be automated in the future.

The deployment itself uses the serverless framework and `serverless.yml` config file.
