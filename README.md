<p style='text-align: center'>
  <img alt="3Commas" src="https://3commas.io/assets/bittrix_landing/logo-dc9cce06dcd7724e67eba910fdd0c93da89a13d3cd628f180fb689823fa9d0cc.svg" width='300px'>
</p>

## Description

Options aggregator with api.

## Installation
                
1 - Install NodeJS

https://nodejs.org/

2 - Install Docker

https://www.docker.com/get-started

3 - Install packages

```bash
$ npm install
```
              
## Configuration

Create .env file like .env.example

Variables:

`OA_MONGO_CONNECT` - Mongo connection path.  
`OA_AGG_API_PORT` - Aggregation api port.  
`OA_SYNC_INTERVAL_MS` - Aggregation sync interval in milliseconds.

In dev mode use vars from example file.

## Running the app

```bash
# build all
$ npm run build:all

# start db (dev)
$ npm run start:db

# api microservice (dev)
$ npm run start:api

# aggregator microservice (dev)
$ npm run start:agg

# production bare metal mode
# (configure .env)
$ npm run start:prod:api
$ npm run start:prod:agg
```
              
## Api
  
Swagger - http://localhost:3000/api/