// Fundo aurora noturno — céu profundo com estrelas cintilantes e um brilho de aurora
// subindo do rodapé cuja cor muda com o scroll (teal → azul → lilás).
// Adaptado de um shader React/WebGL para vanilla; roda em canvas fixo atrás do conteúdo.
const VERT = `
attribute vec2 aPosition;
void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform vec2 iMouse;
uniform float uScroll;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / iResolution.xy;

  /* céu profundo: quase preto no topo do viewport, marinho na base */
  vec3 skyTop = vec3(0.016, 0.031, 0.10);
  vec3 skyBot = vec3(0.051, 0.106, 0.30);
  vec3 col = mix(skyTop, skyBot, pow(1.0 - uv.y, 1.5));

  /* estrelas: pontos redondos e suaves; posição, tamanho, ritmo e fase
     independentes por estrela (hashes distintos por célula) */
  vec2 grid = gl_FragCoord.xy / 9.0;
  vec2 cell = floor(grid);
  vec2 f = fract(grid);
  float h = hash(cell);
  if (h > 0.72) {
    vec2 starPos = 0.2 + 0.6 * vec2(hash(cell + 1.7), hash(cell + 4.3));
    float d = length(f - starPos);
    float size = 0.05 + 0.09 * hash(cell + 9.1);
    float speed = 1.5 + 3.5 * hash(cell + 3.3);
    float phase = hash(cell + 5.5) * 6.2831;
    float tw = 0.25 + 0.75 * (0.5 + 0.5 * sin(iTime * speed + phase));
    float star = smoothstep(size, 0.0, d) * tw;
    col += vec3(star) * 1.4;
  }

  /* aurora subindo do rodapé; cor muda com o scroll (teal → azul → lilás) */
  vec2 m = (iMouse / iResolution - 0.5) * 0.2;
  float n = fbm(vec2(uv.x * 2.0 + m.x + iTime * 0.05, uv.y * 1.2 + m.y - iTime * 0.03));
  float glow = pow(1.0 - uv.y, 2.0) * (0.65 + 0.6 * n);
  vec3 teal  = vec3(0.10, 0.78, 0.62);
  vec3 blue  = vec3(0.22, 0.47, 0.95);
  vec3 lilac = vec3(0.64, 0.47, 0.96);
  vec3 glowColor = uScroll < 0.5 ? mix(teal, blue, uScroll * 2.0) : mix(blue, lilac, (uScroll - 0.5) * 2.0);
  col += glowColor * glow * 0.85;

  gl_FragColor = vec4(col, 1.0);
}
`;

export function initAurora() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'aurora-bg';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', { antialias: false, depth: false, stencil: false });
  if (!gl) return;
  document.body.prepend(canvas);

  const compile = (src, type) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(s)); gl.deleteShader(s); return null; }
    return s;
  };
  const vs = compile(VERT, gl.VERTEX_SHADER);
  const fs = compile(FRAG, gl.FRAGMENT_SHADER);
  if (!vs || !fs) { canvas.remove(); return; }
  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.error(gl.getProgramInfoLog(prog)); canvas.remove(); return; }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPosition');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, 'iResolution');
  const uTime = gl.getUniformLocation(prog, 'iTime');
  const uMouse = gl.getUniformLocation(prog, 'iMouse');
  const uScrollLoc = gl.getUniformLocation(prog, 'uScroll');

  document.body.classList.add('has-aurora');

  const mouse = { x: 0.5, y: 0.5 };
  const onMove = (e) => {
    mouse.x = e.clientX / window.innerWidth;
    mouse.y = 1 - e.clientY / window.innerHeight;
  };
  window.addEventListener('mousemove', onMove, { passive: true });

  let scrollTarget = 0, scrollSmooth = 0;
  const onScroll = () => {
    scrollTarget = window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const resize = () => {
    // meia resolução: gradientes escalam sem perda visível e a GPU agradece
    canvas.width = Math.max(1, Math.floor(canvas.clientWidth * 0.5));
    canvas.height = Math.max(1, Math.floor(canvas.clientHeight * 0.5));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
  };
  window.addEventListener('resize', resize, { passive: true });
  resize();

  const t0 = performance.now();
  const frame = () => {
    if (gl.isContextLost()) return;
    scrollSmooth += (scrollTarget - scrollSmooth) * 0.06;
    gl.uniform1f(uTime, (performance.now() - t0) / 1000);
    gl.uniform2f(uMouse, mouse.x * canvas.width, mouse.y * canvas.height);
    gl.uniform1f(uScrollLoc, scrollSmooth);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
