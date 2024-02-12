1. Create the docker image

```
docker build -t osfk-postgres .

docker run -it -p 5432:5432 -v pg_data:/var/lib/postgresql/data osfk-postgres:latest

```

2. Run the pgFiller
```
node pgfiller
```

3. See results
```
node get
```