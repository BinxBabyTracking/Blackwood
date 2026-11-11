import sys, os, trimesh, pyrender
from PIL import ImageDraw
exec(open("/tmp/aldric_scripts/load.py").read())
def rot(ax,deg):
    ax=np.array(ax,float);ax/=np.linalg.norm(ax);a=np.radians(deg)
    K=np.array([[0,-ax[2],ax[1]],[ax[2],0,-ax[0]],[-ax[1],ax[0],0]]); return np.eye(3)+np.sin(a)*K+(1-np.cos(a))*K@K
OUT=sys.argv[1]
V=world(P,Jn,Wt); UVf=UV.copy(); UVf[:,1]=1-UVf[:,1]
hp=jpos["head"]; cy=hp[1]+0.07; half=0.13
ims=[]
for yaw in (0,90):
    sc=pyrender.Scene(bg_color=[235,240,245,255],ambient_light=[0.6,0.6,0.6])
    sc.add(pyrender.Mesh.from_trimesh(trimesh.Trimesh(V,F,visual=trimesh.visual.TextureVisuals(uv=UVf,image=tex),process=False),smooth=True))
    R=rot([0,1,0],yaw); cam=np.eye(4); cam[:3,:3]=R; cam[:3,3]=np.array([0,cy,0])+R@np.array([0,0,2.0])
    sc.add(pyrender.OrthographicCamera(xmag=half,ymag=half),pose=cam); sc.add(pyrender.DirectionalLight(intensity=2.5),pose=cam)
    r=pyrender.OffscreenRenderer(700,700); col,_=r.render(sc); r.delete()
    im=Image.fromarray(col); d=ImageDraw.Draw(im)
    for yy in np.arange(round(cy-half,2),cy+half,0.01):
        py=(cy+half-yy)/(2*half)*700; big=abs(yy*100-round(yy*100/5)*5)<1e-6
        d.line([(0,py),(25 if big else 10,py)],fill=(255,0,0)); 
        if big: d.text((28,py-6),"%.2f"%yy,fill=(255,0,0))
    for xx in np.arange(-0.12,0.13,0.01):
        px=(xx+half)/(2*half)*700; big=abs(xx*100-round(xx*100/5)*5)<1e-6
        d.line([(px,700),(px,690 if not big else 675)],fill=(0,0,255))
        if big: d.text((px-12,660),"%.2f"%(xx if yaw==0 else -xx),fill=(0,0,255))
    ims.append(im)
S=Image.new("RGB",(1400,700)); S.paste(ims[0],(0,0)); S.paste(ims[1],(700,0)); S.save(OUT)
print(os.path.basename(SRC), "head joint",np.round(hp,3))
