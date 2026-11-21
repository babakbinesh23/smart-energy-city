#!/usr/bin/env python3
"""Build a release; reject stale main bundles, broken imports and nested archives."""
from pathlib import Path
import argparse, hashlib, json, re, zipfile

def validate(root):
    root = Path(root).resolve()
    match = re.search(r'^ \* Version: ([0-9.]+)$', (root/'bargheto-city.php').read_text(), re.M)
    if not match:
        raise ValueError('Missing plugin version')
    version = match[1]
    assets = root/'game/dist/assets'
    for prefix in ['index', 'startup']:
        found = sorted(p.name for p in assets.glob(prefix+'-2.5.*.js'))
        expected = [f'{prefix}-{version}.js']
        if found != expected:
            raise ValueError(f'Duplicate or stale {prefix} bundles: {found}; expected {expected}')
    html = (root/'game/dist/index.html').read_text()
    for prefix in ['index', 'startup']:
        if f'{prefix}-{version}.js' not in html:
            raise ValueError(f'HTML does not reference current {prefix}')
    if list(root.rglob('*.zip')):
        raise ValueError('Nested ZIP archives are forbidden')
    # Validate every static relative module import reachable from the current entry.
    pending = [assets/f'index-{version}.js']
    visited = set()
    imports = re.compile(r'''(?:import|export)\s+(?:[^;\n]*?\s+from\s*)?['"](\.[^'"]+)['"]''')
    while pending:
        file = pending.pop().resolve()
        if file in visited:
            continue
        if not file.is_relative_to(root) or not file.is_file():
            raise ValueError(f'Missing or escaping module: {file}')
        visited.add(file)
        for name in imports.findall(file.read_text()):
            pending.append((file.parent/name).resolve())
    return {'version':version,'reachableModules':len(visited),'mainBundles':1,'startupBundles':1}

def package(root, output, light=False):
    root = Path(root).resolve()
    output = Path(output).resolve()
    if output.is_relative_to(root):
        raise ValueError('Output must be outside the plugin directory')
    result = validate(root)  # Validation is mandatory, before creating output.
    # The Light ZIP carries code only; the companion media ZIP owns all pictures,
    # models, audio and video in durable uploads, independent of plugin updates.
    output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as archive:
        for file in sorted(root.rglob('*')):
            if light and file.suffix.lower() in {'.glb', '.gltf', '.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.mp4', '.webm', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.avif', '.ktx2', '.hdr'}:
                continue
            if file.is_file() and '__pycache__' not in file.parts and file.suffix != '.pyc':
                archive.write(file, file.relative_to(root.parent))
    with zipfile.ZipFile(output) as archive:
        if archive.testzip() is not None:
            raise ValueError('ZIP integrity check failed')
    return {**result,'mode':'light' if light else 'server-install','output':str(output),'bytes':output.stat().st_size}

def package_media(root, source, output):
    root, source, output = Path(root).resolve(), Path(source).resolve(), Path(output).resolve()
    if output.is_relative_to(root) or output.is_relative_to(source):
        raise ValueError('Media output must be outside input directories')
    php = (root/'media-manager.php').read_text()
    base = {name:{'size':int(size),'sha256':sha} for name,size,sha in re.findall(
        r"'([^']+)'\s*=>\s*array\('size'\s*=>\s*([0-9]+),\s*'sha256'\s*=>\s*'([a-f0-9]{64})'", php)}
    if not base: raise ValueError('Base media catalog missing')
    catalog = {**base, **json.loads((root/'server-media-manifest.json').read_text())}
    for name,spec in catalog.items():
        if not re.fullmatch(r'(?:models|audio|bundled|office)/[A-Za-z0-9_.-]+\.(?:glb|gltf|mp3|wav|ogg|m4a|aac|flac|mp4|webm|png|jpg|jpeg|webp|svg|gif|avif|ktx2|hdr)',name):
            raise ValueError('Invalid media path: '+name)
        file=source/name
        if not file.is_file() or file.is_symlink() or file.stat().st_size!=spec['size'] or hashlib.sha256(file.read_bytes()).hexdigest()!=spec['sha256']:
            raise ValueError('No verified media source: '+name)
    expected = {**catalog, **{name:None for name in ['manifest.json','README-FA.txt','web.config']}}
    if {str(p.relative_to(source)) for p in source.rglob('*') if p.is_file()} != set(expected):
        raise ValueError('Unexpected/missing media payload entries')
    manifest=json.loads((source/'manifest.json').read_text())
    if manifest['files']!=catalog: raise ValueError('Media catalog mismatch')
    output.parent.mkdir(parents=True,exist_ok=True)
    with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        for name in sorted(expected): z.write(source/name,name)
    with zipfile.ZipFile(output) as z:
        if z.testzip() is not None: raise ValueError('Media ZIP integrity check failed')
    return {'mode':'server-media','version':manifest['version'],'verifiedFiles':len(catalog),'verifiedBytes':sum(s['size'] for s in catalog.values()),'output':str(output),'bytes':output.stat().st_size}

if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('output')
    parser.add_argument('--root',default=str(Path(__file__).resolve().parents[1]))
    parser.add_argument('--light',action='store_true',help='Exclude model/audio/video payload; keep manifests and data')
    parser.add_argument('--media-source',help='Verified media payload directory')
    parser.add_argument('--media-output',help='Companion server-media ZIP path')
    args=parser.parse_args()
    if bool(args.media_source)!=bool(args.media_output):parser.error('--media-source and --media-output must be supplied together')
    results=[package(args.root,args.output,args.light)]
    if args.media_source:results.append(package_media(args.root,args.media_source,args.media_output))
    print(json.dumps(results,indent=2))
