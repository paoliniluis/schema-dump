# Schema dumper

## How to run

`NODE_TLS_REJECT_UNAUTHORIZED=0 mb_host=https://localhost:8443 db_host=localhost username=metabase password=mysecretpassword engine=postgres db=metabase schema=public bun index.js > output.txt`

with the following env vars
- NODE_TLS_REJECT_UNAUTHORIZED: just for calling instances with self signed certs so the program runs
- mb_host: the URL where Metabase runs, it's just for getting the version of the application
- db_host: the host of the database, for connecting to it
- username: database username, needs to be a username that can query the information schema
- password: the password of the database username
- engine: which db engine you're using (right now only postgres is supported)
- db: the database where the application database is located
- schema: the schema where the application database is located

Requirements:
- bun (bun.sh)

Install requirements with "bun install" before using