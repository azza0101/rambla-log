from fontTools.ttLib import TTFont
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1]
src=ROOT/'assets'/'Kura_Brush2.woff2'
features=('ss01','ss02')
report={}
for tag in features:
 f=TTFont(src)
 gsub=f['GSUB'].table
 lookup_indices=[]
 for feat in gsub.FeatureList.FeatureRecord:
  if feat.FeatureTag==tag:lookup_indices.extend(feat.Feature.LookupListIndex)
 replacements={}
 types=[]
 for idx in lookup_indices:
  lookup=gsub.LookupList.Lookup[idx]
  types.append(lookup.LookupType)
  for st in lookup.SubTable:
   mapping=getattr(st,'mapping',None)
   if mapping:replacements.update(mapping)
 if not replacements:
  raise RuntimeError('Font feature '+tag+' has no direct GSUB glyph substitutions: '+str(types))
 count=0
 for table in f['cmap'].tables:
  if not table.isUnicode():continue
  for cp,glyph in list(table.cmap.items()):
   if glyph in replacements:
    table.cmap[cp]=replacements[glyph]
    count+=1
 if not count:raise RuntimeError('No Unicode glyph mapped for '+tag)
 variant='KURA Brush Alt '+tag[-2:]
 for n in f['name'].names:
  if n.nameID in (1,4,6,16,17):
   value=variant if n.nameID!=6 else variant.replace(' ','')
   n.string=value.encode(n.getEncoding(),errors='replace')
 path=ROOT/'assets'/('KURA_Brush_'+tag+'.woff2')
 f.flavor='woff2';f.save(path)
 report[tag]={'glyphSubstitutions':len(replacements),'codepointMappings':count,'file':path.name}
(ROOT/'assets'/'kura-brush-variants.json').write_text(json.dumps(report,indent=2)+'\n')
print(report)
