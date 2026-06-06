#!/usr/bin/env python3

"""
sync-models.py — Sinkronisasi nama model ComfyUI → checkpoints.js

Cara kerja:
  1. Scan .safetensors di folder Anime/DMD2/Illustrious/Pony/SDXL
  2. Hitung SHA256 (baca .sha256 sidecar atau hash langsung)
  3. Query CivitAI /by-hash/ → ambil nama model & versi
  4. Merge dengan checkpoints.js yang sudah ada
  5. Urutkan alphabetical → tulis ulang
"""

import os
import re
import sys
import json
import time
import hashlib
import argparse

import requests

# ---------------------------------------------------------------------------
# CONFIG
# ---------------------------------------------------------------------------

CHECKPOINTS_DIR = "/multimedia/AI/ComfyUI/models/checkpoints"
MIMPI_JS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "js", "checkpoints.js")

# Hanya folder ini yang diproses
ALLOWED_FOLDERS = {"Anime", "DMD2", "Illustrious", "Pony", "SDXL"}
FOLDER_ORDER = ["Anime", "DMD2", "Illustrious", "Pony", "SDXL"]

CIVITAI_API_HASH_URL = "https://civitai.com/api/v1/model-versions/by-hash/"
CIVITAI_API_KEY = os.environ.get("CIVITAI_API_KEY") or "a317ef02ceaabba42a5839408f19eb53"

REQUESTS_TIMEOUT = 15
API_DELAY = 0.3  # jeda antar request

# Default properties per kategori
DEFAULT_PROPS = {
    "Anime": {
        "sampler": "lcm", "scheduler": "exponential", "lora": False,
        "clip": True, "clipskip": -2, "steps": 10, "cfg": 1, "dmd2": True, "nsfw": True,
    },
    "DMD2": {
        "sampler": "lcm", "scheduler": "exponential", "lora": False,
        "clip": True, "clipskip": -2, "steps": 10, "cfg": 1, "dmd2": False, "nsfw": True,
    },
    "Illustrious": {
        "sampler": "lcm", "scheduler": "exponential", "lora": False,
        "clip": True, "clipskip": -2, "steps": 10, "cfg": 1, "dmd2": True, "nsfw": True,
    },
    "Pony": {
        "sampler": "lcm", "scheduler": "exponential", "lora": False,
        "clip": True, "clipskip": -2, "steps": 10, "cfg": 1, "dmd2": True, "nsfw": True,
    },
    "SDXL": {
        "sampler": "lcm", "scheduler": "exponential", "lora": False,
        "clip": True, "clipskip": -2, "steps": 10, "cfg": 1, "dmd2": True, "nsfw": True,
    },
}

# ---------------------------------------------------------------------------
# HTTP session & rate limiter
# ---------------------------------------------------------------------------

_session = requests.Session()
_session.headers.update({
    "Authorization": f"Bearer {CIVITAI_API_KEY}",
    "User-Agent": "sync-models/1.0 (Mimpi helper)",
})
_last_api_call = 0.0


def rate_limited_get(url: str) -> requests.Response:
    global _last_api_call
    now = time.monotonic()
    gap = API_DELAY - (now - _last_api_call)
    if gap > 0:
        time.sleep(gap)
    _last_api_call = time.monotonic()
    return _session.get(url, timeout=REQUESTS_TIMEOUT)


# ---------------------------------------------------------------------------
# SHA256
# ---------------------------------------------------------------------------

def sidecar_path(checkpoint_path: str) -> str:
    return os.path.splitext(checkpoint_path)[0] + ".sha256"


def read_cached_hash(checkpoint_path: str) -> str | None:
    sc = sidecar_path(checkpoint_path)
    try:
        with open(sc) as f:
            return f.read().strip()
    except (FileNotFoundError, OSError):
        return None


def write_cached_hash(checkpoint_path: str, file_hash: str):
    sc = sidecar_path(checkpoint_path)
    try:
        with open(sc, "w") as f:
            f.write(file_hash)
    except OSError:
        pass


