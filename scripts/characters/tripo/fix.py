import sys
exec(open(__import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)),"load.py")).read())
OUT=sys.argv[1]
def ss(a,b,x):
    t=np.clip((x-a)/(b-a),0,1); return t*t*(3-2*t)
def segdist(X,a,b):
    ab=b-a; t=np.clip(((X-a)@ab)/(ab@ab),0,1); return np.linalg.norm(X-(a+t[:,None]*ab),axis=1)
V=world(P,Jn,Wt)
col=texcol(UV); green=(col[:,1]>col[:,0]*1.08)&(col[:,1]>=col[:,2])
# ---- 1. coat off the arms
moved=0
for s in "lr":
    arm=[k for k,n in enumerate(names) if n.endswith("_"+s) and not n.startswith(("thigh","calf","foot","ball","clavicle"))]
    isarm=np.isin(Jn,arm)
    aw=(isarm*Wt).sum(1)
    d=np.minimum(segdist(V,jpos[f"upperarm_{s}"],jpos[f"lowerarm_{s}"]),segdist(V,jpos[f"lowerarm_{s}"],jpos[f"hand_{s}"]))
    dh=segdist(V,jpos[f'hand_{s}'],jpos[f'hand_{s}']+np.array([0,-0.06,0.02]))
    t=np.maximum(ss(0.31,0.27,V[:,1])*ss(0.055,0.07,np.minimum(d,dh)),ss(0.095,0.13,d))*green*(aw>0)
    for v in np.nonzero(t>0)[0]:
        tgt=bi["spine_01"] if V[v,1]<0.36 else bi["spine_03"]
        take=Wt[v]*isarm[v]*t[v]; Wt[v]-=take; amt=take.sum()
        slots=list(Jn[v])
        if tgt in slots: Wt[v,slots.index(tgt)]+=amt
        else:
            k=int(np.argmin(Wt[v])); Wt[v,k]+=amt if Wt[v,k]==0 else 0
            if Jn[v,k]!=tgt:
                # replace the smallest slot, folding its weight into the target
                Wt[v,k]=Wt[v,k]+amt; Jn[v,k]=tgt
        moved+=1
Wt/=Wt.sum(1,keepdims=True)
print("coat verts moved off arms:",moved)
Vr=world(P,Jn,Wt)  # rest positions unchanged by reweight (bind pose)
print("rest drift",np.abs(Vr-V).max())
# ---- 2. split the lip so the mouth can open
Y0=0.5825; LIPZ=0.142
headish=(np.isin(Jn,[bi["head"],bi["neck_02"],bi["neck_01"]])*Wt).sum(1)
front=V[:,2]>0.06
cent=V[F].mean(1)
lowtri=(cent[:,1]<Y0)
zone=lambda X:(np.abs(X[:,0])<0.05)&(np.abs(X[:,1]-Y0)<0.014)&(X[:,2]>0.11)
upv=np.zeros(len(P),bool); upv[F[~lowtri].ravel()]=True
lov=np.zeros(len(P),bool); lov[F[lowtri].ravel()]=True
seam=np.nonzero(upv&lov&zone(V))[0]
print("seam verts",len(seam))
dup={int(v):len(P)+i for i,v in enumerate(seam)}
F2=F.copy()
for ti in np.nonzero(lowtri&zone(cent))[0]:
    F2[ti]=[dup.get(int(v),int(v)) for v in F2[ti]]
def ext(A): return np.concatenate([A,A[seam]])
P2,N2,UV2,J2,W2,V2=map(ext,(P,N,UV,Jn,Wt,V))
isdup=np.zeros(len(P2),bool); isdup[len(P):]=True
hd2=ext(headish); fr2=ext(front); col2=ext(col)
bright=(col2.mean(1)>150)&(col2.max(1)-col2.min(1)<45)  # beard / mustache hair
x,y,z=V2[:,0],V2[:,1],V2[:,2]
ax=np.abs(x)
# jaw weight: below the lip line, front half, head-ish or beard
yramp=ss(Y0, Y0-0.012-0.25*np.maximum(0,ax-0.025), y)
yramp=np.where(isdup,1.0,yramp)
side=1-ss(0.10,0.17,ax)
mask=np.clip(np.maximum(hd2,bright*1.0),0,1)*ss(-0.02,0.04,z)
jaw=yramp*side*mask
cutlat=1-ss(0.022,0.048,ax)
lowlip=(isdup|(zone(V2)&(y<Y0)))
jaw=np.where(lowlip,np.maximum(jaw,cutlat),jaw)
jaw[(~isdup)&zone(V2)&(y>=Y0-0.0015)]=0
# keep coat out
jaw*= ~(ext(green))
pivot=np.array([0.0,0.615,0.0])
def jawrot(deg):
    a=np.radians(deg)*jaw
    dy=V2[:,1]-pivot[1]; dz=V2[:,2]-pivot[2]
    ny=pivot[1]+dy*np.cos(a)-dz*np.sin(a)*-1*-1
    # rotate about +x so the chin drops (front moves down)
    ny=pivot[1]+dy*np.cos(a)-dz*np.sin(a)
    nz=pivot[2]+dy*np.sin(a)+dz*np.cos(a)
    D=np.zeros_like(V2); D[:,1]=ny-V2[:,1]; D[:,2]=nz-V2[:,2]; return D
