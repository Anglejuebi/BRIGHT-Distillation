"""Validate scientific counts, local resources and deployable structure."""
from pathlib import Path
from html.parser import HTMLParser
import csv, json, xml.etree.ElementTree as ET
root = Path(__file__).resolve().parents[1]
raw = (root / 'data/research-data.js').read_text(encoding='utf-8')
d = json.loads(raw[raw.index('{'):raw.rindex('}')+1])
assert sum(c['count'] for c in d['cohorts']) == d['total'] == 18756
assert [c['count'] for c in d['cohorts']] == [14868, 192, 2005, 1135, 556]
assert [f"{c['count']/18756*100:.2f}" for c in d['cohorts']] == ['79.27','1.02','10.69','6.05','2.96']
assert [(p['id'],p['backbone'],p['sngp'],p['encoder']) for p in d['pipelines']] == [('P1','1007','SNGP-1007','BRIGHT-S'),('P2','1007','SNGP-1007','H-optimus-1'),('P3','ex','SNGP-ex','BRIGHT-S'),('P4','ex','SNGP-ex','H-optimus-1')]
assert d['method']['studentPatchTokens'] == 16
assert d['method']['teacherClsInputCount'] == 16 and d['method']['teacherClsTargetCount'] == 1
assert sum(bool(r['confirmed']) for r in d['method']['routes']) == 2
class Resources(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids=set();self.anchors=[]
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if 'id' in attrs:
            assert attrs['id'] not in self.ids, f"Duplicate id: {attrs['id']}"
            self.ids.add(attrs['id'])
        for attr in ['src','href']:
            ref=attrs.get(attr,'')
            if ref.startswith('./'):
                assert (root/ref[2:]).is_file(), f'Missing resource: {ref}'
            if ref.startswith('#'):self.anchors.append(ref[1:])
p=Resources();p.feed((root/'index.html').read_text(encoding='utf-8'))
assert all(a in p.ids for a in p.anchors)
for path in (root/'assets').glob('*.svg'):ET.parse(path)
with (root/'data/results-template.csv').open() as f:
    rows=list(csv.DictReader(f));assert len(rows)==8
    assert all(not row['value'] and not row['ci_low'] and not row['ci_high'] for row in rows)
for name in ['CODEX_PROMPT.md','SCIENTIFIC_NOTES.md','EXECUTION_GUIDE.md','VALIDATION.md']:
    assert (root/'docs'/name).is_file()
print('PASS: counts, percentages, P1–P4, clarified tokens, placeholders, HTML resources and SVG XML.')
