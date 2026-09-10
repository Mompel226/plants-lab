/* Prints the config.js line for a new potometer unlock word.   node tools/unlock-hash.mjs "the word"   */
import { createHash } from 'node:crypto';
const word = (process.argv[2] || '').trim().toLowerCase();
if (!word) { console.error('Give the word: node tools/unlock-hash.mjs "the word"'); process.exit(1); }
console.log("  potometerUnlock: '" + createHash('sha256').update(word).digest('hex') + "',");
