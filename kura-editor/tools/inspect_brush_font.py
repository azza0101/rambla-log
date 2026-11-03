from fontTools.ttLib import TTFont
import json
from pathlib import Path
p=Path(__file__).resolve().parents[1]/'assets'/'Kura_Brush2.woff2'
font=TTFont(p)
features=[]
if 'GSUB' in font:
 gsub=font['GSUB'].table
 if gsub.FeatureList:
  features=[r.FeatureTag for r in gsub.FeatureList.FeatureRecord]
axis=[]
if 'fvar' in font:
 axis=[{'tag':a.axisTag,'min':a.minValue,'max':a.maxValue,'default':a.defaultValue} for a in font['fvar'].axes]
names=[]
for n in font['name'].names:
 if n.nameID in (1,2,4,6,16,17):
  try: value=n.toUnicode()
  except: continue
  if value not in names:names.append(value)
report={'font':'Kura_Brush2.woff2','units':font['head'].unitsPerEm,'glyphs':len(font.getGlyphOrder()),'features':features,'axes':axis,'names':names}
out=Path(__file__).resolve().parents[1]/'assets'/'kura-brush-capabilities.json'
out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(report)
