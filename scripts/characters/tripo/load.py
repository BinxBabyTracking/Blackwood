import os, io, numpy as np, pygltflib as G
from PIL import Image
SRC=os.environ.get("SRC","/tmp/aldric/a.glb")
g=G.GLTF2().load_binary(SRC); blob=g.binary_blob()
def arr(i):
    a=g.accessors[i]; bv=g.bufferViews[a.bufferView]
    dt={5126:np.float32,5123:np.uint16,5125:np.uint32,5121:np.uint8}[a.componentType]
    n={"SCALAR":1,"VEC2":2,"VEC3":3,"VEC4":4,"MAT4":16}[a.type]
    return np.frombuffer(blob,dtype=dt,count=a.count*n,offset=bv.byteOffset+(a.byteOffset or 0)).reshape(a.count,n).copy()
def q2m(q):
    x,y,z,w=q
    return np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
local={}
for i,n in enumerate(g.nodes):
    M=np.eye(4)
    if n.matrix: M=np.array(n.matrix).reshape(4,4).T
    else: M[:3,:3]=q2m(n.rotation or [0,0,0,1])@np.diag(n.scale or [1,1,1]); M[:3,3]=n.translation or [0,0,0]
    local[i]=M
parent={c:i for i,n in enumerate(g.nodes) for c in (n.children or [])}
Wd={}
def W(i):
    if i not in Wd: Wd[i]=(W(parent[i]) if i in parent else np.eye(4))@local[i]
    return Wd[i]
skin=g.skins[0]; ibm=arr(skin.inverseBindMatrices).reshape(-1,4,4).transpose(0,2,1)
names=[g.nodes[j].name for j in skin.joints]; bi={n:k for k,n in enumerate(names)}
JM=np.array([W(j)@ibm[k] for k,j in enumerate(skin.joints)])
jpos={n:W(j)[:3,3] for n,j in zip(names,skin.joints)}
prim=g.meshes[0].primitives[0]
P=arr(prim.attributes.POSITION).astype(np.float64); N=arr(prim.attributes.NORMAL).astype(np.float64)
UV=arr(prim.attributes.TEXCOORD_0); Jn=arr(prim.attributes.JOINTS_0).astype(int); Wt=arr(prim.attributes.WEIGHTS_0).astype(np.float64)
F=arr(prim.indices).reshape(-1,3).astype(np.int64)
def skin_mats(Jn,Wt):
    return np.einsum("nk,nkij->nij",Wt,JM[Jn])
def world(P,Jn,Wt):
    S=skin_mats(Jn,Wt); return np.einsum("nij,nj->ni",S[:,:3,:3],P)+S[:,:3,3]
img=g.images[g.textures[g.materials[0].pbrMetallicRoughness.baseColorTexture.index].source]
bv=g.bufferViews[img.bufferView]; tex=Image.open(io.BytesIO(blob[bv.byteOffset:bv.byteOffset+bv.byteLength])).convert("RGB")
TA=np.asarray(tex)
def texcol(uv):
    h,w=TA.shape[:2]; x=np.clip((uv[:,0]*w).astype(int),0,w-1); y=np.clip((uv[:,1]*h).astype(int),0,h-1); return TA[y,x].astype(float)
