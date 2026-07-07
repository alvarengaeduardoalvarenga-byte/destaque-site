import assert from 'node:assert';
import { buildWhatsappUrl } from '../js/whatsapp.js';

const url = buildWhatsappUrl({ number: '5575999999999', nome: 'Ana', telefone: '75988887777' });
assert.ok(url.startsWith('https://wa.me/5575999999999?text='));
const text = decodeURIComponent(url.split('text=')[1]);
assert.ok(text.includes('matrícula 2027'));
assert.ok(text.includes('Ana'));
assert.ok(text.includes('75988887777'));
assert.ok(!text.includes('Série/segmento')); // sem série, sem linha de série

const url3 = buildWhatsappUrl({ number: '5575999999999', nome: 'Ana', telefone: '1', serie: '1º ano EM' });
assert.ok(decodeURIComponent(url3.split('text=')[1]).includes('Série/segmento de interesse: 1º ano EM'));

const url2 = buildWhatsappUrl({ number: '+55 (75) 99999-9999', nome: 'X', telefone: '1' });
assert.ok(url2.startsWith('https://wa.me/5575999999999?text='));
console.log('whatsapp.test OK');
