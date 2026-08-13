import { copyFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const output = join(root, 'dist');
const source = join(root, 'outputs');
const files = ['index.html', 'styles.css', 'app.js', 'howmuch-data.mjs'];

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });

for (const file of files) {
  copyFileSync(join(source, file), join(output, file));
}
