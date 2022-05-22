module.exports = {
  development: {
    username: 'postgres',
    password: 'password',
    database: 'rs_dev',
    host: '127.0.0.1',
    dialect: 'postgres',
    define: {
      underscored: true,
      timestamps: true,
      logging: false
    }
  },
  production: {
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: 'rs-database',
    dialect: 'postgres',
    define: {
      underscored: true,
      timestamps: true,
      logging: false
    }
  }
};
