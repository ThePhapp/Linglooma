// Hide only known controller diagnostics; unexpected messages remain visible.
module.exports = function expectedConsole(method, prefixes) {
  const original = console[method].bind(console);
  return jest.spyOn(console, method).mockImplementation((...args) => {
    if (!prefixes.some(prefix => String(args[0]).startsWith(prefix))) original(...args);
  });
};
