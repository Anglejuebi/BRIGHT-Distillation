"""Copy only public static content into the Pages artifact directory."""
from pathlib import Path
import shutil
root = Path(__file__).resolve().parents[1]
dest = root / 'site'
if dest.exists():
    shutil.rmtree(dest)
dest.mkdir()
for name in ('index.html', 'styles.css', 'app.js'):
    shutil.copy2(root / name, dest / name)
for name in ('assets', 'data'):
    shutil.copytree(root / name, dest / name)
(dest / 'docs').mkdir()
shutil.copy2(root / 'docs/CODEX_PROMPT.md', dest / 'docs/CODEX_PROMPT.md')
(dest / '.nojekyll').touch()
print('Pages artifact ready: site/')
