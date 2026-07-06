// scripts/optimize-images.mjs
//
// Redimensiona e converte para WebP as fotos de origem (candid + estúdio) para
// uso no site do Colégio Destaque. Roda de forma idempotente: pode ser
// re-executado a qualquer momento (ex.: quando a pasta MARKETING-2026 for
// baixada) sem passos manuais adicionais.
//
// Uso: node scripts/optimize-images.mjs
// Requer: npm i sharp --no-save   (rodar uma vez antes, dentro da pasta do projeto)

import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

// --- Resolução de caminhos (Windows-safe) ---------------------------------
// new URL(...).pathname quebra no Windows quando o caminho tem espaços
// (retorna algo com %20 codificado). fileURLToPath lida com isso corretamente.
const OUT = fileURLToPath(new URL('../assets/fotos/', import.meta.url));

// --- Resolução da pasta "Área de Trabalho" (possível NFD no OneDrive) -----
// O nome "Área de Trabalho" pode estar normalizado em NFD (acento como
// caractere combinante separado) no disco, o que faz comparações de string
// literais falharem em alguns cenários. Resolvemos o nome real da pasta
// listando o diretório pai e casando por regex, em vez de assumir a forma
// exata da string.
function resolveAreaDeTrabalho() {
  const oneDrive = 'C:/Users/eduar/OneDrive';
  const literal = path.join(oneDrive, 'Área de Trabalho');
  if (fs.existsSync(literal)) return literal;

  const entries = fs.readdirSync(oneDrive, { withFileTypes: true });
  const match = entries.find((e) => e.isDirectory() && /rea de Trabalho/.test(e.name));
  if (!match) {
    throw new Error(
      `Não foi possível localizar a pasta "Área de Trabalho" dentro de ${oneDrive}. ` +
        `Entradas encontradas: ${entries.map((e) => e.name).join(', ')}`
    );
  }
  return path.join(oneDrive, match.name);
}

const AREA_DE_TRABALHO = resolveAreaDeTrabalho();
const SRC_CANDID = path.join(AREA_DE_TRABALHO, 'TESTE CLAUDE/DESTAQUE/DESTAQUE');
const SRC_STUDIO = path.join(AREA_DE_TRABALHO, 'TESTE CLAUDE/DESTAQUE/MARKETING-2026');

if (!fs.existsSync(SRC_CANDID)) {
  throw new Error(`Pasta de fotos candid não encontrada: ${SRC_CANDID}`);
}
console.log('Pasta CANDID resolvida:', SRC_CANDID);
console.log(
  'Pasta STUDIO:',
  SRC_STUDIO,
  fs.existsSync(SRC_STUDIO) ? '(encontrada)' : '(não encontrada — será pulada)'
);

// --- Mapa curado: origem -> destino ----------------------------------------
// Formato: [pastaOrigem, arquivoOrigem, nomeSaida, larguraMax]
// Curado por inspeção visual de todas as 21 fotos da pasta CANDID.
const MAP = [
  // Hero: duas meninas de mãos dadas brincando no parquinho — a mais marcante.
  [SRC_CANDID, 'Schramm20251003102130 (3).jpg', 'hero-crianca.webp', 2000],

  // Carta: menino sorrindo abraçando o mascote de pelúcia — tom emocional.
  [SRC_CANDID, 'WhatsApp Image 2026-07-06 at 14.58.18.jpeg', 'carta-crianca.webp', 1600],

  // Fachada do prédio do colégio ao entardecer, ângulo frontal mais limpo.
  [SRC_CANDID, 'WhatsApp Image 2026-07-04 at 16.40.39 (1).jpeg', 'fachada.webp', 1600],

  // Ambientes
  [SRC_CANDID, 'unnamed.webp', 'ambiente-jardim.webp', 1600], // pergola de madeira / jardim
  [SRC_CANDID, 'Schramm17112022105509.jpg', 'ambiente-leitura.webp', 1600], // menino lendo com boneco
  [SRC_CANDID, 'WhatsApp Image 2026-07-06 at 14.58.20.jpeg', 'ambiente-leitura-jardim.webp', 1600], // menina lendo sob a pergola
  [SRC_CANDID, 'WhatsApp Image 2026-07-06 at 14.58.19.jpeg', 'ambiente-atividade.webp', 1600], // atividade em grupo com paraquedas
  [SRC_CANDID, 'WhatsApp Image 2026-07-06 at 14.58.19 (1).jpeg', 'sala-globo.webp', 1600], // duas meninas explorando globo iluminado
  [SRC_CANDID, 'WhatsApp Image 2026-07-06 at 14.58.20 (2).jpeg', 'sala-atividades.webp', 1600], // crianças desenhando em sala de aula

  // Retratos / candid adicionais
  [SRC_CANDID, 'Schramm20250930110107 (2).jpg', 'retrato-baloes.webp', 1600], // 3 crianças pegando balões azuis
  [SRC_CANDID, 'unnamed (1).webp', 'retrato-interacao.webp', 1600], // professora e criança, brincadeira com bola
  [SRC_CANDID, 'Schramm20250930113651.jpg', 'retrato-1.webp', 1200], // adolescente sorrindo com cadernos
  [SRC_CANDID, 'Schramm20251001085832 (1).jpg', 'retrato-2.webp', 1200], // criança pequena no parquinho colorido

  // Retratos de estúdio (só existem se a pasta MARKETING-2026 já tiver sido baixada):
  // preencher aqui após inspeção visual quando a pasta chegar. Ex.:
  // [SRC_STUDIO, '<arquivo>.jpg', 'retrato-3.webp', 1200],
];

// --- Execução ---------------------------------------------------------------
fs.mkdirSync(OUT, { recursive: true });

let ok = 0;
let skipped = 0;

for (const [dir, file, out, w] of MAP) {
  const srcPath = path.join(dir, file);
  if (!fs.existsSync(srcPath)) {
    console.warn('PULANDO (não existe):', srcPath);
    skipped++;
    continue;
  }
  await sharp(srcPath)
    .resize({ width: w, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(path.join(OUT, out));
  console.log('OK ->', out);
  ok++;
}

// --- Placeholder cinza (usado até os retratos de estúdio chegarem) ---------
const placeholderPath = path.join(OUT, 'placeholder.webp');
await sharp({
  create: {
    width: 1200,
    height: 1500,
    channels: 3,
    background: { r: 214, g: 214, b: 214 },
  },
})
  .webp({ quality: 82 })
  .toFile(placeholderPath);
console.log('OK -> placeholder.webp (gerado)');

console.log(`Concluído. ${ok} imagem(ns) geradas, ${skipped} pulada(s).`);
