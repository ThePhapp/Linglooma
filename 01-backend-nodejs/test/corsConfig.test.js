const { DEFAULT_ALLOWED_ORIGINS, getAllowedOrigins, createCorsOptions } = require('../configs/cors');

function checkOrigin(options, origin) {
  return new Promise(resolve => options.origin(origin, (error, allowed) => resolve({ error, allowed })));
}

test('uses documented local defaults only when no allowlist is configured', () => {
  expect([...getAllowedOrigins(undefined)]).toEqual(DEFAULT_ALLOWED_ORIGINS);
  expect([...getAllowedOrigins('  ')]).toEqual(DEFAULT_ALLOWED_ORIGINS);
});

test('normalizes a deployment allowlist and replaces defaults', () => {
  expect([...getAllowedOrigins(' https://app.example.com,https://admin.example.com, ')])
    .toEqual(['https://app.example.com', 'https://admin.example.com']);
});

test('allows configured and non-browser requests while rejecting other origins', async () => {
  const options = createCorsOptions('https://app.example.com');
  await expect(checkOrigin(options, undefined)).resolves.toEqual({ error: null, allowed: true });
  await expect(checkOrigin(options, 'https://app.example.com')).resolves.toEqual({ error: null, allowed: true });
  const denied = await checkOrigin(options, 'http://localhost:4028');
  expect(denied.allowed).toBeUndefined();
  expect(denied.error).toEqual(new Error('Not allowed by CORS'));
});
