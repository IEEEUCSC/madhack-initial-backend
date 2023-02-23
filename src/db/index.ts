import { Pool, QueryArrayConfig} from 'pg';

const pool = new Pool(
  {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
  }
)

module.exports = {
  query: (text: QueryArrayConfig<any>, params: any) => pool.query(text, params),
}
