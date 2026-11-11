import sys
SRC_OUT=sys.argv[1]
exec(open("/tmp/aldric_scripts/load.py").read())
# check that the inverse binds match the rest pose
k0=0; print("bind check", np.abs(np.linalg.inv(W(skin.joints[k0]))-ibm[k0]).max())
out=bytearray(blob)
def add(a):
    global out
    while len(out)%4: out+=b"\0"
    raw=np.ascontiguousarray(a).tobytes(); off=len(out); out+=raw
    g.bufferViews.append(G.BufferView(buffer=0,byteOffset=off,byteLength=len(raw))); 
    ct={np.float32:5126,np.uint16:5123,np.uint8:5121}[a.dtype.type]
    tp={1:"SCALAR",2:"VEC2",3:"VEC3",4:"VEC4",16:"MAT4"}[a.shape[1]]
    g.accessors.append(G.Accessor(bufferView=len(g.bufferViews)-1,componentType=ct,count=a.shape[0],type=tp)); return len(g.accessors)-1
V=world(P,Jn,Wt)
ibm_list=list(ibm)
for s in "lr":
    lo=[i for i,n in enumerate(g.nodes) if n.name==f"lowerarm_{s}"][0]
    hi=[i for i,n in enumerate(g.nodes) if n.name==f"hand_{s}"][0]
    LW=W(lo); HW_=W(hi); hp=HW_[:3,3]
    klo=skin.joints.index(lo); skin.joints.append(hi); ibm_list.append(np.linalg.inv(HW_)@LW@ibm[klo]); bi[f"hand_{s}"]=len(skin.joints)-1
    # forearm weight past the wrist goes to the hand
    fore=[bi[n] for n in (f"lowerarm_{s}",f"lowerarm_twist_01_{s}",f"lowerarm_twist_02_{s}") if n in bi]
    axis=(hp-LW[:3,3]); L=np.linalg.norm(axis); axis/=L
    tpar=((V-hp)@axis)
    f=np.clip(tpar/0.015+0.5,0,1)   # blend over the wrist
    for v in np.nonzero(f>0)[0]:
        for k in range(4):
            if Jn[v,k] in fore and Wt[v,k]>0:
                Jn[v,k]=bi[f"hand_{s}"] if f[v]>=0.999 else Jn[v,k]
                if f[v]<0.999:
                    # split: move fraction f to hand via the smallest free slot
                    amt=Wt[v,k]*f[v]; Wt[v,k]-=amt
                    z=int(np.argmin(Wt[v])); 
                    if Wt[v,z]<amt: Wt[v,z]=amt; Jn[v,z]=bi[f"hand_{s}"]
    print(s,"hand at",np.round(hp,3),"verts to hand",(f>=0.999).sum())
Wt/=Wt.sum(1,keepdims=True)
prim.attributes.JOINTS_0=add(Jn.astype(np.uint16)); prim.attributes.WEIGHTS_0=add(Wt.astype(np.float32))
skin.inverseBindMatrices=add(np.array([m.T.reshape(16) for m in ibm_list],dtype=np.float32))
while len(out)%4: out+=b"\0"
g.buffers[0].byteLength=len(out); g.set_binary_blob(bytes(out)); g.save_binary(SRC_OUT); print("ok")
