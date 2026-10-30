from pathlib import Path
from PIL import Image
import json, re

root=Path("images/mobiiliohje")
html=Path("mobiiliohje/index.html")
mapping={
 "ziiply_vertailu_dia_1.png":"vertailu_1",
 "ziiply_vertailu_dia_2.png":"vertailu_2",
 "ziiply_vertailu_dia_3.png":"vertailu_3",
 "ziiply_vihkonen_ohje_1.png":"vihkonen_1",
 "ziiply_vihkonen_ohje_2.png":"vihkonen_2",
 "justiinan_ohje.png":"justiina",
}
page=html.read_text(encoding="utf-8")
for name,stem in mapping.items():
    im=Image.open(root/name).convert("RGB")
    w,h=im.size
    if w<=h:
        raise RuntimeError(f"{name} is not a two-column image: {w}x{h}")
    for side,box in [("left",(0,0,w//2,h)),("right",(w//2,0,w,h))]:
        output=f"{stem}_{side}.png"
        im.crop(box).save(root/output,optimize=True)
        old=f'"src":"/images/mobiiliohje/{name}"'
        # Replace only the matching half entry
        pattern=r'\{"src":"/images/mobiiliohje/'+re.escape(name)+r'","title":"([^"]+)","half":"'+side+r'"\}'
        def change(m):
            return json.dumps({"src":f"/images/mobiiliohje/{output}","title":m.group(1)},ensure_ascii=False,separators=(",",":"))
        page,count=re.subn(pattern,change,page)
        if count!=1: raise RuntimeError(f"Expected one {name} {side} slide, got {count}")
html.write_text(page,encoding="utf-8")
print("Created 12 separate portrait PNGs and replaced slide references")
