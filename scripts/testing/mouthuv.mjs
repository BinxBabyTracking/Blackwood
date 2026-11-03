// Prints the texture point at the front centre of the face, a little below the nose, as a starting guess for the lips.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const d = await io.read(process.argv[2]);
const skin = d.getRoot().listSkins()[0]; const joints = skin.listJoints(); const ibm = skin.getInverseBindMatrices().getArray();
const jp = (name) => { const k = joints.findIndex(j => j.getName() === name); const a = ibm.slice(k*16, k*16+16);
  const r=[a[0],a[1],a[2],a[4],a[5],a[6],a[8],a[9],a[10]];
  const det=r[0]*(r[4]*r[8]-r[5]*r[7])-r[3]*(r[1]*r[8]-r[2]*r[7])+r[6]*(r[1]*r[5]-r[2]*r[4]);
  const i=[(r[4]*r[8]-r[5]*r[7])/det,(r[2]*r[7]-r[1]*r[8])/det,(r[1]*r[5]-r[2]*r[4])/det,(r[5]*r[6]-r[3]*r[8])/det,(r[0]*r[8]-r[2]*r[6])/det,(r[2]*r[3]-r[0]*r[5])/det,(r[3]*r[7]-r[4]*r[6])/det,(r[1]*r[6]-r[0]*r[7])/det,(r[0]*r[4]-r[1]*r[3])/det];
  return [-(i[0]*a[12]+i[3]*a[13]+i[6]*a[14]),-(i[1]*a[12]+i[4]*a[13]+i[7]*a[14]),-(i[2]*a[12]+i[5]*a[13]+i[8]*a[14])]; };
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]], dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2], nrm=(a)=>{const l=Math.hypot(...a);return a.map(x=>x/l)};
const H = jp('Head'), up = nrm(sub(jp('head_end'), H)); let f = sub(jp('headfront'), H); f = nrm(sub(f, up.map(x=>x*dot(f,up))));
const s=[up[1]*f[2]-up[2]*f[1], up[2]*f[0]-up[0]*f[2], up[0]*f[1]-up[1]*f[0]];
const prim = d.getRoot().listMeshes()[0].listPrimitives()[0];
const P = prim.getAttribute('POSITION'), UV = prim.getAttribute('TEXCOORD_0');
const v=[0,0,0], t=[0,0]; const pts=[];
for (let i=0;i<P.getCount();i++){ P.getElement(i,v); const r=sub(v,H); const a=dot(r,up), b=dot(r,f), c=dot(r,s); if (Math.abs(c)<0.012 && a>-0.04 && a<0.06 && b>0.03) { UV.getElement(i,t); pts.push([a,b,t[0],t[1]]); } }
pts.sort((p,q)=>p[0]-q[0]);
// the nose is the most forward point; the mouth is the forward bump below it
const nose = pts.reduce((m,p)=>p[1]>m[1]?p:m);
const below = pts.filter(p=>p[0]<nose[0]-0.015 && p[0]>nose[0]-0.05);
const mouth = below.reduce((m,p)=>p[1]>m[1]?p:m, below[0]);
console.log(JSON.stringify({ nose: nose.slice(2), mouth: mouth.slice(2), am: mouth[0] }));
