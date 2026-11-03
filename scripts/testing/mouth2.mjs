// Jaw shape and open-mouth layer for a rigged Meshy person, lined up with the painted lips.
// Args: in.glb out.glb mouth.png Lu Lv Ru Rv  (the two corners of the mouth in texture coordinates)
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import sharp from 'sharp';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const [, , src, out, png, ...cn] = process.argv; const [Lu, Lv, Ru, Rv] = cn.map(Number);
const DROP = Number(process.env.DROP || 0.011), HH = Number(process.env.HH || 0.0055), SIZE = 2048;
const d = await io.read(src);
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]], add=(a,b,k=1)=>[a[0]+b[0]*k,a[1]+b[1]*k,a[2]+b[2]*k], dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2], nrm=(a)=>{const l=Math.hypot(...a);return a.map(x=>x/l)}, cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const skin = d.getRoot().listSkins()[0]; const joints = skin.listJoints(); const ibm = skin.getInverseBindMatrices().getArray();
const jp = (name) => { const k = joints.findIndex(j => j.getName() === name); const a = ibm.slice(k*16, k*16+16);
  const r=[a[0],a[1],a[2],a[4],a[5],a[6],a[8],a[9],a[10]];
  const det=r[0]*(r[4]*r[8]-r[5]*r[7])-r[3]*(r[1]*r[8]-r[2]*r[7])+r[6]*(r[1]*r[5]-r[2]*r[4]);
  const i=[(r[4]*r[8]-r[5]*r[7])/det,(r[2]*r[7]-r[1]*r[8])/det,(r[1]*r[5]-r[2]*r[4])/det,(r[5]*r[6]-r[3]*r[8])/det,(r[0]*r[8]-r[2]*r[6])/det,(r[2]*r[3]-r[0]*r[5])/det,(r[3]*r[7]-r[4]*r[6])/det,(r[1]*r[6]-r[0]*r[7])/det,(r[0]*r[4]-r[1]*r[3])/det];
  return { k, p: [-(i[0]*a[12]+i[3]*a[13]+i[6]*a[14]),-(i[1]*a[12]+i[4]*a[13]+i[7]*a[14]),-(i[2]*a[12]+i[5]*a[13]+i[8]*a[14])] }; };
const Hd = jp('Head'), Nk = jp('neck'), H = Hd.p, up = nrm(sub(jp('head_end').p, H)); let hf = sub(jp('headfront').p, H); hf = nrm(sub(hf, up.map(x=>x*dot(hf,up))));
const prim = d.getRoot().listMeshes()[0].listPrimitives()[0];
const P = prim.getAttribute('POSITION'), UV = prim.getAttribute('TEXCOORD_0'), JO = prim.getAttribute('JOINTS_0'), W = prim.getAttribute('WEIGHTS_0'), IDX = prim.getIndices().getArray();
// UV point -> 3D, on a front-facing head triangle
const v=[[0,0,0],[0,0,0],[0,0,0]], t=[[0,0],[0,0],[0,0]];
const at = (u, w) => { let best = null, bestScore = -1e9;
  for (let k=0;k<IDX.length;k+=3){ for (let q=0;q<3;q++){P.getElement(IDX[k+q],v[q]);UV.getElement(IDX[k+q],t[q]);}
    const den=(t[1][1]-t[2][1])*(t[0][0]-t[2][0])+(t[2][0]-t[1][0])*(t[0][1]-t[2][1]); if (Math.abs(den)<1e-12) continue;
    const b0=((t[1][1]-t[2][1])*(u-t[2][0])+(t[2][0]-t[1][0])*(w-t[2][1]))/den, b1=((t[2][1]-t[0][1])*(u-t[2][0])+(t[0][0]-t[2][0])*(w-t[2][1]))/den, b2=1-b0-b1;
    const score=Math.min(b0,b1,b2); if (score<bestScore) continue;
    const p=[0,1,2].map(i=>b0*v[0][i]+b1*v[1][i]+b2*v[2][i]); if (dot(sub(p,H),hf)<0.02 || Math.hypot(...sub(p,H))>0.2) continue;
    best=p; bestScore=score; }
  if (bestScore < -0.5) return null;
  return best; };
