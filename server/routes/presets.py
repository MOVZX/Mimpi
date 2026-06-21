"""Mimpi Dashboard — Presets Routes"""

import json
import random
from fastapi import APIRouter, Request, HTTPException
from server.database import db_query, db_execute
from server.config import PROJECT_DIR, COM_URI, COM_TOKEN
from server.cache import cache_get, cache_set, _make_key, clear_user_cache

# ── Presets parser ──
_HAIR_COLOURS = [
    "black", "brunette/brown", "dark brown", "medium brown", "light brown",
    "blonde", "platinum blonde", "ash blonde", "honey blonde", "strawberry blonde",
    "red", "auburn", "copper red", "cherry red", "gray/silver", "white",
    "lavender", "ombre", "balayage", "highlights/lowlights", "rose gold",
    "bronde", "mermaid", "icy blonde", "smoky gray", "mocha brown",
    "caramel highlights", "opal", "root shadow", "color melt", "foilayage",
]

_HAIR_STYLES = [
    "bob", "pixie cut", "shag", "mullet",
    "french braid", "dutch braid", "fishtail braid", "boxer braids",
    "cornrows", "micro braids", "fulani braids", "goddess braids", "braid",
    "bun", "top knot", "chignon", "ballerina bun", "french twist", "victory roll",
    "high ponytail", "low ponytail", "bubble ponytail", "side ponytail", "half-up ponytail",
    "layered cut", "feathered", "beach waves", "sleek straight", "curly",
    "blunt bangs", "side-swept bangs", "curtain bangs", "wispy bangs", "baby bangs",
    "wolf cut", "fade", "space buns", "half-up half-down", "pineapple updo",
]

_HAIR_ADJECTIVES = ["long", "messy", "wet", "sleek", "voluminous", "tousled", "flowing", "textured"]

_ROOMS = [
    "bedroom", "living room", "bathroom", "shower", "kitchen", "hot tub",
    "balcony", "hotel room", "rooftop", "master suite", "jacuzzi room",
    "attic", "library", "wine cellar", "fireplace lounge", "private pool",
    "sauna", "sunroom", "loft", "candlelit bath", "penthouse suite",
    "secluded cabin", "massage room", "velvet lounge", "garden gazebo",
    "private terrace", "mirrored room", "art studio", "yacht cabin",
    "hidden nook", "church", "woods cottage", "dining room", "patio",
]

def _random_hair_colour(): return random.choice(_HAIR_COLOURS)
def _random_hair_style(): return random.choice(_HAIR_STYLES)
def _random_hair_adjective(): return random.choice(_HAIR_ADJECTIVES)
def _random_age(): return (int(random.random() * 13) | 25)
def _random_room(): return random.choice(_ROOMS)

def _generate_dynamic_prompt(attire: str, room: str, nsfw: bool) -> str:
    prompt = (
        f"1girl, solo, stunningly beautiful {_random_age()}-year-old woman, "
        f"{_random_hair_adjective()} {_random_hair_style()} {_random_hair_colour()} hair, "
        f"wearing {attire}, {room}, intricate details"
    )

    if not nsfw:
        prompt += ", sfw"

    return prompt

# ── Presets ──
def _generate_prompts_from(templates: dict, nsfw: bool) -> dict:
    result = {}

    for key, data in templates.items():
        room = data["room"] if data["room"] else _random_room()
        prompts = {}

        for idx, attire in enumerate(data["attires"], 1):
            prompts[str(idx)] = _generate_dynamic_prompt(attire, room, nsfw)

        result[key] = {"label": data["label"], "prompts": prompts}

    return result

router = APIRouter()

@router.get("/api/presets")
async def get_presets():
    result = {}
    js_dir = PROJECT_DIR / "js"

    for key in ("general", "nsfw", "sfw"):
        f = js_dir / f"presets-{key}.json"

        if f.exists():
            result[key] = json.loads(f.read_text())

    return result

# ── Z-Image Presets ──
@router.get("/api/zimage-presets")
async def list_zimage_presets_new(request: Request):
    user_id = request.state.user_id

    key = _make_key("zimage-presets", str(user_id))
    cached = await cache_get(key)

    if cached is not None:
        return {"presets": cached}

    rows = db_query(
        "SELECT id, title, prompt, negative, model, sampler, scheduler, steps, cfg, "
        "width, height, res_mode, loras, use_dynamic_seed, use_inc_seed, "
        "created_at, updated_at FROM zimage_presets WHERE user_id = %s ORDER BY title",
        [user_id],
    )

    await cache_set(key, rows, ttl=300)

    return {"presets": rows}


