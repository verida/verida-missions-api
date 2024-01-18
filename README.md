# Airdrop API

This is a basic API with endpoints to check and submit claims and add the info to a Notion database.

## Endpoints

### Check a claim

Check a claim has already been submitted for a DID.

```
GET /api/rest/v1/claims/:did
```

Returns a boolean `exists` property.

```json
{
  "status": "success"
  "exists": true
}
```

### Submit a claim

Submit a claim for a given DID

```
POST /api/rest/v1/claims
```

payload:

```json
{
  "did": "did:vda:testnet:0x...",
  "userWalletAddress": "0x...",
  "activityProofs": [
    {
      "id": "create-verida-identity",
      "status": "completed"
    }
  ],
  "profile": {
    "name": "User Name",
    "country": "Australia"
  }
}
```

Returns an object with a `status` property and a `message` in case of error.

```json
{
  "status": "success"
}
```

```json
{
  "status": "error",
  "message": "Something went wrong"
}
```
