import sys,os
os.environ.setdefault("OD","/tmp")
sys.argv=["x","none"]
exec(open("/tmp/aldric_scripts/check.py").read().split("mode=sys.argv[1]")[0])
cy=float(os.environ["CY"])
shot(build(None),"e_rest",cy=cy,half=0.075); shot(build("blink"),"e_blink",cy=cy,half=0.075); shot(build("blink",0.5),"e_half",cy=cy,half=0.075)
sheet(["e_rest","e_half","e_blink"],os.environ["OD"]+"/eyes.png",900)
