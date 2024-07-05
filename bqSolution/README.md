# Install

npm install

gcloud auth application-default login

sudo snap install google-cloud-cli --classic

# Run

node bqFiller


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