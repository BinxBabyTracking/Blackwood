import sys, pygltflib as G
g=G.GLTF2().load_binary(sys.argv[1]); blob=g.binary_blob()
used_acc=set()
for m in g.meshes:
  for p in m.primitives:
    used_acc|={v for v in p.attributes.__dict__.values() if isinstance(v,int)}; used_acc.add(p.indices)
    for t in p.targets or []: used_acc|=set(t.values())
for s in g.skins: used_acc.add(s.inverseBindMatrices)
acc_map={}; accs=[]
for i in sorted(used_acc): acc_map[i]=len(accs); accs.append(g.accessors[i])
used_bv={a.bufferView for a in accs}|{im.bufferView for im in g.images if im.bufferView is not None}
out=bytearray(); bv_map={}; bvs=[]
for i in sorted(used_bv):
    bv=g.bufferViews[i]
    while len(out)%4: out+=b"\0"
    off=len(out); out+=blob[bv.byteOffset or 0:(bv.byteOffset or 0)+bv.byteLength]
    nb=G.BufferView(buffer=0,byteOffset=off,byteLength=bv.byteLength,byteStride=bv.byteStride,target=bv.target); bv_map[i]=len(bvs); bvs.append(nb)
for a in accs: a.bufferView=bv_map[a.bufferView]
for im in g.images:
    if im.bufferView is not None: im.bufferView=bv_map[im.bufferView]
for m in g.meshes:
  for p in m.primitives:
    for k,v in list(p.attributes.__dict__.items()):
        if isinstance(v,int): setattr(p.attributes,k,acc_map[v])
    p.indices=acc_map[p.indices]
    if p.targets: p.targets=[{k:acc_map[v] for k,v in t.items()} for t in p.targets]
for s in g.skins: s.inverseBindMatrices=acc_map[s.inverseBindMatrices]
g.accessors=accs; g.bufferViews=bvs
while len(out)%4: out+=b"\0"
g.buffers=[G.Buffer(byteLength=len(out))]; g.set_binary_blob(bytes(out)); g.save_binary(sys.argv[2])
