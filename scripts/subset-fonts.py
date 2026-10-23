from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[1] / 'src' / 'assets' / 'fonts'
characters = set(range(0x250)) | set(range(0x1E00, 0x1F00)) | set(range(0x2000, 0x2070)) | set(range(0x20A0, 0x20D0)) | set(range(0x2190, 0x2200)) | {0x2122, 0x2713, 0x2715, 0xFFFD}
for weight in ('regular', 'medium'):
    font = TTFont(root / f'tthoves-{weight}.woff2')
    options = subset.Options()
    options.layout_features = ['*']
    options.name_IDs = ['*']
    options.name_legacy = True
    options.name_languages = ['*']
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=characters)
    subsetter.subset(font)
    font.flavor = 'woff2'
    font.save(root / f'tthoves-latin-{weight}.woff2')
