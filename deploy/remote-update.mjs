import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { Client } from 'ssh2';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const archivePath = path.join(projectRoot, 'letto-clean.tgz');

function packProject() {
  console.log('Packing fresh archive from git...');
  if (fs.existsSync(archivePath)) {
    fs.unlinkSync(archivePath);
  }

  execSync(`git archive --format=tar.gz -o "${archivePath}" HEAD`, {
    cwd: projectRoot,
    stdio: 'inherit',
  });

  const sizeMb = (fs.statSync(archivePath).size / (1024 * 1024)).toFixed(2);
  console.log(`Archive ready: ${archivePath} (${sizeMb} MB)`);
}

packProject();

const host = '147.45.158.254';
const username = 'root';
const password = process.env.SSH_PASSWORD;

if (!password) {
  console.error('SSH_PASSWORD is required');
  process.exit(1);
}

const files = [
  {
    local: path.join(projectRoot, 'letto-clean.tgz'),
    remote: '/root/letto-clean.tgz',
  },
  {
    local: path.join(projectRoot, 'deploy', 'update-on-server.sh'),
    remote: '/root/update-on-server.sh',
  },
];

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
  console.log('SSH connected');

  conn.sftp(async (err, sftp) => {
    if (err) {
      conn.end();
      throw err;
    }

    try {
      for (const file of files) {
        console.log(`Uploading ${path.basename(file.local)}...`);
        await uploadFile(sftp, file.local, file.remote);
      }

      console.log('Running update on server...');
      await execCommand(
        conn,
        'chmod +x /root/update-on-server.sh && bash /root/update-on-server.sh /root/letto-clean.tgz'
      );

      console.log('Deploy finished');
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