const L = at(Lu, Lv), R = at(Ru, Rv);
if (!L || !R) throw new Error('mouth corners not found on the face');
const O0 = [(L[0]+R[0])/2,(L[1]+R[1])/2,(L[2]+R[2])/2], O = add(O0, up, Number(process.env.OFF || 0)), side = nrm(sub(R, L)), HW = Math.hypot(...sub(R, L)) / 2;
let fw = nrm(sub(hf, side.map(x=>x*dot(hf,side)))); let dn = nrm(cross(side, fw)); if (dot(dn, up) > 0) dn = dn.map(x=>-x);
console.log('mouth width', (HW*2).toFixed(3), 'tilt deg', (Math.asin(dot(side, up))*180/Math.PI).toFixed(1));
const frame = (p) => { const r = sub(p, O); return [-dot(r, dn), dot(r, fw), dot(r, side)]; }; // height above the lip line, forward, side
const sm = (e0, e1, x) => { const q = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return q * q * (3 - 2 * q); };
// the jaw shape: chin and lower lip drop along the face's own down direction
const n = P.getCount(); const dpos = new Float32Array(n*3); const pv=[0,0,0], jj=[0,0,0,0], ww=[0,0,0,0]; let moved = 0;
for (let i=0;i<n;i++){ P.getElement(i,pv); JO.getElement(i,jj); W.getElement(i,ww);
  let wh=0; for(let q=0;q<4;q++) if (jj[q]===Hd.k||jj[q]===Nk.k) wh+=ww[q]; if (wh<0.3) continue;
  const [a, b, c] = frame(pv); if (a >= 0) continue;
  const w = sm(-0.06, -0.02, b) * sm(-0.1, -0.06, a) * (1 - sm(HW * 1.4, HW * 2.2, Math.abs(c))) * sm(0, -0.004, a);
  if (w <= 0) continue; moved++;
  const np = add(add(pv, dn, DROP * w), fw, -0.0015 * w);
  dpos[i*3]=np[0]-pv[0]; dpos[i*3+1]=np[1]-pv[1]; dpos[i*3+2]=np[2]-pv[2]; }
for (const t0 of prim.listTargets()) prim.removeTarget(t0);
const tgt = d.createPrimitiveTarget('jawOpen'); tgt.setAttribute('POSITION', d.createAccessor().setType('VEC3').setArray(dpos).setBuffer(P.getBuffer())); prim.addTarget(tgt);
const mesh = d.getRoot().listMeshes()[0]; mesh.setWeights([0]); mesh.setExtras({ ...(mesh.getExtras()||{}), targetNames: ['jawOpen'] });
await io.write(out, d);
// the open mouth, painted along the lip line in texture space
const img = new Uint8ClampedArray(SIZE*SIZE*4); let px = 0;
for (let k=0;k<IDX.length;k+=3){ for (let q=0;q<3;q++){P.getElement(IDX[k+q],v[q]);UV.getElement(IDX[k+q],t[q]);}
  const fc=v.map(frame); if (fc.every(c=>Math.abs(c[0])>0.02||Math.abs(c[2])>HW*1.3||c[1]<-0.02)) continue;
  const xs=t.map(p=>p[0]*SIZE), ys=t.map(p=>p[1]*SIZE);
  const x0=Math.max(0,Math.floor(Math.min(...xs))), x1=Math.min(SIZE-1,Math.ceil(Math.max(...xs))), y0=Math.max(0,Math.floor(Math.min(...ys))), y1=Math.min(SIZE-1,Math.ceil(Math.max(...ys)));
  const den=(ys[1]-ys[2])*(xs[0]-xs[2])+(xs[2]-xs[1])*(ys[0]-ys[2]); if (Math.abs(den)<1e-9) continue;
  for (let y=y0;y<=y1;y++) for (let x=x0;x<=x1;x++){ const X=x+0.5,Y=y+0.5;
    const w0=((ys[1]-ys[2])*(X-xs[2])+(xs[2]-xs[1])*(Y-ys[2]))/den, w1=((ys[2]-ys[0])*(X-xs[2])+(xs[0]-xs[2])*(Y-ys[2]))/den, w2=1-w0-w1;
    if (w0<-0.02||w1<-0.02||w2<-0.02) continue;
    const a=w0*fc[0][0]+w1*fc[1][0]+w2*fc[2][0], c=w0*fc[0][2]+w1*fc[1][2]+w2*fc[2][2];
    const e=1-(c/(HW*0.92))**2; if (e<=0) continue; const half=HH*Math.sqrt(e); if (Math.abs(a)>half) continue;
    const edge=Math.min(1,(half-Math.abs(a))/(HH*0.35)); const o=(y*SIZE+x)*4;
    const teeth = (process.env.FLIP ? -a : a) > half*0.35 && Math.abs(c) < HW*0.65; const col = teeth ? [222,214,196] : [38,12,12];
    img[o]=col[0]; img[o+1]=col[1]; img[o+2]=col[2]; img[o+3]=Math.max(img[o+3],Math.round(255*edge)); px++; } }
await sharp(Buffer.from(img), { raw: { width: SIZE, height: SIZE, channels: 4 } }).png().toFile(png);
console.log('moved', moved, 'mouth px', px);