mouthzone=ss(0.10,0.02,np.hypot(x/1.0,(y-Y0)*1.6))*ss(0.05,0.12,z)
must=bright*ss(0.13,0.10,ax)*ss(0.605,0.592,y)*ss(0.570,0.580,y)*ss(0.08,0.13,z)*(~isdup)
def squeeze(k):  # pull the mouth area toward the middle
    D=np.zeros_like(V2); D[:,0]=-x*(1-k)*mouthzone; return D
def widen(k):
    D=np.zeros_like(V2); D[:,0]=x*(k-1)*(mouthzone*0.6+must); return D
def pucker(dz):
    D=np.zeros_like(V2); D[:,2]=dz*mouthzone; return D
def smile_d():
    D=np.zeros_like(V2)
    c=ss(0.02,0.07,ax)*ss(0.14,0.10,ax)*ss(0.55,0.575,y)*ss(0.64,0.61,y)*ss(0.08,0.13,z)
    D[:,1]=0.012*c; D[:,0]=np.sign(x)*0.006*c; return D
EYES=[np.array([-0.045,0.665]),np.array([0.045,0.665])]
def blink_d():
    D=np.zeros_like(V2)
    for e in EYES:
        r=np.hypot(x-e[0],(y-e[1])*0.9)
        gold=(col2[:,0]>col2[:,2]+45)&(col2[:,1]>col2[:,2]+25)&(col2[:,0]-col2[:,1]<60)
        f=ss(0.032,0.018,r)*ss(0.135,0.128,z)*ss(0.09,0.105,z)*(~bright)*(~gold)
        D[:,1]+=(e[1]-0.004-y)*0.92*f
    return D
SH={
 "mouth_slight":jawrot(4),
 "mouth_ah":jawrot(13),
 "mouth_ee":jawrot(5)+widen(1.10),
 "mouth_oh":jawrot(10)+squeeze(0.85)+pucker(0.004),
 "mouth_oo":jawrot(5)+squeeze(0.75)+pucker(0.008),
 "mouth_f":jawrot(2),
 "mouth_closed":np.zeros_like(V2),
 "smile":smile_d(),
 "blink":blink_d(),
 "jawOpen":jawrot(13),
}
# world deltas -> mesh space (inverse of each vertex's rest skin rotation)
S=skin_mats(J2,W2)[:,:3,:3]; Si=np.linalg.inv(S)
targets={k:np.einsum("nij,nj->ni",Si,D).astype(np.float32) for k,D in SH.items()}
for k,D in targets.items(): print(k,"moving verts",(np.abs(D).max(1)>1e-5).sum(),"max %.4f"%np.abs(D).max())
# ---- 3. inner mouth: a dark cup behind the lips, on the head bone
lat,lon=12,28
th=np.linspace(0,1,lat); ph=np.linspace(0,2*np.pi,lon,endpoint=False)
skinv=(~ext(bright))[:len(V)]&(V[:,2]>0.09)&(np.abs(V[:,1]-Y0)<0.05)&(np.abs(V[:,0])<0.07)
SV=V[skinv]
pts=[]
for t in th:
    for p_ in ph:
        px=np.sin(t*np.pi/2)*np.cos(p_)*0.048; py=Y0-0.010+np.sin(t*np.pi/2)*np.sin(p_)*0.024
        d=np.hypot(SV[:,0]-px,SV[:,1]-py); near=SV[d<0.006]
        zs=(near[:,2].max() if len(near) else LIPZ-0.01)-0.010
        pts.append([px,py,zs-np.cos(t*np.pi/2)*0.018])
pts=np.array(pts)
tri=[]
for i in range(lat-1):
    for j in range(lon):
        a=i*lon+j; b=i*lon+(j+1)%lon; c=a+lon; d=b+lon; tri+= [[a,c,b],[b,c,d]]
