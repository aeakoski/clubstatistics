# Install

Set the environment variables needed by the `main.js` server.
```
export MYWEBLOG_SYSTEM_USER=xxx-xxxx
export MYWEBLOG_SYSTEM_PASSWORD=xxxxxxxxxxxx
export MYWEBLOG_TOKEN=xxxxxxxxxxxx

npm install

-- In powershell:
$env:MYWEBLOG_SYSTEM_USER = "xxxxxxxxxxxx"
$env:MYWEBLOG_SYSTEM_PASSWORD = "xxxxxxxxxxxx"
$env:MYWEBLOG_TOKEN = "xxxxxxxxxxxx"
$env:NODE_OPTIONS = "--openssl-legacy-provider"
```

npm install

sudo snap install google-cloud-cli --classic

gcloud auth application-default login

# Run

## Populate data
node bqFiller

## Re-create lost views (views are deleted after 60 days)
node createViews


# Docker (WIP)
1. Create the docker image

```
docker build -t osfk-bq .

docker run -it osfk-bq:latest

```

2. Run the pgFiller
```
node bqFiller
```

3. See results
```
Navigate into BigQuery
```

# Club Statistics

This project contains scripts for managing club statistics data in BigQuery.

## Google Cloud Setup for Vercel

1. Create a service account and download credentials:
```bash
# Create service account
gcloud iam service-accounts create clubstatistics-vercel --display-name="Club Statistics Vercel"

# Grant BigQuery permissions
gcloud projects add-iam-policy-binding osfk-it --member="serviceAccount:clubstatistics-vercel@osfk-it.iam.gserviceaccount.com" --role="roles/bigquery.admin"

# Create and download key
gcloud iam service-accounts keys create key.json --iam-account=clubstatistics-vercel@osfk-it.iam.gserviceaccount.com
```

2. Convert the key file to base64:
```bash
# On Linux/Mac:
base64 -i key.json

# On Windows (PowerShell):
[Convert]::ToBase64String([System.IO.File]::ReadAllBytes("key.json"))
```

3. In Vercel, add these environment variables:
- `GOOGLE_CLOUD_PROJECT`: osfk-it
- `GOOGLE_CLOUD_CREDENTIALS`: <the base64-encoded key.json content>

## Running Scripts Individually

### bqFiller Script

To run the bqFiller script independently:

```bash
# Method 1: Using Node directly
node -e "require('./bqFiller.js')()"

# Method 2: Using npm script
npm run fill-bq
```

### Development Setup

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

The web interface will be available at http://localhost:3000 (or 3001 if 3000 is in use).

### Production Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy to Vercel:
```bash
vercel
```

3. Set up environment variables in Vercel:
- `MYWEBLOG_SYSTEM_USER`: Your MyWebLog system user
- `MYWEBLOG_SYSTEM_PASSWORD`: Your MyWebLog system password
- `MYWEBLOG_TOKEN`: Your MyWebLog API token
- `GOOGLE_CLOUD_PROJECT`: osfk-it
- `GOOGLE_CLOUD_CREDENTIALS`: <base64-encoded service account key>

4. Configure Vercel KV storage:
```bash
vercel link  # Link to your project
vercel env pull  # Pull environment variables
```

The application will track script execution using environment variables to ensure each script runs only once per day.

### Environment Variables

Make sure you have the following environment variables set:
- `MYWEBLOG_SYSTEM_USER`: Your MyWebLog system user
- `MYWEBLOG_SYSTEM_PASSWORD`: Your MyWebLog system password
- `MYWEBLOG_TOKEN`: Your MyWebLog API token
- `GOOGLE_CLOUD_PROJECT`: Your Google Cloud project ID
- `GOOGLE_CLOUD_CREDENTIALS`: Base64-encoded service account key