def calculate_sha256(file_path: str) -> str | None:
    cached = read_cached_hash(file_path)
    if cached:
        return cached
    sha = hashlib.sha256()
    try:
        with open(file_path, "rb") as f:
            for block in iter(lambda: f.read(65536), b""):
                sha.update(block)
    except Exception:
        return None
    file_hash = sha.hexdigest()
    write_cached_hash(file_path, file_hash)
    return file_hash


# ---------------------------------------------------------------------------
# Scanner
# ---------------------------------------------------------------------------

def scan_checkpoints() -> list[dict]:
    """Scan folder yang diizinkan, return list {folder, filename, path, hash}."""
    results = []
    for folder in ALLOWED_FOLDERS:
        folder_path = os.path.join(CHECKPOINTS_DIR, folder)
        if not os.path.isdir(folder_path):
            continue
        for entry in sorted(os.listdir(folder_path)):
            if not entry.endswith(".safetensors"):
                continue
            fpath = os.path.join(folder_path, entry)
            results.append({
                "folder": folder,
                "filename": entry,
                "path": fpath,
                "hash": None,
            })
    return results


# ---------------------------------------------------------------------------
# CivitAI
# ---------------------------------------------------------------------------

def fetch_model_info(file_hash: str) -> dict | None:
    """
    Query CivitAI /by-hash/.
    Return {model_name, version_name, version_id} atau None.
    """
    url = f"{CIVITAI_API_HASH_URL}{file_hash}"
    try:
        resp = rate_limited_get(url)
        resp.raise_for_status()
        data = resp.json()
    except Exception:
        return None

    model_name = data.get("model", {}).get("name", "")
    version_name = data.get("name", "")
    version_id = data.get("id")

    if not model_name or not version_name:
        return None

    return {
        "model_name": model_name,
        "version_name": version_name,
        "version_id": version_id,
    }


# ---------------------------------------------------------------------------
# checkpoints.js — Parser
# ---------------------------------------------------------------------------

def parse_checkpoints_js(filepath: str) -> dict:
    """
    Parse checkpoints.js -> ambil:
      - header: teks sebelum checkpointNameMapping
      - mapping: dict {key -> {displayName, ...}}
      - middle: teks antara mapping & baseCheckpoints
      - base_list: list path entry (termasuk komentar separator)
      - footer: teks setelah baseCheckpoints
    """
    with open(filepath) as f:
        content = f.read()

    # Cari batas checkpointNameMapping
    mapping_start_re = re.search(
        r"const checkpointNameMapping\s*=\s*\{", content
    )
    if not mapping_start_re:
        return {"error": "checkpointNameMapping tidak ditemukan"}

    # Mapping end: cari '};' yang nutup mapping object
    mapping_body_start = mapping_start_re.end()
    # Cari brace matching
    depth = 1
    mapping_end = mapping_body_start
    for i in range(mapping_body_start, len(content)):
        if content[i] == "{":
            depth += 1
        elif content[i] == "}":
            depth -= 1
            if depth == 0:
                mapping_end = i
                break

    mapping_text = content[mapping_body_start:mapping_end]
    header = content[:mapping_start_re.start()]

    # Parse entries dari mapping_text
    mapping = {}
    # Regex: optional komentar, lalu key, lalu object
    entry_pattern = re.compile(
        r'(?://\s*(.*?)\s*\n)?'                           # optional category comment
        r'\s*"((?:[^"\\]|\\.)+)"\s*:\s*\{'                # key string
        r'(.*?)'                                           # properties
        r'\s*\},?\s*',
        re.DOTALL
    )

    for match in entry_pattern.finditer(mapping_text):
        # comment = match.group(1)  # category comment (unused, we derive from key)
        key = match.group(2)
        props_text = match.group(3)
        # Parse properties dari props_text
        props = {}
        prop_re = re.finditer(
            r'(\w+)\s*:\s*("[^"]*"|[-\w.]+|true|false|\d+)',
            props_text
        )
        for pm in prop_re:
            pkey = pm.group(1)
            pval = pm.group(2)
            # Parse value type
            if pval == "true":
                pval = True
            elif pval == "false":
                pval = False
            elif pval.isdigit() or (pval.startswith("-") and pval[1:].isdigit()):
                pval = int(pval)
            elif re.match(r'^-?\d+\.?\d*$', pval):
                try:
                    pval = float(pval)
                except ValueError:
                    pass
            elif pval.startswith('"') and pval.endswith('"'):
                pval = pval[1:-1]
            props[pkey] = pval
        mapping[key] = props

    # Cari '};' setelah mapping + teks antara
    after_mapping = content[mapping_end + 1:]

    # Cari baseCheckpoints
    base_re = re.search(r"const baseCheckpoints\s*=\s*\[", after_mapping)
    if not base_re:
        return {"error": "baseCheckpoints tidak ditemukan"}

    middle = after_mapping[:base_re.start()]

    # Base array
    base_body_start = base_re.end()
    # Cari '];'
    base_end = base_body_start
    depth = 1
    for i in range(base_body_start, len(after_mapping)):
        if after_mapping[i] == "[":
            depth += 1
        elif after_mapping[i] == "]":
            depth -= 1
            if depth == 0:
                base_end = i
                break

    base_text = after_mapping[base_body_start:base_end]
    footer = after_mapping[base_end + 2:]  # setelah ];

    # Parse base_list — ambil setiap baris path + komentar separator
    base_lines = [line.rstrip() for line in base_text.split("\n") if line.strip()]
    base_list = []
    for line in base_lines:
        stripped = line.strip().rstrip(",")
        if stripped.startswith('"') and stripped.endswith('"'):
            base_list.append(stripped[1:-1])  # path aja
        elif stripped.startswith('"----'):
            base_list.append(stripped)  # komentar separator

    return {
        "header": header,
        "mapping": mapping,
        "middle": middle,
        "base_list": base_list,
        "footer": footer,
    }