tri=np.array(tri)
mn=np.zeros_like(pts); mn[:,2]=1
# the cup's lower half follows the jaw a bit
mj=ss(Y0-0.002,Y0-0.016,pts[:,1])
def mjaw(deg):
    a=np.radians(deg)*mj; dy=pts[:,1]-pivot[1]; dz=pts[:,2]-pivot[2]
    D=np.zeros_like(pts); D[:,1]=pivot[1]+dy*np.cos(a)-dz*np.sin(a)-pts[:,1]; D[:,2]=pivot[2]+dy*np.sin(a)+dz*np.cos(a)-pts[:,2]; return D
deg={"mouth_slight":4,"mouth_ah":13,"mouth_ee":5,"mouth_oh":10,"mouth_oo":5,"mouth_f":2,"jawOpen":13}
Hm=JM[bi["head"]]; Hi=np.linalg.inv(Hm)
mP=(Hi[:3,:3]@pts.T).T+Hi[:3,3]
mT={k:((Hi[:3,:3]@mjaw(deg.get(k,0)).T).T).astype(np.float32) for k in SH}
mcol=np.tile([0.16,0.03,0.04,1.0],(len(pts),1)).astype(np.float32)
# ---- write
out=bytearray(blob)
def add(a,target=None,mm=False):
    global out
    while len(out)%4: out+=b"\0"
    raw=np.ascontiguousarray(a).tobytes(); off=len(out); out+=raw
    g.bufferViews.append(G.BufferView(buffer=0,byteOffset=off,byteLength=len(raw),target=target)); bvi=len(g.bufferViews)-1
    ct={np.float32:5126,np.uint16:5123,np.uint32:5125}[a.dtype.type]
    tp={1:"SCALAR",2:"VEC2",3:"VEC3",4:"VEC4"}[a.shape[1] if a.ndim>1 else 1]
    acc=G.Accessor(bufferView=bvi,componentType=ct,count=a.shape[0],type=tp)
    if mm: acc.min=a.min(0).tolist(); acc.max=a.max(0).tolist()
    g.accessors.append(acc); return len(g.accessors)-1
AB,EB=34962,34963
names_t=list(SH)
J2[W2<=0]=0
p=prim
p.attributes.POSITION=add(P2.astype(np.float32),AB,True)
p.attributes.NORMAL=add(N2.astype(np.float32),AB)
p.attributes.TEXCOORD_0=add(UV2.astype(np.float32),AB)
p.attributes.JOINTS_0=add(J2.astype(np.uint16),AB)
p.attributes.WEIGHTS_0=add(W2.astype(np.float32),AB)
p.indices=add(F2.astype(np.uint32).reshape(-1),EB)
p.targets=[{"POSITION":add(targets[k],AB,True)} for k in names_t]
g.meshes[0].weights=[0.0]*len(names_t); g.meshes[0].extras={"targetNames":names_t}; g.meshes[0].name="Aldric"
g.materials.append(G.Material(name="mouth_inside",pbrMetallicRoughness=G.PbrMetallicRoughness(baseColorFactor=[1,1,1,1],metallicFactor=0,roughnessFactor=0.9)))
mp=G.Primitive(attributes=G.Attributes(POSITION=add(mP.astype(np.float32),AB,True),NORMAL=add(mn.astype(np.float32),AB),COLOR_0=add(mcol,AB),
    JOINTS_0=add(np.tile([bi["head"],0,0,0],(len(pts),1)).astype(np.uint16),AB),WEIGHTS_0=add(np.tile([1,0,0,0],(len(pts),1)).astype(np.float32),AB)),
    indices=add(tri.astype(np.uint32).reshape(-1),EB),material=len(g.materials)-1,targets=[{"POSITION":add(mT[k],AB,True)} for k in names_t])
g.meshes.append(G.Mesh(name="MouthInside",primitives=[mp],weights=[0.0]*len(names_t),extras={"targetNames":names_t}))
mesh_node=[i for i,n in enumerate(g.nodes) if n.mesh==0][0]
g.nodes.append(G.Node(name="MouthInside",mesh=len(g.meshes)-1,skin=0))
g.nodes[parent[mesh_node]].children.append(len(g.nodes)-1)
g.nodes[mesh_node].name="Aldric"
while len(out)%4: out+=b"\0"
g.buffers[0].byteLength=len(out); g.set_binary_blob(bytes(out))
g.asset.generator="Tripo + Blackwood face pass"
g.save_binary(OUT); print("wrote",OUT,os.path.getsize(OUT))
