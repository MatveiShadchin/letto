import { Client } from 'ssh2';

const password = process.env.SSH_PASSWORD;
const command = process.argv.slice(2).join(' ');

if (!password || !command) {
  console.error('Usage: SSH_PASSWORD=... node deploy/remote-exec.mjs <command>');
  process.exit(1);
}

const conn = new Client();
conn
  .on('ready', () => {
    conn.exec(command, (err, stream) => {
      if (err) throw err;
      stream.on('close', (code) => {
        conn.end();
        process.exit(code ?? 0);
      });
      stream.on('data', (data) => process.stdout.write(data));
      stream.stderr.on('data', (data) => process.stderr.write(data));
    });
  })
  .connect({ host: '147.45.158.254', port: 22, username: 'root', password });
