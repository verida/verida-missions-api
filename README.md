# Verida Missions API

This is a REST API for the Verida Missions web app with endpoints to deal with the airdrops and other resources.

## Endpoints

```
GET  /api/rest/v1/airdrops/1/proofs/:did
POST /api/rest/v1/airdrops/1/proofs/
GET  /api/rest/v1/airdrops/2/proofs/:wallet
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

TBD
