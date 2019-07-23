const RpcCLient = require('./promise');

async function main() {
  const client = new RpcCLient({
    protocol: 'http',
    user: 'dashrpc',
    pass: 'password',
    host: '127.0.0.1',
    port: 30002
  });
  const user = await client.getUser('vasya');
  console.log(user);
}

main().catch(console.error);