# ---------------------------------------------------------------------------
# checkpoints.js — Writer
# ---------------------------------------------------------------------------

def js_val(v):
    """Format nilai Python ke JS literal — with proper escape."""
    if isinstance(v, bool):
        return "true" if v else "false"
    elif isinstance(v, str):
        escaped = v.replace("\\", "\\\\").replace('"', '\\"')
        return f'"{escaped}"'
    elif isinstance(v, int) or isinstance(v, float):
        return str(v)
    else:
        return f'"{v}"'


def build_mapping_text(mapping: dict) -> str:
    """
    mapping: list of (key, props_dict) — sudah terurut.
    Tiap entry diplock per kategori dengan komentar.
    """
    # Kelompokkan per folder
    groups = {}
    for key, props in mapping:
        folder = key.split("/")[0]
        groups.setdefault(folder, []).append((key, props))

    lines = []
    for folder in FOLDER_ORDER:
        if folder not in groups:
            continue
        lines.append(f"    // {folder}")
        for key, props in groups[folder]:
            lines.append(f'    "{key}": {{')
            # displayName selalu pertama
            lines.append(f'        displayName: {js_val(props.get("displayName", ""))},')
            # Properties lain sesuai urutan tetap
            for prop_key in ["sampler", "scheduler", "lora", "clip", "clipskip",
                             "steps", "cfg", "dmd2", "nsfw"]:
                if prop_key in props:
                    lines.append(f'        {prop_key}: {js_val(props[prop_key])},')
            lines.append("    },")

    return "\n".join(lines)


def build_base_list(mapping_keys: list) -> list:
    """Buat baseCheckpoints list dari mapping keys, urut per folder."""
    # Kelompokkan per folder
    groups = {}
    for key in mapping_keys:
        folder = key.split("/")[0]
        groups.setdefault(folder, []).append(key)

    result = []
    for folder in FOLDER_ORDER:
        if folder not in groups:
            continue
        result.append(f'"---- {folder} ----"')
        for key in groups[folder]:
            result.append(f'"{key}"')

    return result


