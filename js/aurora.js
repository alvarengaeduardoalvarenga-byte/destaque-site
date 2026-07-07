// Fundo aurora — gradiente fluido verde/azul/lilás sobre o off-white.
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
  vec2 m = (iMouse / iResolution - 0.5) * 0.25;
  vec2 p = uv * 2.2 + m;
  p.x *= iResolution.x / iResolution.y;
  float t = iTime * 0.06;
  float n1 = fbm(p + vec2(t, -t * 0.7));
  float n2 = fbm(p * 1.4 - vec2(t * 0.8, t * 0.5) + n1);
  vec3 green = vec3(0.72, 0.90, 0.78);
  vec3 blue  = vec3(0.70, 0.82, 0.95);
  vec3 lilac = vec3(0.83, 0.78, 0.95);
  float osc = sin(iTime * 0.12 + n1 * 3.0) * 0.5 + 0.5;
  vec3 aurora = mix(mix(green, blue, smoothstep(0.2, 0.8, n2)), lilac, osc * smoothstep(0.3, 0.9, n1));
  vec3 base = vec3(0.984, 0.984, 0.976); /* #FBFBF9 */
  float strength = smoothstep(0.35, 0.9, n2) * 0.55;
  vec3 col = mix(base, aurora, strength);
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

  const mouse = { x: 0.5, y: 0.5 };
  const onMove = (e) => {
    mouse.x = e.clientX / window.innerWidth;
    mouse.y = 1 - e.clientY / window.innerHeight;
  };
  window.addEventListener('mousemove', onMove, { passive: true });

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
    gl.uniform1f(uTime, (performance.now() - t0) / 1000);
    gl.uniform2f(uMouse, mouse.x * canvas.width, mouse.y * canvas.height);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