@router.post("/api/zimage-presets")
async def create_zimage_preset_new(request: Request, data: dict):
    user_id = request.state.user_id
    title = data.get("title", "").strip()
    prompt = data.get("prompt", "").strip()

    if not title:
        raise HTTPException(400, "Judul wajib diisi")

    if not prompt:
        raise HTTPException(400, "Prompt wajib diisi")

    negative = data.get("negative", "")
    model = data.get("model", "Z-Image/beyondREALITY_V30.safetensors")
    sampler = data.get("sampler", "euler")
    scheduler = data.get("scheduler", "simple")
    steps = data.get("steps", 10)
    cfg = data.get("cfg", 1.0)
    width = data.get("width", 896)
    height = data.get("height", 1152)
    res_mode = data.get("res_mode", "896×1152")
    loras = data.get("loras", "[]")

    if isinstance(loras, list):
        loras = json.dumps(loras)

    use_dynamic_seed = 1 if data.get("use_dynamic_seed", True) else 0
    use_inc_seed = 1 if data.get("use_inc_seed", False) else 0

    try:
        db_execute(
            "INSERT INTO zimage_presets (user_id, title, prompt, negative, model, sampler, scheduler, "
            "steps, cfg, width, height, res_mode, loras, use_dynamic_seed, use_inc_seed) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
            [user_id, title, prompt, negative, model, sampler, scheduler, steps, cfg,
             width, height, res_mode, loras, use_dynamic_seed, use_inc_seed],
        )

        rows = db_query("SELECT MAX(id) AS id FROM zimage_presets WHERE user_id = %s", [user_id])
        new_id = rows[0]["id"] if rows else None

        await clear_user_cache(user_id)

        return {"message": "Preset disimpan", "id": new_id}
    except Exception as e:
        raise HTTPException(500, str(e))

@router.put("/api/zimage-presets/{preset_id}")
async def update_zimage_preset_new(request: Request, preset_id: int, data: dict):
    user_id = request.state.user_id
    title = data.get("title", "").strip()
    prompt = data.get("prompt", "").strip()

    if not title:
        raise HTTPException(400, "Judul wajib diisi")

    if not prompt:
        raise HTTPException(400, "Prompt wajib diisi")

    existing = db_query("SELECT id FROM zimage_presets WHERE id = %s AND user_id = %s", [preset_id, user_id])

    if not existing:
        raise HTTPException(404, "Preset tidak ditemukan")

    negative = data.get("negative", "")
    model = data.get("model", "Z-Image/beyondREALITY_V30.safetensors")
    sampler = data.get("sampler", "euler")
    scheduler = data.get("scheduler", "simple")
    steps = data.get("steps", 10)
    cfg = data.get("cfg", 1.0)
    width = data.get("width", 896)
    height = data.get("height", 1152)
    res_mode = data.get("res_mode", "896×1152")
    loras = data.get("loras", "[]")

    if isinstance(loras, list):
        loras = json.dumps(loras)

    use_dynamic_seed = 1 if data.get("use_dynamic_seed", True) else 0
    use_inc_seed = 1 if data.get("use_inc_seed", False) else 0

    db_execute(
        "UPDATE zimage_presets SET title=%s, prompt=%s, negative=%s, model=%s, sampler=%s, "
        "scheduler=%s, steps=%s, cfg=%s, width=%s, height=%s, res_mode=%s, loras=%s, "
        "use_dynamic_seed=%s, use_inc_seed=%s WHERE id=%s AND user_id=%s",
        [title, prompt, negative, model, sampler, scheduler, steps, cfg,
         width, height, res_mode, loras, use_dynamic_seed, use_inc_seed, preset_id, user_id],
    )

    await clear_user_cache(user_id)

    return {"message": "Preset diperbarui"}

@router.delete("/api/zimage-presets/{preset_id}")
async def delete_zimage_preset_new(request: Request, preset_id: int):
    user_id = request.state.user_id
    existing = db_query("SELECT id FROM zimage_presets WHERE id = %s AND user_id = %s", [preset_id, user_id])

    if not existing:
        raise HTTPException(404, "Preset tidak ditemukan")

    db_execute("DELETE FROM zimage_presets WHERE id = %s AND user_id = %s", [preset_id, user_id])

    await clear_user_cache(user_id)

    return {"message": "Preset dihapus"}


# ── SDXL Presets ──
@router.get("/api/sdxl-presets")
async def list_sdxl_presets(request: Request):
    user_id = request.state.user_id
    key = _make_key("sdxl-presets", str(user_id))
    cached = await cache_get(key)

    if cached is not None:
        return {"presets": cached}

    rows = db_query(
        "SELECT id, title, prompt, negative, model, sampler, scheduler, steps, cfg, "
        "width, height, loras, use_dmd2, use_custom_clip, clip_skip_val, "
        "use_upscale, upscaler, created_at, updated_at FROM sdxl_presets WHERE user_id = %s ORDER BY title",
        [user_id],
    )

    await cache_set(key, rows, ttl=300)

    return {"presets": rows}

