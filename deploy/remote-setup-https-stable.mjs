import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'ssh2';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

const host = '147.45.158.254';
const username = 'root';
const password = process.env.SSH_PASSWORD;

if (!password || password.trim() === '' || password === '...') {
  console.error(
    'SSH_PASSWORD не задан или является заглушкой. Укажите реальный пароль root к VPS.'
  );
  process.exit(1);
}

const files = [
  'domains.sh',
  'reload-nginx.sh',
  'setup-https-stable.sh',
  'nginx-test-https.conf.template',
  'nginx-stable-https.conf.template',
].map((name) => ({
  local: path.join(projectRoot, 'deploy', name),
  remote: `/root/${name}`,
}));

function uploadFile(sftp, localPath, remotePath) {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(localPath);
    const writeStream = sftp.createWriteStream(remotePath);
    writeStream.on('close', resolve);
    writeStream.on('error', reject);
    readStream.on('error', reject);
    readStream.pipe(writeStream);
  });
}

function execCommand(conn, command) {
  return new Promise((resolve, reject) => {
    conn.exec(command, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      let stderr = '';
      stream.on('close', (code) => {
        if (code === 0) resolve({ stdout, stderr });
        else reject(new Error(`Command failed (${code}): ${stderr || stdout}`));
      });
      stream.on('data', (data) => {
        const text = data.toString();
        stdout += text;
        process.stdout.write(text);
      });
      stream.stderr.on('data', (data) => {
        const text = data.toString();
        stderr += text;
        process.stderr.write(text);
      });
    });
  });
}

const conn = new Client();

conn
  .on('ready', () => {
    console.log('SSH connected — setting up stable HTTPS');
    conn.sftp(async (err, sftp) => {
      if (err) {
        conn.end();
        throw err;
      }
      try {
        for (const file of files) {
          if (!fs.existsSync(file.local)) {
            throw new Error(`Missing local file: ${file.local}`);
          }
          console.log(`Uploading ${path.basename(file.local)}...`);
          await uploadFile(sftp, file.local, file.remote);
        }

        // Копируем шаблоны туда, откуда их читает reload-nginx.sh на сервере
        await execCommand(
          conn,
          [
            'chmod +x /root/setup-https-stable.sh /root/reload-nginx.sh',
            'mkdir -p /var/www/letto/deploy /var/www/letto-stable/deploy /root/deploy',
            'cp /root/domains.sh /root/reload-nginx.sh /root/setup-https-stable.sh /root/nginx-*.template /root/deploy/',
            'cp /root/domains.sh /root/reload-nginx.sh /root/nginx-*.template /var/www/letto/deploy/',
            'cp /root/domains.sh /root/reload-nginx.sh /root/nginx-*.template /var/www/letto-stable/deploy/',
            // setup ищет скрипты рядом с собой
            'bash /root/deploy/setup-https-stable.sh',
          ].join(' && ')
        );

        console.log('Stable HTTPS setup finished');
        conn.end();
      } catch (error) {
        conn.end();
        throw error;
      }
    });
  })
  .on('error', (error) => {
    console.error(error.message);
    process.exit(1);
  })
  .connect({
    host,
    port: 22,
    username,
    password,
    readyTimeout: 20000,
  });
