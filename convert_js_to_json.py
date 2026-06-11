"""
Konversi semua file .js di js/ ke .json.
Run: python3 convert_js_to_json.py
"""
import json, re
from pathlib import Path

JS_DIR = Path(__file__).parent / "js"

# ── copy dari server.py ──

def _parse_preset_js(path: Path) -> dict:
    if not path.exists(): return {}
    text = path.read_text(encoding="utf-8")
    m = re.search(r'const\s+\w+\s*=\s*(\{[\s\S]*?\});\s*$', text)
    if not m: return {}
    obj_str = m.group(1)
    result = {}
    pos = 0
    while True:
        km = re.search(r'"([^"]+)"\s*:\s*\{', obj_str[pos:])
        if not km: break
        key = km.group(1)
        start = pos + km.end()
        depth, i = 1, start
        while depth > 0 and i < len(obj_str):
            if obj_str[i] == '{': depth += 1
            elif obj_str[i] == '}': depth -= 1
            i += 1
        body = obj_str[start:i-1] if depth == 0 else ''
        pos = i
        lm = re.search(r'label\s*:\s*"([^"]*)"', body)
        label = lm.group(1) if lm else key
        prompts = {}
        pm = re.search(r'prompts\s*:\s*\{', body)
        if pm:
            pstart = pm.end()
            pdepth, pi = 1, pstart
            while pdepth > 0 and pi < len(body):
                if body[pi] == '{': pdepth += 1
                elif body[pi] == '}': pdepth -= 1
                pi += 1
            ps = body[pstart:pi-1] if pdepth == 0 else ''
            for p in re.finditer(r'(\d+)\s*:\s*"((?:[^"\\]|\\.)*)"', ps):
                prompts[p.group(1)] = p.group(2)
        result[key] = {"label": label, "prompts": prompts}
    return result

def _parse_dynamic_js(filepath: Path) -> dict:
    if not filepath.exists(): return {}
    text = filepath.read_text(encoding="utf-8")
    text = re.sub(r'//.*', '', text)
    presets = {}
    preset_re = re.compile(
        r'(?P<key>[\w\s"-]+?)\s*:\s*\{\s*\n\s*label\s*:\s*"([^"]+)"\s*,\s*\n\s*prompts\s*:\s*generatePrompts\(\s*(?P<room>[^,]+)\s*,\s*\['
    )
    for m in preset_re.finditer(text):
        key = m.group("key").strip().strip('"')
        label = m.group(2)
        room_expr = m.group("room").strip()
        if room_expr == "randomRooms()":
            room = None
        elif room_expr.startswith('"') and room_expr.endswith('"'):
            room = room_expr[1:-1]
        else:
            room = room_expr
        arr_start = m.end()
        brace_count, obj_start, attires = 0, -1, []
        for i in range(arr_start, len(text)):
            c = text[i]
            if c == '{':
                if brace_count == 0: obj_start = i
                brace_count += 1
            elif c == '}':
                brace_count -= 1
                if brace_count == 0 and obj_start >= 0:
                    obj_text = text[obj_start:i+1]
                    attire_m = re.search(r'attire\s*:\s*"((?:[^"\\]|\\.)*)"', obj_text)
                    if attire_m: attires.append(attire_m.group(1))
                    obj_start = -1
            elif c == ']' and brace_count == 0:
                break
        if attires:
            presets[key] = {"label": label, "room": room, "attires": attires}
    return presets

def _parse_checkpoint_mapping(content: str) -> dict:
    mapping = {}
    m = re.search(r'const\s+checkpointNameMapping\s*=\s*(\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\});', content)
    if not m: return mapping
    obj_str = m.group(1)
    for entry in re.finditer(r'"([^"]+)"\s*:\s*\{([\s\S]*?)\}\s*(?:,|$)', obj_str):
        fname = entry.group(1)
        body = entry.group(2)
        data = {"displayName": fname}
        for kv in re.finditer(r'(\w+)\s*:\s*(true|false|"([^"]*)"|(-?\d+(?:\.\d+)?))', body):
            k, v_raw = kv.group(1), kv.group(2)
            if v_raw == "true": data[k] = True
            elif v_raw == "false": data[k] = False
            elif kv.group(3) is not None: data[k] = kv.group(3)
            elif kv.group(4) is not None:
                v_str = kv.group(4)
                data[k] = int(v_str) if "." not in v_str else float(v_str)
        mapping[fname] = data
    return mapping

def _parse_base_checkpoints(content: str) -> list:
    m = re.search(r'const\s+baseCheckpoints\s*=\s*\[([\s\S]*?)\];', content)
    if not m: return []
    return re.findall(r'"([^"]+)"', m.group(1))

# ── Konversi ──

print("🔄 Converting presets-general.js → presets-general.json")
general = _parse_preset_js(JS_DIR / "presets-general.js")
(JS_DIR / "presets-general.json").write_text(json.dumps(general, indent=2, ensure_ascii=False))
print(f"   ✅ {len(general)} presets")

print("🔄 Converting presets-nsfw.js → presets-nsfw.json")
nsfw = _parse_dynamic_js(JS_DIR / "presets-nsfw.js")
(JS_DIR / "presets-nsfw.json").write_text(json.dumps(nsfw, indent=2, ensure_ascii=False))
print(f"   ✅ {len(nsfw)} presets")

print("🔄 Converting presets-sfw.js → presets-sfw.json")
sfw = _parse_dynamic_js(JS_DIR / "presets-sfw.js")
(JS_DIR / "presets-sfw.json").write_text(json.dumps(sfw, indent=2, ensure_ascii=False))
print(f"   ✅ {len(sfw)} presets")

print("🔄 Converting checkpoints.js → checkpoints.json")
content = (JS_DIR / "checkpoints.js").read_text()
mapping = _parse_checkpoint_mapping(content)
items = _parse_base_checkpoints(content)
categories, current_cat, current_models = [], None, []
for item in items:
    if item.startswith("---- ") and item.endswith(" ----"):
        if current_cat and current_models:
            categories.append({"name": current_cat, "models": current_models})
        current_cat = item.replace("---- ", "").replace(" ----", "")
        current_models = []
    elif current_cat:
        m_data = mapping.get(item, {})
        model = {"filename": item, "displayName": m_data.get("displayName", item)}
        extra = {k: v for k, v in m_data.items() if k != "displayName"}
        if extra: model["mapping"] = extra
        current_models.append(model)
if current_cat and current_models:
    categories.append({"name": current_cat, "models": current_models})
(JS_DIR / "checkpoints.json").write_text(json.dumps({"categories": categories}, indent=2, ensure_ascii=False))
model_count = sum(len(c["models"]) for c in categories)
print(f"   ✅ {len(categories)} categories, {model_count} models")

print("\n✅ Semua file JSON berhasil dibuat!")