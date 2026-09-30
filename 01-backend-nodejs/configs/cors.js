const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost',
  'http://localhost:4028',
  'https://linglooma.vercel.app',
];

function getAllowedOrigins(value = process.env.ALLOWED_ORIGINS) {
  const configured = typeof value === 'string'
    ? value.split(',').map(origin => origin.trim()).filter(Boolean)
    : [];
  return new Set(configured.length ? configured : DEFAULT_ALLOWED_ORIGINS);
}

function createCorsOptions(value) {
  const allowedOrigins = getAllowedOrigins(value);
  return {
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
  };
}

module.exports = { DEFAULT_ALLOWED_ORIGINS, getAllowedOrigins, createCorsOptions };
