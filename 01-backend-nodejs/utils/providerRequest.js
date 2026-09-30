// Keep the deadline active while both the request and response body are read.
async function postJsonWithDeadline(fetchImpl, url, body, timeoutMs = 15000) {
  const controller = new AbortController();
  let timer;
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error('Provider deadline exceeded'));
    }, timeoutMs);
  });
  try {
    const request = (async () => {
      const response = await fetchImpl(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
      });
      if (!response.ok) throw new Error('Provider unavailable');
      return response.json();
    })();
    return await Promise.race([request, deadline]);
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { postJsonWithDeadline };
