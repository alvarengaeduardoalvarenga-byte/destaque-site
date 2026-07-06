import assert from 'node:assert';
import { buildWhatsappUrl } from '../js/whatsapp.js';

const url = buildWhatsappUrl({ number: '5575999999999', nome: 'Ana', telefone: '75988887777', serie: '1º ano EM' });
assert.ok(url.startsWith('https://wa.me/5575999999999?text='));
const text = decodeURIComponent(url.split('text=')[1]);
assert.ok(text.includes('Ana'));
assert.ok(text.includes('75988887777'));
assert.ok(text.includes('1º ano EM'));

// sanitiza número (remove não-dígitos)
const url2 = buildWhatsappUrl({ number: '+55 (75) 99999-9999', nome: 'X', telefone: '1', serie: 'Y' });
assert.ok(url2.startsWith('https://wa.me/5575999999999?text='));
console.log('whatsapp.test OK');
