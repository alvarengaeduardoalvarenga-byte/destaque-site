# Site Colégio Destaque

Site estático one-page. Sem build step.

## Rodar localmente
    node serve.js 8092
Abrir http://localhost:8092

## Otimizar imagens (uma vez, precisa de Node + sharp)
    node scripts/optimize-images.mjs

## Pendências do cliente
- Links dos vídeos de depoimento (buscar `VIDEO_PLACEHOLDER` em index.html)
- ~~Logos oficiais~~ ✔ aplicadas (assets/logos/destaque-branca.png + destaque-horizontal.png; originais em assets/logos/originals/)
- Portal da família: `https://sejadestaque.com/rematricula/`, disponível no cabeçalho e no menu em telas menores. A página `rematricula/index.html` redireciona para o portal real de 2027, com acesso alternativo por botão.
- URL do webhook do CRM para receber os leads do formulário (CRM_WEBHOOK_URL em js/whatsapp.js)
