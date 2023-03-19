import knex from "knex";
import { attachPaginate } from "knex-paginate";

const pgsql = knex({
  client: 'pg',
  connection: {
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE
  },
  searchPath: ['knex', 'public'],
  // debug: process.env.NODE_ENV === "production" ? false : true
  debug: false
})
attachPaginate();
try {
  await pgsql.raw("SELECT 1");
  console.log("Connexion à la base de donnée réussie.");
} catch (error) {
  console.error(`Connexion à la base de donnée échouée : ${error}`)
}

export default pgsql
