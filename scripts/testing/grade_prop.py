# Testing Zone tool, kept for reference: file names point at the images Ian uploaded in the chat where this was built.
import sys, numpy as np
from PIL import Image
src, room, out = sys.argv[1:4]
R=np.asarray(Image.open(room).convert('RGB')).astype(np.float32)/255
h=R.shape[0]; band=R[int(h*0.4):int(h*0.75)].reshape(-1,3)          # walls and floor near eye level
lumR=band@[0.299,0.587,0.114]; tint=band.mean(0)/max(band.mean(),1e-3)
im=Image.open(src).convert('RGBA'); im.thumbnail((900,900),Image.LANCZOS)
a=np.asarray(im).astype(np.float32)/255; rgb=a[...,:3]; al=a[...,3]
L=rgb@[0.299,0.587,0.114]; m=al>0.5
hi=band[lumR>np.quantile(lumR,0.97)].mean(0); moon=hi/max(hi.mean(),1e-3)
k=np.clip((L-0.25)/0.5,0,1)[...,None]                                  # how much of each pixel is in the light
col=np.clip(L[...,None]*((1-k)*tint+k*moon),0,1)
g=0.75*col+0.25*rgb*tint                                              # mostly the room's palette, a little of the original
scale=(np.median(lumR)*1.15)/max(np.median((g@[0.299,0.587,0.114])[m]),1e-3)
g=np.clip(g*scale,0,1)
Image.fromarray((np.dstack([g,al])*255).astype(np.uint8)).save(out,quality=92)
print('moon',moon.round(2),'tint',tint.round(2),'scale',round(scale,2))
