import sys
exec(open("/tmp/aldric_scripts/load.py").read())
OUT=sys.argv[1]
import json
PR=json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),"params.json")))[sys.argv[2]]
Y0=PR["Y0"]; HW=PR["hw"]; BEARD=PR["beard"]; ER=PR["r"]
def ss(a,b,x):
    t=np.clip((x-a)/(b-a),0,1); return t*t*(3-2*t)
def segdist(X,a,b):
    ab=b-a; t=np.clip(((X-a)@ab)/(ab@ab),0,1); return np.linalg.norm(X-(a+t[:,None]*ab),axis=1)
V=world(P,Jn,Wt)
col=texcol(UV)
key=np.round(V/1e-5).astype(np.int64); _,wid=np.unique(key,axis=0,return_inverse=True); wid=wid.ravel()
rep=np.zeros(wid.max()+1,int); rep[wid]=np.arange(len(V))
EDG=np.unique(np.sort(np.r_[F[:,[0,1]],F[:,[1,2]],F[:,[2,0]]],axis=1),axis=0)
# also link UV-seam twins so growth crosses seams
twin=np.c_[np.arange(len(V)),rep[wid]]; twin=twin[twin[:,0]!=twin[:,1]]
EDG=np.r_[EDG,twin]
moved=0
for s_ in ("lr" if PR.get("coat") else ""):
    arm=[k for k,n in enumerate(names) if n.endswith("_"+s_) and not n.startswith(("thigh","calf","foot","ball","clavicle"))]
    isarm=np.isin(Jn,arm)
    aw=(isarm*Wt).sum(1)
    segs=[(jpos[names[k]],jpos[g.nodes[c].name]) for k in arm for c in (g.nodes[skin.joints[k]].children or []) if g.nodes[c].name in bi]
    d=np.min([segdist(V,a_,b_) for a_,b_ in segs],axis=0)
    hy=jpos[f"hand_{s_}"][1]
    hand_dom=np.isin(Jn[np.arange(len(Jn)),Wt.argmax(1)],[bi[n] for n in names if n.endswith("_"+s_) and (n.startswith("hand") or any(f in n for f in ("thumb","index","middle","ring","pinky")))])
    handb=[bi[n] for n in names if n.endswith("_"+s_) and (n.startswith("hand") or any(f in n for f in ("thumb","index","middle","ring","pinky")))]
    hsegs=[(jpos[names[k]],jpos[g.nodes[c].name]) for k in handb for c in (g.nodes[skin.joints[k]].children or []) if g.nodes[c].name in bi]
    dh=np.min([segdist(V,a_,b_) for a_,b_ in hsegs],axis=0)
    sure=hand_dom&(dh<0.014)
    hc=col[sure][::max(1,sure.sum()//300)]
    cd=np.array([np.min(np.linalg.norm(hc-c_,axis=1)) for c_ in col]) if len(hc) else np.zeros(len(col))
    below=ss(hy+0.02,hy-0.005,V[:,1])
    clav=[bi[n] for n in names if n.startswith("clavicle")]
    body=((~isarm)&(~np.isin(Jn,clav))*1).astype(float)
    nonarm=(body*Wt).sum(1)
    low=ss(jpos[f"upperarm_{s_}"][1]-0.04,jpos[f"upperarm_{s_}"][1]-0.09,V[:,1])
    t=np.maximum.reduce([below*ss(0.035,0.05,d), below*ss(35,60,cd), ss(0.085,0.12,d), low*ss(0.03,0.08,nonarm)*ss(0.02,0.035,d)])*(aw>0)
    # grow over the mesh: an arm point mostly surrounded by moved coat points is coat too
    for _ in range(4):
        nb_t=np.zeros(len(V)); nb_n=np.zeros(len(V))
        for a_,b_ in EDG:
            nb_t[a_]+=t[b_]>0.5; nb_n[a_]+=1; nb_t[b_]+=t[a_]>0.5; nb_n[b_]+=1
        grow=(aw>0)&(t<0.5)&(nb_n>0)&(nb_t/np.maximum(nb_n,1)>=0.5)&(d>0.018)&(V[:,1]<jpos[f"upperarm_{s_}"][1]-0.04)
        if not grow.any(): break
        t=np.where(grow,1.0,t)
    for v in np.nonzero(t>0)[0]:
        tgt=bi["spine_01"] if V[v,1]<jpos["spine_03"][1]-0.06 else bi["spine_03"]
        take=Wt[v]*isarm[v]*t[v]; Wt[v]-=take; amt=take.sum()
        slots=list(Jn[v])
        if tgt in slots: Wt[v,slots.index(tgt)]+=amt
        else:
            k=int(np.argmin(Wt[v])); Wt[v,k]+=amt; Jn[v,k]=tgt
        moved+=1
Wt/=Wt.sum(1,keepdims=True)
# smooth the arm-weight edge so coats drape instead of tearing into strands
for s_ in ("lr" if PR.get("coat") else ""):
    arm=[k for k,n in enumerate(names) if n.endswith("_"+s_) and not n.startswith(("thigh","calf","foot","ball","clavicle"))]
    isarm=np.isin(Jn,arm)
    segs=[(jpos[names[k]],jpos[g.nodes[c].name]) for k in arm for c in (g.nodes[skin.joints[k]].children or []) if g.nodes[c].name in bi]
    d=np.min([segdist(V,a_,b_) for a_,b_ in segs],axis=0)
    M=(V[:,1]<jpos[f"upperarm_{s_}"][1]-0.04)&(d>0.022)
    A=(isarm*Wt).sum(1); A0=A.copy()
    ea,eb=EDG[:,0],EDG[:,1]
    for _ in range(10):
        sm=A.copy(); cnt=np.ones(len(A))
        np.add.at(sm,ea,A[eb]); np.add.at(cnt,ea,1); np.add.at(sm,eb,A[ea]); np.add.at(cnt,eb,1)
        A=np.where(M,np.minimum(A,sm/cnt),A)
    for v in np.nonzero(A<A0-1e-4)[0]:
        f=A[v]/A0[v] if A0[v]>0 else 0
        take=Wt[v]*isarm[v]*(1-f); Wt[v]-=take; amt=take.sum()
        tgt=bi["spine_01"] if V[v,1]<jpos["spine_03"][1]-0.06 else bi["spine_03"]
        slots=list(Jn[v])
        if tgt in slots: Wt[v,slots.index(tgt)]+=amt
        else:
            k=int(np.argmin(Wt[v])); Wt[v,k]+=amt; Jn[v,k]=tgt
Wt/=Wt.sum(1,keepdims=True)
print("coat verts moved off arms:",moved)
Vr=world(P,Jn,Wt)  # rest positions unchanged by reweight (bind pose)
print("rest drift",np.abs(Vr-V).max())
# ---- 2. split the lip so the mouth can open
headish=(np.isin(Jn,[bi["head"]])*Wt).sum(1)
cand=(np.abs(V[:,0])<0.015)&(V[:,1]>Y0-0.016)&(V[:,1]<Y0-0.004)&(V[:,2]>jpos['head'][2]+0.04)
LIPZ=float(np.median(V[cand,2])) if cand.sum() else float(V[(np.abs(V[:,0])<0.02)&(np.abs(V[:,1]-Y0)<0.01)&(V[:,2]>0),2].max())
print("LIPZ",round(LIPZ,4),"cands",cand.sum())
front=V[:,2]>LIPZ-0.08
cent=V[F].mean(1)
lowtri=(cent[:,1]<Y0)
zone=lambda X:(np.abs(X[:,0])<HW+0.015)&(np.abs(X[:,1]-Y0)<0.014)&(X[:,2]>LIPZ-0.035)
upv=np.zeros(len(P),bool); upv[F[~lowtri].ravel()]=True
lov=np.zeros(len(P),bool); lov[F[lowtri].ravel()]=True
K=PR.get("k",0.0)
def curve(X): return Y0+K*X[:,0]**2
reg=lambda X:(np.abs(X[:,0])<HW+0.004)&(X[:,2]>LIPZ-0.035)&(np.abs(X[:,1]-curve(X))<0.03)
sv=V[:,1]-curve(V)
P_,N_,UV_,J_,W_,V_=[list(A) for A in (P,N,UV,Jn,Wt,V)]
lower=[False]*len(P)   # vertex is a lower-lip copy / below the cut inside the region
cutv=[False]*len(P)
inreg=reg(V)
for v in np.nonzero(inreg&(sv<=0))[0]: lower[v]=True
cache={}
def cross(i,j):
    key=(min(i,j),max(i,j))
    if key in cache: return cache[key]
    t=sv[i]/(sv[i]-sv[j]); src=i if t<0.5 else j
    out=[]
    for side in ("up","low"):
        P_.append(P[i]+(P[j]-P[i])*t); n=N[i]+(N[j]-N[i])*t; N_.append(n/max(np.linalg.norm(n),1e-9))
        UV_.append(UV[i]+(UV[j]-UV[i])*t); J_.append(Jn[src].copy()); W_.append(Wt[src].copy()); V_.append(V[i]+(V[j]-V[i])*t)
        lower.append(side=="low"); cutv.append(True); out.append(len(P_)-1)
    cache[key]=tuple(out); return cache[key]
F2=[]
cent=V[F].mean(1); treg=reg(cent)&inreg[F].all(1)&((V[F][:,:,2].max(1)<LIPZ+0.008) if PR.get('mustache') else True)
nsplit=0
for ti,(i0,i1,i2) in enumerate(F):
    tri=[i0,i1,i2]; up=[sv[i]>0 for i in tri]
    if not treg[ti] or all(up) or not any(up):
        F2.append(tri); continue
    nsplit+=1
    alone=[k for k in range(3) if up.count(up[k])==1][0]
    a_,b_,c_=tri[alone],tri[(alone+1)%3],tri[(alone+2)%3]
    ab=cross(a_,b_); ac=cross(a_,c_)
    sa=0 if up[alone] else 1; so=1-sa   # index into (up,low) copies
    F2.append([a_,ab[sa],ac[sa]]); F2.append([ab[so],b_,c_]); F2.append([ab[so],c_,ac[so]])
F2=np.array(F2)
print("cut triangles",nsplit,"new verts",len(P_)-len(P))
P2,N2,UV2,J2,W2,V2=[np.array(A) for A in (P_,N_,UV_,J_,W_,V_)]
lowlip=np.array(lower); iscut=np.array(cutv)
nN=len(P2)-len(P)
def ext(A):
    extra=np.array([A[0]]*nN) if nN else A[:0]
    out=np.concatenate([A,extra]); return out
hd2=np.concatenate([headish,np.ones(nN)]); col2=np.concatenate([col,np.array([[200,120,120]]*nN) if nN else col[:0]])
isdup=iscut&lowlip
bright=(col2.mean(1)>150)&(col2.max(1)-col2.min(1)<45)
bright[len(P):]=False  # beard / mustache hair
x,y,z=V2[:,0],V2[:,1],V2[:,2]
ax=np.abs(x)
# jaw weight: below the lip line, front half, head-ish or beard
yramp=ss(curve(V2)-0.02, curve(V2)-0.035-0.25*np.maximum(0,ax-HW*0.8), y)
side=1-ss(0.10,0.17,ax)
hz=jpos['head'][2]
mask=np.clip(np.maximum(hd2,bright*1.0*BEARD),0,1)*ss(hz-0.02,hz+0.04,z)
jaw=yramp*side*mask
cutlat=1-ss(HW*0.75,HW+0.006,ax)
jaw=np.where(lowlip,np.maximum(jaw*0+cutlat*mask.clip(0.999,1),cutlat),jaw)
jaw[reg(V2)&(~lowlip)]=0
if PR.get('mustache'): jaw*=1-ss(LIPZ+0.002,LIPZ+0.008,z)*ss(Y0-0.045,Y0-0.03,y)
# keep coat out
pivot=np.array([0.0,Y0+0.033,jpos['head'][2]])
def jawrot(deg):
    a=np.radians(deg)*jaw
    dy=V2[:,1]-pivot[1]; dz=V2[:,2]-pivot[2]
    ny=pivot[1]+dy*np.cos(a)-dz*np.sin(a)*-1*-1
    # rotate about +x so the chin drops (front moves down)
    ny=pivot[1]+dy*np.cos(a)-dz*np.sin(a)
    nz=pivot[2]+dy*np.sin(a)+dz*np.cos(a)
    D=np.zeros_like(V2); D[:,1]=ny-V2[:,1]; D[:,2]=nz-V2[:,2]; return D
mouthzone=ss(HW*2.4,HW*0.5,np.hypot(x,(y-Y0)*1.6))*ss(LIPZ-0.09,LIPZ-0.02,z)
must=bright*BEARD*ss(HW+0.10,HW+0.07,ax)*ss(Y0+0.023,Y0+0.01,y)*ss(Y0-0.012,Y0-0.002,y)*ss(LIPZ-0.06,LIPZ-0.01,z)*(~isdup)
def squeeze(k):  # pull the mouth area toward the middle
    D=np.zeros_like(V2); D[:,0]=-x*(1-k)*mouthzone; return D
def widen(k):
    D=np.zeros_like(V2); D[:,0]=x*(k-1)*(mouthzone*0.6+must); return D
def pucker(dz):
    D=np.zeros_like(V2); D[:,2]=dz*mouthzone; return D
def smile_d():
    D=np.zeros_like(V2)
    c=ss(HW*0.4,HW+0.02,ax)*ss(HW+0.09,HW+0.05,ax)*ss(Y0-0.035,Y0-0.01,y)*ss(Y0+0.055,Y0+0.03,y)*ss(LIPZ-0.07,LIPZ-0.03,z)
    D[:,1]=0.012*c; D[:,0]=np.sign(x)*0.006*c; return D
EYES=[np.array(e) for e in PR['eyes']]
def blink_d():
    D=np.zeros_like(V2)
    for e in EYES:
        r=np.hypot(x-e[0],(y-e[1])*0.9)
        near=(r<ER*0.5)&(z>jpos['head'][2]+0.04)
        ez=float(np.percentile(z[near],25)) if near.sum() else LIPZ
        f=ss(ER*PR.get('bo',1.35),ER*PR.get('bi',0.75),r)*ss(ez+0.010,ez+0.004,z)*ss(ez-PR.get('ezd',0.03),ez-PR.get('ezd',0.03)/2,z)
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
skinv=(~(bright[:len(V)]&BEARD))&(V[:,2]>LIPZ-0.05)&(np.abs(V[:,1]-Y0)<0.05)&(np.abs(V[:,0])<HW+0.03)
SV=V[skinv]
pts=[]
for t in th:
    for p_ in ph:
        cs,sn=np.cos(p_),np.sin(p_); px=np.sin(t*np.pi/2)*np.sign(cs)*abs(cs)**0.5*(HW+0.02); py=Y0+K*px*px-0.008+np.sin(t*np.pi/2)*np.sign(sn)*abs(sn)**0.5*0.013
        d=np.hypot(SV[:,0]-px,SV[:,1]-py); near=SV[d<0.008]
        zs=(near[:,2].min() if len(near) else LIPZ-0.01)-0.012
        pts.append([px,py,zs-np.cos(t*np.pi/2)*0.03])
pts=np.array(pts)
tri=[]
for i in range(lat-1):
    for j in range(lon):
        a=i*lon+j; b=i*lon+(j+1)%lon; c=a+lon; d=b+lon; tri+= [[a,c,b],[b,c,d]]
tri=np.array(tri)
mn=np.zeros_like(pts); mn[:,2]=1
# the cup's lower half follows the jaw a bit
mj=ss(Y0+K*pts[:,0]**2-0.002,Y0+K*pts[:,0]**2-0.012,pts[:,1])
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
g.meshes[0].weights=[0.0]*len(names_t); g.meshes[0].extras={"targetNames":names_t}; g.meshes[0].name=sys.argv[2].capitalize()
g.materials.append(G.Material(name="mouth_inside",pbrMetallicRoughness=G.PbrMetallicRoughness(baseColorFactor=[1,1,1,1],metallicFactor=0,roughnessFactor=0.9)))
mp=G.Primitive(attributes=G.Attributes(POSITION=add(mP.astype(np.float32),AB,True),NORMAL=add(mn.astype(np.float32),AB),COLOR_0=add(mcol,AB),
    JOINTS_0=add(np.tile([bi["head"],0,0,0],(len(pts),1)).astype(np.uint16),AB),WEIGHTS_0=add(np.tile([1,0,0,0],(len(pts),1)).astype(np.float32),AB)),
    indices=add(tri.astype(np.uint32).reshape(-1),EB),material=len(g.materials)-1,targets=[{"POSITION":add(mT[k],AB,True)} for k in names_t])
g.meshes.append(G.Mesh(name="MouthInside",primitives=[mp],weights=[0.0]*len(names_t),extras={"targetNames":names_t}))
mesh_node=[i for i,n in enumerate(g.nodes) if n.mesh==0][0]
g.nodes.append(G.Node(name="MouthInside",mesh=len(g.meshes)-1,skin=0))
g.nodes[parent[mesh_node]].children.append(len(g.nodes)-1)
g.nodes[mesh_node].name=sys.argv[2].capitalize()
while len(out)%4: out+=b"\0"
g.buffers[0].byteLength=len(out); g.set_binary_blob(bytes(out))
g.asset.generator="Tripo + Blackwood face pass"
g.save_binary(OUT); print("wrote",OUT,os.path.getsize(OUT))
