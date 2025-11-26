// Database migration helper - runs schema push on startup

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function runMigrations(): Promise<void> {
  console.log('Running database migrations...');
  try {
    const { stdout, stderr } = await execAsync('npm run db:push', {
      cwd: process.cwd(),
      env: process.env,
      timeout: 60000,
    });
    if (stdout) console.log('Migration output:', stdout);
    if (stderr && !stderr.includes('No config path')) console.error('Migration stderr:', stderr);
    console.log('Database migrations completed successfully');
  } catch (error: any) {
    console.error('Migration failed:', error.message);
    if (error.stdout) console.log('stdout:', error.stdout);
    if (error.stderr) console.log('stderr:', error.stderr);
  }
}
