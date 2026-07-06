import assert from 'node:assert';
import { formatCount } from '../js/counters.js';

assert.strictEqual(formatCount(980, ' pts'), '980 pts');
assert.strictEqual(formatCount(1, 'º'), '1º');
assert.strictEqual(formatCount(4, 'x'), '4x');
assert.strictEqual(formatCount(1234, ''), '1.234'); // separador de milhar pt-BR
console.log('counters.test OK');
