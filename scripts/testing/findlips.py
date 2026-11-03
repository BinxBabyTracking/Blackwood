import sys, json
from PIL import Image
import numpy as np
from scipy import ndimage
im=np.array(Image.open(sys.argv[1]).convert('RGB')).astype(float); S=im.shape[0]
cx,cy=int(float(sys.argv[2])*S),int(float(sys.argv[3])*S); R=int(0.035*S)
w=im[cy-R:cy+R,cx-R:cx+R]; r,g,b=w[...,0],w[...,1],w[...,2]
lip=(r-g>float(sys.argv[4]) if len(sys.argv)>4 else r-g>88)&(g<r*0.6)
lip=ndimage.binary_opening(lip,iterations=4)
lab,n=ndimage.label(lip); sizes=ndimage.sum(lip,lab,range(1,n+1))
# lip component nearest the centre among the larger ones
best=None
for i in range(n):
    if sizes[i]<40: continue
    ys,xs=np.where(lab==i+1); d=np.hypot(ys.mean()-R,xs.mean()-R)
    if best is None or d<best[0]: best=(d,i+1)
m=lab==best[1]
ys,xs=np.where(m)
# the line between the lips: per column, the darkest pixel between the top and bottom of the lips
lum=w.mean(2); pts=[]
for x in range(xs.min(),xs.max()+1):
    col=np.where(m[:,x])[0]
    if len(col)<3: continue
    y0,y1=col.min(),col.max(); yy=y0+np.argmin(lum[y0:y1+1,x]); pts.append((x,yy))
pts=np.array(pts,float)
k,y0=np.polyfit(pts[:,0],pts[:,1],1)
xl,xr=xs.min(),xs.max()
dk=np.where((lum<115)&(r>g*1.5)&ndimage.binary_dilation(m,iterations=3))
if len(dk[0])>10: xl,xr=dk[1].min(),dk[1].max()
out={'L':[(cx-R+xl)/S,(cy-R+y0+k*xl)/S],'R':[(cx-R+xr)/S,(cy-R+y0+k*xr)/S],'thick':float((ys.max()-ys.min())/S)}
print(json.dumps(out))
Image.fromarray(np.where(m[...,None],[0,255,0],w).astype(np.uint8)).resize((4*2*R,4*2*R),Image.NEAREST).save('/tmp/lipmask.png')