def write_checkpoints_js(
    filepath: str,
    header: str,
    mapping: list,  # list of (key, props_dict) — already sorted
    middle: str,
    footer: str,
):
    """Tulis ulang checkpoints.js."""
    mapping_text = build_mapping_text(mapping)
    base_list = build_base_list([k for k, _ in mapping])

    # Format baseCheckpoints array
    base_lines = []
    for entry in base_list:
        if entry.startswith('"----'):
            base_lines.append("")
            base_lines.append(f"        {entry},")
        else:
            base_lines.append(f"        {entry},")

    base_block = "\n".join(base_lines).lstrip("\n")

    output = (
        f"{header}"
        f"const checkpointNameMapping = {{\n"
        f"{mapping_text}\n"
        f"}};\n"
        f"{middle}"
        f"const baseCheckpoints = [\n"
        f"{base_block}\n"
        f"    ];\n"
        f"{footer}"
    )

    with open(filepath, "w") as f:
        f.write(output)

    print(f"✔ Ditulis ke {filepath}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Sinkronisasi model ComfyUI → checkpoints.js"
    )
    parser.add_argument(
        "--dry-run", "-d", action="store_true",
        help="Cuma scan & lapor, tanpa perubahan"
    )
    parser.add_argument(
        "--force", "-f", action="store_true",
        help="Re-hash semua file (abaikan sidecar .sha256)"
    )
    parser.add_argument(
        "--mimpi-js", default=MIMPI_JS,
        help=f"Path ke checkpoints.js (default: {MIMPI_JS})"
    )
    args = parser.parse_args()

    mimpi_js_path = os.path.abspath(args.mimpi_js)
    main_dir = os.path.dirname(os.path.abspath(__file__))

    print(f"╭─ 📦 Model Sync ─────────────────────────────────")
    print(f"│   Checkpoints : {CHECKPOINTS_DIR}")
    print(f"│   Mimpi JS    : {mimpi_js_path}")
    if args.dry_run:
        print(f"│   Mode        : DRY-RUN (tidak ada perubahan)")
    print(f"╰────────────────────────────────────────────────")
    print()

    # ── 1. Scan ────────────────────────────────────────────
    print(f"╭─ 📂 Fase 1: Scan ─────────────────────────────")
    checkpoints = scan_checkpoints()
    print(f"│   ✅ {len(checkpoints)} .safetensors ditemukan")
    print(f"╰────────────────────────────────────────────────")
    print()

    # ── 2. Hash ────────────────────────────────────────────
    print(f"╭─ 🔑 Fase 2: SHA256 Hash ─────────────────────")
    hash_fail = 0
    total_files = len(checkpoints)
    for i, cp in enumerate(checkpoints, 1):
        filename = f"{cp['folder']}/{cp['filename']}"
        print(f"│   [{i:>2}/{total_files}] {filename:<50}", end="", flush=True)
        if args.force:
            sc = sidecar_path(cp["path"])
            if os.path.exists(sc):
                os.remove(sc)
        cp["hash"] = calculate_sha256(cp["path"])
        if cp["hash"]:
            mark = "📄" if read_cached_hash(cp["path"]) else "⚡"
            print(f" {mark} {cp['hash'][:12]}…", flush=True)
        else:
            hash_fail += 1
            print(f" ❌", flush=True)
    print(f"╰────────────────────────────────────────────────")

    if hash_fail:
        print(f"   ⚠ {hash_fail} file gagal di-hash, dilewati")
        checkpoints = [cp for cp in checkpoints if cp["hash"]]
    print()

    # ── 3. CivitAI ────────────────────────────────────────
    print(f"╭─ 🌐 Fase 3: CivitAI Query ───────────────────")
    api_ok = 0
    api_fail = 0
    total_api = len(checkpoints)

    for i, cp in enumerate(checkpoints, 1):
        filename = f"{cp['folder']}/{cp['filename']}"
        print(f"│   [{i:>2}/{total_api}] {filename:<50}", end="", flush=True)
        info = fetch_model_info(cp["hash"])
        if info:
            cp["model_name"] = info["model_name"]
            cp["version_name"] = info["version_name"]
            cp["version_id"] = info["version_id"]
            api_ok += 1
            display = f"{info['model_name']} | {info['version_name']}"
            print(f" ✅", flush=True)
            print(f"│       → {display}")
        else:
            api_fail += 1
            cp["model_name"] = None
            cp["version_name"] = None
            print(f" ❌ GAGAL", flush=True)
    print(f"│")
    print(f"│   ✅ {api_ok} berhasil  |  ❌ {api_fail} gagal")
    print(f"╰────────────────────────────────────────────────")

    # ── Selesai kalo dry-run ──────────────────────────────
    if args.dry_run:
        print()
        print(f"   📊 DRY-RUN selesai. Tidak ada perubahan.")
        return

    # ── 4. Parse & Merge ──────────────────────────────────
    print()
    print(f"╭─ 📝 Fase 4: Parse & Merge ────────────────────")
    parsed = parse_checkpoints_js(mimpi_js_path)

    if "error" in parsed:
        print(f"│   ❌ Gagal parse: {parsed['error']}")
        print(f"╰────────────────────────────────────────────────")
        sys.exit(1)

    print(f"│   ✅ checkpoints.js berhasil diparse")
    existing_mapping = parsed["mapping"]
    new_count = 0
    updated_count = 0
    cleaned_count = 0

    # ── 4b. Cleanup: hapus entry yang filenya sudah tidak ada ─────
    valid_keys = {f"{cp['folder']}/{cp['filename']}" for cp in checkpoints}
    stale_keys = [k for k in existing_mapping if k not in valid_keys]
    if stale_keys:
        print(f"│")
        print(f"│   🧹 {len(stale_keys)} entri usang dihapus:")
        for k in sorted(stale_keys):
            print(f"│      ─ {k}")
        for k in stale_keys:
            del existing_mapping[k]
    cleaned_count = len(stale_keys)

    print(f"│")
    for cp in checkpoints:
        key = f"{cp['folder']}/{cp['filename']}"
        if not cp["model_name"]:
            continue

        display_name = f"{cp['model_name']} | {cp['version_name']}"

        if key in existing_mapping:
            old = existing_mapping[key].get("displayName", "")
            if old != display_name:
                existing_mapping[key]["displayName"] = display_name
                updated_count += 1
                print(f"│   ✏️  {key}")
                print(f"│      \"{old}\"")
                print(f"│      → \"{display_name}\"")
        else:
            folder = cp["folder"]
            props = dict(DEFAULT_PROPS.get(folder, DEFAULT_PROPS["SDXL"]))
            props["displayName"] = display_name
            existing_mapping[key] = props
            new_count += 1
            print(f"│   ➕ {key}")
            print(f"│      \"{display_name}\"")

    print(f"│")
    print(f"│   ➕ {new_count} baru  |  ✏️  {updated_count} update  |  🧹 {cleaned_count} hapus")
    print(f"│   📊 Total: {len(existing_mapping)} entri")
    print(f"╰────────────────────────────────────────────────")
    print()

    # ── 5. Sort alphabetical ──────────────────────────────
    print(f"╭─ 🔤 Fase 5: Sortir ───────────────────────────")
    def sort_key(item):
        key, _ = item
        folder = key.split("/")[0]
        filename = key.split("/", 1)[1].lower()
        folder_order = FOLDER_ORDER.index(folder) if folder in FOLDER_ORDER else 99
        return (folder_order, filename)

    sorted_mapping = sorted(existing_mapping.items(), key=sort_key)
    print(f"│   ✅ {len(sorted_mapping)} entri diurutkan A→Z per kategori")
    print(f"╰────────────────────────────────────────────────")
    print()

    # ── 6. Write ──────────────────────────────────────────
    print(f"╭─ 💾 Fase 6: Menulis ──────────────────────────")
    write_checkpoints_js(
        mimpi_js_path,
        parsed["header"],
        sorted_mapping,
        parsed["middle"],
        parsed["footer"],
    )
    print(f"│   ✅ File berhasil ditulis")
    print(f"╰────────────────────────────────────────────────")
    print()

    print(f"╭─ 🎉 Selesai! ──────────────────────────────────")
    print(f"│   ➕ {new_count} baru  |  ✏️  {updated_count} update  |  🧹 {cleaned_count} hapus")
    print(f"│   Total entri: {len(sorted_mapping)}")
    print(f"╰────────────────────────────────────────────────")


if __name__ == "__main__":
    main()
