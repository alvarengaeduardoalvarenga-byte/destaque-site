# Site Colégio Destaque

Site estático one-page. Sem build step.

## Rodar localmente
    node serve.js 8092
Abrir http://localhost:8092

## Otimizar imagens (uma vez, precisa de Node + sharp)
    node scripts/optimize-images.mjs

## Pendências do cliente
- Número de WhatsApp de destino (buscar `WHATSAPP_NUMBER` em js/whatsapp.js)
- Links dos vídeos de depoimento (buscar `VIDEO_PLACEHOLDER` em index.html)
- Logos oficiais em assets/logos/
- URL do Portal do Aluno (buscar 'Portal do Aluno' em index.html; restaurar target="_blank" ao inserir a URL real)
