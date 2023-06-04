# Myweblog flightclub statistics

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

# Build
**npm run build**
```
react-scripts build && (npm install)
```

# Run
**npm start**
```
node server.js

```
Dashboard should be visible on `localhost:8889`

# Preview
![alt text](./images/screenshot.png "Screenshot of dashboard")

# Deployment instructions

https://dev.to/myogeshchavan97/how-to-deploy-react-node-js-application-to-heroku-4jb4
