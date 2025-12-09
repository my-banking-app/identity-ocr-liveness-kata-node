const { createServer } = require('./app');
const { buildConfig } = require('./config');

const config = buildConfig();
const server = createServer();

server.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`API de autenticación escuchando en el puerto ${config.port}`);
});
