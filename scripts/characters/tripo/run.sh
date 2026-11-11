#!/bin/bash
n=$1; d=/tmp/chars/$n
Y0=$(python3 -c "import json;print(json.load(open('/tmp/aldric_scripts/params.json'))['$n']['Y0'])")
SRC=$d/a.glb python3 -I /tmp/aldric_scripts/fix_char.py $d/raw.glb $n > $d/log.txt 2>&1 || { tail -5 $d/log.txt; exit 1; }
python3 -I /tmp/aldric_scripts/prune.py $d/raw.glb $d/out.glb
CY=$(python3 -c "print($Y0+0.03)") OD=$d SRC=$d/out.glb PYOPENGL_PLATFORM=egl python3 -I /tmp/aldric_scripts/check.py face >/dev/null 2>&1
OD=$d SRC=$d/out.glb PYOPENGL_PLATFORM=egl python3 -I /tmp/aldric_scripts/check.py coat >/dev/null 2>&1
grep -E "LIPZ|seam|coat" $d/log.txt | tr '\n' ' '; echo
