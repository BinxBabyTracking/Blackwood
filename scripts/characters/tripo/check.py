import sys, trimesh, pyrender
exec(open(__import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)),"load.py")).read())
def rot(ax,deg):
    ax=np.array(ax,float);ax/=np.linalg.norm(ax);a=np.radians(deg)
    K=np.array([[0,-ax[2],ax[1]],[ax[2],0,-ax[0]],[-ax[1],ax[0],0]]); return np.eye(3)+np.sin(a)*K+(1-np.cos(a))*K@K
UVf=UV.copy(); UVf[:,1]=1-UVf[:,1]
m2=g.meshes[1].primitives[0]
mP=arr(m2.attributes.POSITION).astype(float); mF=arr(m2.indices).reshape(-1,3); mJ=arr(m2.attributes.JOINTS_0).astype(int); mW=arr(m2.attributes.WEIGHTS_0).astype(float)
tn=g.meshes[0].extras["targetNames"]
def posed_JM(delta):
    Wd2={}
    def f(i):
        if i in Wd2: return Wd2[i]
        Pm=f(parent[i]) if i in parent else np.eye(4); M=Pm@local[i]; nm=g.nodes[i].name
        if nm in delta:
            p=M[:3,3].copy(); D=np.eye(4); D[:3,:3]=delta[nm]; T=np.eye(4);T[:3,3]=p; Ti=np.eye(4);Ti[:3,3]=-p; M=T@D@Ti@M
        Wd2[i]=M; return M
    return np.array([f(j)@ibm[k] for k,j in enumerate(skin.joints)])
def sk(Pm,Jn_,Wt_,JMx):
    S=np.einsum("nk,nkij->nij",Wt_,JMx[Jn_]); return np.einsum("nij,nj->ni",S[:,:3,:3],Pm)+S[:,:3,3]
def build(shape=None,amt=1.0,delta={}):
    JMx=posed_JM(delta)
    A=P.copy(); B=mP.copy()
    if shape:
        k=tn.index(shape); A=A+amt*arr(prim.targets[k]["POSITION"]); B=B+amt*arr(m2.targets[k]["POSITION"])
    return sk(A,Jn,Wt,JMx), sk(B,mJ,mW,JMx)
def shot(VV,name,cy=None,half=None,yaw=0,size=(600,800)):
    V,MV=VV
    sc=pyrender.Scene(bg_color=[235,240,245,255],ambient_light=[0.6,0.6,0.6])
    sc.add(pyrender.Mesh.from_trimesh(trimesh.Trimesh(V,F,visual=trimesh.visual.TextureVisuals(uv=UVf,image=tex),process=False),smooth=True))
    sc.add(pyrender.Mesh.from_trimesh(trimesh.Trimesh(MV,mF,face_colors=[45,8,10,255],process=False),smooth=False))
    R=rot([0,1,0],yaw)
    if half:
        cam=np.eye(4); cam[:3,:3]=R; cam[:3,3]=np.array([0,cy,0])+R@np.array([0,0,2.0]); c=pyrender.OrthographicCamera(xmag=half,ymag=half); size=(500,500)
    else:
        cam=np.eye(4); cam[:3,:3]=R; cam[:3,3]=np.array([0,0.49,0])+R@np.array([0,0,1.9]); c=pyrender.PerspectiveCamera(yfov=np.radians(35))
    sc.add(c,pose=cam); sc.add(pyrender.DirectionalLight(intensity=2.6),pose=cam)
    r=pyrender.OffscreenRenderer(*size); col,_=r.render(sc); r.delete()
    Image.fromarray(col).save(f"/tmp/aldric/{name}.png")
def sheet(names_,out,w):
    ims=[Image.open(f"/tmp/aldric/{n}.png") for n in names_]
    S_=Image.new("RGB",(sum(i.width for i in ims),ims[0].height),"white"); x=0
    for i in ims: S_.paste(i,(x,0)); x+=i.width
    S_.resize((w,int(w*S_.height/S_.width))).save(out)
mode=sys.argv[1]
if mode=="face":
    L=["rest","mouth_ah","mouth_ee","mouth_oh","mouth_oo","smile","blink"]
    for s in L: shot(build(None if s=="rest" else s),"f_"+s,cy=0.61,half=0.085)
    shot(build("mouth_ah"),"f_ah_side",cy=0.61,half=0.085,yaw=60)
    sheet(["f_"+s for s in L[:4]],"/tmp/aldric/faces1.png",1400); sheet(["f_"+s for s in L[4:]]+["f_ah_side"],"/tmp/aldric/faces2.png",1400)
else:
    X,Y,Z=[1,0,0],[0,1,0],[0,0,1]
    shot(build(delta={"upperarm_l":rot(Z,110),"upperarm_r":rot(Z,-110),"thigh_l":rot(X,-60),"calf_l":rot(X,90)}),"c_wave")
    shot(build(delta={"upperarm_l":rot(X,-150),"upperarm_r":rot(X,-150)}),"c_up_side",yaw=90)
    shot(build("mouth_ah",delta={"upperarm_l":rot(Z,60),"upperarm_r":rot(Z,-60),"head":rot(Y,25)}),"c_talk",yaw=20)
    sheet(["c_wave","c_up_side","c_talk"],"/tmp/aldric/coat.png",1200)
