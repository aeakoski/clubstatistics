
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