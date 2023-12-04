import postgres from "postgres";
import { createConnection } from "mysql2/promise";

let database = process.env.db.toString()
let schema = process.env.schema.toString()
let engine = process.env.engine.toString()
let username = process.env.username.toString()
let password = process.env.password.toString()
let db_host = process.env.db_host.toString()
let mb_host = process.env.mb_host.toString()

async function getTablesPostgres(sql) {
    return await sql `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_catalog = ${database}::text
    AND table_schema = ${schema}::text
    AND table_type = 'BASE TABLE'::text
    ORDER BY table_name ASC;`
}

async function getTablesMysql(connection) {
    //tbw
}

async function getColumnsPostgres (sql, schema, table) {
    return await sql `
    SELECT column_name || ':' || udt_name as column
    FROM information_schema.columns
    WHERE table_schema = ${schema}::text
    AND table_name = ${table.table_name}::text
    ORDER BY ordinal_position ASC;
    `
}

async function getForeignKeysPostgres (sql, schema, table) {
    return await sql `
    SELECT
        tc.constraint_name,
        kcu.column_name || ' -> ' || ccu.table_name || ':' || ccu.column_name as destination
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema=${schema}
        AND tc.table_name=${table.table_name}
    ORDER BY tc.constraint_name ASC;`
}

async function main() {
    if ( engine === "postgres") {
        const sql = postgres(`postgres://username:password@host/database`, {
            host: db_host,
            username: username,
            password: password,
            database: database,
        });
        
        const [{ version }] = await sql `SELECT version()`;
        let tables = await getTablesPostgres(sql)
        await Promise.all(tables.map(async table => {
            table.columns = await getColumnsPostgres(sql, schema, table)
            table.foreignKeys = await getForeignKeysPostgres(sql, schema, table)
        }))
    
        const mb_version = await fetch(`${mb_host}/api/session/properties`)
        const mb_version_json = await mb_version.json()
    
        console.log(`Metabase version: ${mb_version_json.version.tag}`)
        console.log(`Database version: ${version}`)
    
        tables.map(table => {
            console.log(`Table name: ${table.table_name}`)
            table.columns.map(column => {
                console.log(`- ${column.column}`)
            })
            table.foreignKeys.map(foreignKey => {
                console.log(`FK: ${foreignKey.constraint_name} = ${foreignKey.destination}`)
            })
        })
        
    } else {
        // this is just scaffolding for the mysql part
        const connection = await createConnection({
            host: "localhost",
            user: "metabase",
            password: "mysecretpassword",
            database: "metabase",
          });
        
          const [rows] = await connection.execute("SELECT 1+2 AS count");
          console.log(rows); // [{ count: 3 }]
        }
}

main()