@router.post("/api/sdxl-presets")
async def create_sdxl_preset(request: Request, data: dict):
    user_id = request.state.user_id
    title = data.get("title", "").strip()
    prompt = data.get("prompt", "").strip()

    if not title:
        raise HTTPException(400, "Judul wajib diisi")

    if not prompt:
        raise HTTPException(400, "Prompt wajib diisi")

    negative = data.get("negative", "")
    model = data.get("model", "")
    sampler = data.get("sampler", "lcm")
    scheduler = data.get("scheduler", "exponential")
    steps = data.get("steps", 8)
    cfg = data.get("cfg", 1.0)
    width = data.get("width", 896)
    height = data.get("height", 1152)
    loras = data.get("loras", "[]")

    if isinstance(loras, list):
        loras = json.dumps(loras)

    use_dmd2 = 1 if data.get("use_dmd2", False) else 0
    use_custom_clip = 1 if data.get("use_custom_clip", False) else 0
    clip_skip_val = data.get("clip_skip_val", -2)
    use_upscale = 1 if data.get("use_upscale", False) else 0
    upscaler = data.get("upscaler", "4x-ClearRealityV1.pth")

    try:
        db_execute(
            "INSERT INTO sdxl_presets (user_id, title, prompt, negative, model, sampler, scheduler, "
            "steps, cfg, width, height, loras, use_dmd2, use_custom_clip, clip_skip_val, "
            "use_upscale, upscaler) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
            [user_id, title, prompt, negative, model, sampler, scheduler, steps, cfg,
             width, height, loras, use_dmd2, use_custom_clip, clip_skip_val,
             use_upscale, upscaler],
        )

        rows = db_query("SELECT MAX(id) AS id FROM sdxl_presets WHERE user_id = %s", [user_id])
        new_id = rows[0]["id"] if rows else None

        await clear_user_cache(user_id)

        return {"message": "Preset disimpan", "id": new_id}
    except Exception as e:
        raise HTTPException(500, str(e))

@router.put("/api/sdxl-presets/{preset_id}")
async def update_sdxl_preset(request: Request, preset_id: int, data: dict):
    user_id = request.state.user_id
    title = data.get("title", "").strip()
    prompt = data.get("prompt", "").strip()

    if not title:
        raise HTTPException(400, "Judul wajib diisi")

    if not prompt:
        raise HTTPException(400, "Prompt wajib diisi")

    existing = db_query("SELECT id FROM sdxl_presets WHERE id = %s AND user_id = %s", [preset_id, user_id])

    if not existing:
        raise HTTPException(404, "Preset tidak ditemukan")

    negative = data.get("negative", "")
    model = data.get("model", "")
    sampler = data.get("sampler", "lcm")
    scheduler = data.get("scheduler", "exponential")
    steps = data.get("steps", 8)
    cfg = data.get("cfg", 1.0)
    width = data.get("width", 896)
    height = data.get("height", 1152)
    loras = data.get("loras", "[]")

    if isinstance(loras, list):
        loras = json.dumps(loras)

    use_dmd2 = 1 if data.get("use_dmd2", False) else 0
    use_custom_clip = 1 if data.get("use_custom_clip", False) else 0
    clip_skip_val = data.get("clip_skip_val", -2)
    use_upscale = 1 if data.get("use_upscale", False) else 0
    upscaler = data.get("upscaler", "4x-ClearRealityV1.pth")

    db_execute(
        "UPDATE sdxl_presets SET title=%s, prompt=%s, negative=%s, model=%s, sampler=%s, "
        "scheduler=%s, steps=%s, cfg=%s, width=%s, height=%s, loras=%s, "
        "use_dmd2=%s, use_custom_clip=%s, clip_skip_val=%s, "
        "use_upscale=%s, upscaler=%s WHERE id=%s AND user_id=%s",
        [title, prompt, negative, model, sampler, scheduler, steps, cfg,
         width, height, loras, use_dmd2, use_custom_clip, clip_skip_val,
         use_upscale, upscaler, preset_id, user_id],
    )

    await clear_user_cache(user_id)

    return {"message": "Preset diperbarui"}

@router.delete("/api/sdxl-presets/{preset_id}")
async def delete_sdxl_preset(request: Request, preset_id: int):
    user_id = request.state.user_id
    existing = db_query("SELECT id FROM sdxl_presets WHERE id = %s AND user_id = %s", [preset_id, user_id])

    if not existing:
        raise HTTPException(404, "Preset tidak ditemukan")

    db_execute("DELETE FROM sdxl_presets WHERE id = %s AND user_id = %s", [preset_id, user_id])

    await clear_user_cache(user_id)

    return {"message": "Preset dihapus"}
