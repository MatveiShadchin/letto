import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { Client } from 'ssh2';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const archivePath = path.join(projectRoot, 'letto-stable.tgz');

const stableRef = process.env.STABLE_REF?.trim() || 'stable';

function packStable() {
  console.log(`Packing stable archive from git ref: ${stableRef}`);
  if (fs.existsSync(archivePath)) {
    fs.unlinkSync(archivePath);
  }

  try {
    execSync(`git rev-parse --verify ${stableRef}^{commit}`, {
      cwd: projectRoot,
      stdio: 'pipe',
    });
  } catch {
    console.error(`Git ref "${stableRef}" not found. Run: bash deploy/promote-stable.sh`);
    process.exit(1);
  }

  execSync(`git archive --format=tar.gz -o "${archivePath}" ${stableRef}`, {
    cwd: projectRoot,
    stdio: 'inherit',
  });

  const sizeMb = (fs.statSync(archivePath).size / (1024 * 1024)).toFixed(2);
  console.log(`Archive ready: ${archivePath} (${sizeMb} MB)`);
}

packStable();

const host = '147.45.158.254';
const username = 'root';
const password = process.env.SSH_PASSWORD;

if (!password) {
  console.error('SSH_PASSWORD is required');
  process.exit(1);
}

const files = [
  {
    local: archivePath,
    remote: '/root/letto-stable.tgz',
  },
  {
    local: path.join(projectRoot, 'deploy', 'update-on-server-stable.sh'),
    remote: '/root/update-on-server-stable.sh',
  },
  {
    local: path.join(projectRoot, 'deploy', 'bootstrap-stable-on-server.sh'),
    remote: '/root/bootstrap-stable-on-server.sh',
  },
  {
    local: path.join(projectRoot, 'deploy', 'build-app.sh'),
    remote: '/root/build-app.sh',
  },
  {
    local: path.join(projectRoot, 'deploy', 'reload-nginx.sh'),
    remote: '/root/reload-nginx.sh',
  },
  {
    local: path.join(projectRoot, 'deploy', 'domains.sh'),
    remote: '/root/domains.sh',
  },
  {
    local: path.join(projectRoot, 'deploy', 'nginx-test-https.conf.template'),
    remote: '/root/nginx-test-https.conf.template',
  },
  {
    local: path.join(projectRoot, 'deploy', 'nginx-stable-https.conf.template'),
    remote: '/root/nginx-stable-https.conf.template',
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
    console.log('SSH connected [STABLE deploy]');

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

        console.log('Running stable update on server...');
        await execCommand(
          conn,
          'chmod +x /root/update-on-server-stable.sh /root/bootstrap-stable-on-server.sh /root/build-app.sh /root/reload-nginx.sh && ' +
            'mkdir -p /var/www/letto-stable/deploy && ' +
            'cp /root/domains.sh /root/nginx-*.template /var/www/letto-stable/deploy/ 2>/dev/null || true && ' +
            'cp /root/build-app.sh /root/reload-nginx.sh /var/www/letto-stable/deploy/ 2>/dev/null || true && ' +
            'cp /root/domains.sh /root/nginx-*.template /var/www/letto/deploy/ 2>/dev/null || true && ' +
            'cp /root/build-app.sh /root/reload-nginx.sh /var/www/letto/deploy/ 2>/dev/null || true && ' +
            'bash /root/update-on-server-stable.sh /root/letto-stable.tgz'
        );

        console.log('Stable deploy finished');
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
