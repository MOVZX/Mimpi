const COMFYUI_URL = "http://gambar.ai:8188";
let currentSeedNum = 0;
let lastImageData = null;

const workflow = {
    4: {
        inputs: { ckpt_name: "SDXL/lustimix_.safetensors" },
        class_type: "CheckpointLoaderSimple",
        _meta: { title: "Checkpoint" },
    },
    47: {
        inputs: { samples: ["160", 0], vae: ["4", 2] },
        class_type: "VAEDecode",
        _meta: { title: "VAE Decode" },
    },
    76: {
        inputs: { stop_at_clip_layer: -2, clip: ["84", 1] },
        class_type: "CLIPSetLastLayer",
        _meta: { title: "CLIP Skip" },
    },
    84: {
        inputs: {
            PowerLoraLoaderHeaderWidget: { type: "PowerLoraLoaderHeaderWidget" },
            lora_1: { on: true, lora: "SDXL/add-detail-xl.safetensors", strength: 0.25 },
            lora_2: {
                on: true,
                lora: "SDXL_1.0/Breast Slider - Pony_alpha1.0_rank4_noxattn_last.safetensors",
                strength: 0.9,
            },
            "➕ Add Lora": "",
            model: ["4", 0],
            clip: ["4", 1],
        },
        class_type: "Power Lora Loader (rgthree)",
        _meta: { title: "LoRA" },
    },
    103: {
        inputs: {
            text: "(penis:1.6), (male:1.6), (man:1.6), (men:1.6), gore, horror, text, watermark, low quality, medium quality, blurry, deformed, mutated, anime, toon, render, 3d, illustration, bad eyes, bad hands, bad fingers, asian, chinese, japanese, smiling, (tanned skin:1.4)",
            clip: ["76", 0],
        },
        class_type: "CLIPTextEncode",
        _meta: { title: "Negative Prompt" },
    },
    105: {
        inputs: {
            seed: 0,
            steps: 35,
            cfg: 3.5,
            sampler_name: "dpmpp_2m",
            scheduler: "karras",
            denoise: 1,
            model: ["193", 0],
            positive: ["178:2", 0],
            negative: ["103", 0],
            latent_image: ["152", 0],
        },
        class_type: "KSampler",
        _meta: { title: "KSampler" },
    },
    106: {
        inputs: {
            object_to_patch: "diffusion_model",
            residual_diff_threshold: 0.12500000000000003,
            start: 0,
            end: 1,
            max_consecutive_cache_hits: -1,
            model: ["84", 0],
        },
        class_type: "ApplyFBCacheOnModel",
        _meta: { title: "Cache" },
    },
    152: {
        inputs: { resolution: "896x1152 (0.78)", batch_size: 1, width_override: 0, height_override: 0 },
        class_type: "SDXLEmptyLatentSizePicker+",
        _meta: { title: "Image Size" },
    },
    160: {
        inputs: { aggressive: true, latent: ["105", 0] },
        class_type: "FreeMemoryLatent",
        _meta: { title: "GC" },
    },
    164: {
        inputs: {
            clip_name1: "ViT-L-14-REG-TE-only-balanced-HF-format-ckpt12.safetensors",
            clip_name2: "clip_g.safetensors",
            type: "sdxl",
            device: "default",
        },
        class_type: "DualCLIPLoader",
        _meta: { title: "Dual CLIP Loader" },
    },
    171: {
        inputs: {
            theme: "🎲 Dynamic Random",
            complexity: "complex",
            randomize: "enable",
            debug_mode: "off",
            seed: 0,
            custom_subject:
                "1girl, (solo:1.6), beautiful 35 y.o hotwife, kneeling, looking up, eyes closed, long hair, tongue out, anticipation, pov, realistic natural teeth, detailed skin texture, goosebumps, bedroom, cinematic, highly detailed, best quality, intricate details, (photorealistic:1.4), medium close shot, (fisheye lens:1.2), (wears black casual outfit, with bra and panties:1.1), average medium breasts, (candid photograph), natural white light, muted color",
            custom_location: "",
            include_environment: "yes",
            include_style: "yes",
            include_effects: "yes",
        },
        class_type: "IsulionMegaPromptV3",
        _meta: { title: "Prompt Generator" },
    },
    193: {
        inputs: {
            mode: "default",
            backend: "inductor",
            fullgraph: false,
            dynamic: false,
            model: ["106", 0],
        },
        class_type: "CompileModel",
        _meta: { title: "Compile" },
    },
    217: {
        inputs: { filename_prefix: "", images: ["47", 0] },
        class_type: "SaveImage",
        _meta: { title: "Save Image" },
    },
    "178:0": {
        inputs: {
            text: "1girl, (solo:1.6), beautiful 35 y.o hotwife, kneeling, looking up, eyes closed, long hair, tongue out, anticipation, pov, realistic natural teeth, detailed skin texture, goosebumps, bedroom, cinematic, highly detailed, best quality, intricate details, (photorealistic:1.4), medium close shot, (fisheye lens:1.2), (wears black casual outfit, with bra and panties:1.1), average medium breasts, (candid photograph), natural white light, muted color",
        },
        class_type: "Text Multiline",
        _meta: { title: "Positive Prompt" },
    },
    "178:1": {
        inputs: { boolean: false, on_true: ["171", 0], on_false: ["178:0", 0] },
        class_type: "Switch any [Crystools]",
        _meta: { title: "🪛 Switch any" },
    },
    "178:2": {
        inputs: { text: ["178:1", 0], clip: ["76", 0] },
        class_type: "CLIPTextEncode",
        _meta: { title: "Positive Prompt" },
    },
};

window.onload = function () {
    const outputImage = document.getElementById("outputImage");
    const imageActions = document.getElementById("imageActions");
    const status = document.getElementById("status");
    const savedSeed = localStorage.getItem("lastSeed");
    if (savedSeed) document.getElementById("seed").value = savedSeed;

    outputImage.src = "";
    outputImage.style.display = "none";
    imageActions.style.display = "none";
    status.style.display = "none";
    status.className = "";
    status.textContent = "";
};

function fetchCheckpointOptions() {
    const baseCheckpoints = [
        "---- Illustrious ----",
        "Illustrious/cyberillustrious_v30.safetensors",
        "Illustrious/novaRealityXL_illustriousV20.safetensors",
        "Illustrious/realismIllustriousBy_v30FP16.safetensors",
        "Illustrious/redcraftCADSUpdatedMar11_illust3relustion.safetensors",
        "Illustrious/rillusmRealistic_v20.safetensors",
        "---- Pony ----",
        "Pony/3xthreat2kModelThatUsesPONY_v10.safetensors",
        "Pony/babesByStableYogi_ponyV4VAEFix.safetensors",
        "Pony/cyberrealisticPony_v85.safetensors",
        "Pony/fasercore_v30PonyFP16.safetensors",
        "Pony/iniverseMixSFWNSFW_ponyRealGuofengV50C.safetensors",
        "Pony/ponyDiffusionV6XL.safetensors",
        "Pony/pornyPonyByStable_v20FP16.safetensors",
        "Pony/realDream_sdxlPony15.safetensors",
        "Pony/realismByStableYogi_v40FP16.safetensors",
        "Pony/uberRealisticPornMergePonyxl_ponyxlHybridV1.safetensors",
        "---- SDXL ----",
        "SDXL/acornIsBoningXL_xlV2.safetensors",
        "SDXL/agxl_V2.safetensors",
        "SDXL/animaPencilXL_v500.safetensors",
        "SDXL/babesByStableYogi_v4XLFP16.safetensors",
        "SDXL/biglovexl2.wBWt.safetensors",
        "SDXL/biglust16.kst6.safetensors",
        "SDXL/boomerArtModelBAM_bamV2.safetensors",
        "SDXL/clarityXL_v20.safetensors",
        "SDXL/cyberrealisticXL_v5.safetensors",
        "SDXL/epicrealismXL_vxvAnewstoryRealism.safetensors",
        "SDXL/fasercore_xlV1.safetensors",
        "SDXL/jibMixRealisticXL_v160Aphrodite.safetensors",
        "SDXL/juggernautXL_juggXIByRundiffusion.safetensors",
        "SDXL/leosamsHelloworldXL_helloworldXL70.safetensors",
        "SDXL/lustifySDXLNSFW_endgame.safetensors",
        "SDXL/lustifySDXLNSFW_oltONELASTTIME.safetensors",
        "SDXL/lustimix_.safetensors",
        "SDXL/lustimix_big.safetensors",
        "SDXL/msSDXLRealV3_v3.safetensors",
        "SDXL/novaRealityXL_v70.safetensors",
        "SDXL/omnigenxlNSFWSFW_v10.safetensors",
        "SDXL/perfectionRealisticILXL_v10.safetensors",
        "SDXL/polyhedronSDXL_v3.safetensors",
        "SDXL/pornmaster_proSDXLV3VAE.safetensors",
        "SDXL/realismByStableYogi_v5XLFP16.safetensors",
        "SDXL/realismEngineSDXL_v30VAE.safetensors",
        "SDXL/realisticLustXL_v05.safetensors",
        "SDXL/realisticStockPhoto_v20.safetensors",
        "SDXL/realvisxlV50_v50Bakedvae.safetensors",
        "SDXL/sd_xl_base_1.0_0.9vae.safetensors",
        "SDXL/sd_xl_refiner_1.0.safetensors",
        "SDXL/sdXL_v10VAEFix.safetensors",
        "SDXL/sdxlPhotorealisticMix_v10.safetensors",
        "SDXL/sdxxxl_v30.safetensors",
        "SDXL/stoiqoNewrealityFLUXSD35_XLPRO.safetensors",
    ];
    return baseCheckpoints.map((ckpt) => `${ckpt}`);
}

function fetchSamplerOptions() {
    return ["euler", "euler_ancestral", "dpmpp_sde", "dpmpp_2m", "dpmpp_2m_sde", "dpmpp_3m_sde", "res_multistep"];
}

function fetchSchedulerOptions() {
    return ["normal", "karras", "exponential", "sgm_uniform", "simple", "beta"];
}

function populateDropdowns() {
    const container = document.querySelector(".container");
    const detailsContent = container.querySelector("details > div");

    let checkpointFormGroup = document.getElementById("checkpointFormGroup");
    if (!checkpointFormGroup) {
        const checkpointOptions = fetchCheckpointOptions();
        checkpointFormGroup = document.createElement("div");
        checkpointFormGroup.id = "checkpointFormGroup";
        checkpointFormGroup.className = "form-group";

        const checkpointLabel = document.createElement("label");
        checkpointLabel.htmlFor = "checkpoint";
        checkpointLabel.textContent = "Checkpoint Model";

        const checkpointSelect = document.createElement("select");
        checkpointSelect.id = "checkpoint";
        checkpointSelect.name = "checkpoint";

        checkpointOptions.forEach((option) => {
            const optionElement = document.createElement("option");
            const displayName = option.replace(/^(SDXL\/|Pony\/|Illustrious\/)/, "");
            optionElement.value = option;
            optionElement.textContent = displayName;
            if (option === "SDXL/lustimix_.safetensors") optionElement.selected = true;
            checkpointSelect.appendChild(optionElement);
        });

        checkpointFormGroup.appendChild(checkpointLabel);
        checkpointFormGroup.appendChild(checkpointSelect);
        detailsContent.insertBefore(checkpointFormGroup, detailsContent.firstChild);
    }

    let samplerFormGroup = document.getElementById("samplerFormGroup");
    if (!samplerFormGroup) {
        const samplerOptions = fetchSamplerOptions();
        samplerFormGroup = document.createElement("div");
        samplerFormGroup.id = "samplerFormGroup";
        samplerFormGroup.className = "form-group";

        const samplerLabel = document.createElement("label");
        samplerLabel.htmlFor = "sampler";
        samplerLabel.textContent = "Sampler";

        const samplerSelect = document.createElement("select");
        samplerSelect.id = "sampler";
        samplerSelect.name = "sampler";

        samplerOptions.forEach((option) => {
            const optionElement = document.createElement("option");
            optionElement.value = option;
            optionElement.textContent = option;
            if (option === "dpmpp_2m") optionElement.selected = true;
            samplerSelect.appendChild(optionElement);
        });

        samplerFormGroup.appendChild(samplerLabel);
        samplerFormGroup.appendChild(samplerSelect);
        detailsContent.appendChild(samplerFormGroup);
    }

    let schedulerFormGroup = document.getElementById("schedulerFormGroup");
    if (!schedulerFormGroup) {
        const schedulerOptions = fetchSchedulerOptions();
        schedulerFormGroup = document.createElement("div");
        schedulerFormGroup.id = "schedulerFormGroup";
        schedulerFormGroup.className = "form-group";

        const schedulerLabel = document.createElement("label");
        schedulerLabel.htmlFor = "scheduler";
        schedulerLabel.textContent = "Scheduler";

        const schedulerSelect = document.createElement("select");
        schedulerSelect.id = "scheduler";
        schedulerSelect.name = "scheduler";

        schedulerOptions.forEach((option) => {
            const optionElement = document.createElement("option");
            optionElement.value = option;
            optionElement.textContent = option;
            if (option === "karras") optionElement.selected = true;
            schedulerSelect.appendChild(optionElement);
        });

        schedulerFormGroup.appendChild(schedulerLabel);
        schedulerFormGroup.appendChild(schedulerSelect);
        detailsContent.appendChild(schedulerFormGroup);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    populateDropdowns();

    const checkpointSelect = document.getElementById("checkpoint");
    if (checkpointSelect) {
        checkpointSelect.addEventListener("change", () => {
            workflow["4"]["inputs"]["ckpt_name"] = checkpointSelect.value;
            console.log("Checkpoint updated to:", checkpointSelect.value);
        });
    }

    const samplerSelect = document.getElementById("sampler");
    if (samplerSelect) {
        samplerSelect.addEventListener("change", () => {
            workflow["105"]["inputs"]["sampler_name"] = samplerSelect.value;
            console.log("Sampler updated to:", samplerSelect.value);
        });
    }

    const schedulerSelect = document.getElementById("scheduler");
    if (schedulerSelect) {
        schedulerSelect.addEventListener("change", () => {
            workflow["105"]["inputs"]["scheduler"] = schedulerSelect.value;
            console.log("Scheduler updated to:", schedulerSelect.value);
        });
    }

    // Lightbox functionality
    const outputImage = document.getElementById("outputImage");
    const lightbox = document.getElementById("lightbox");
    const lightboxImage = document.getElementById("lightboxImage");
    const closeLightbox = document.getElementById("closeLightbox");

    outputImage.addEventListener("click", () => {
        if (outputImage.src && outputImage.style.display !== "none") {
            lightboxImage.src = outputImage.src;
            lightbox.style.display = "flex";
        }
    });

    closeLightbox.addEventListener("click", () => {
        lightbox.style.display = "none";
    });

    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = "none";
        }
    });
});

async function generateImage() {
    const promptInput = document.getElementById("prompt").value;
    const stepsInput = document.getElementById("steps").value;
    const cfgInput = document.getElementById("cfg").value;
    const imageMode = document.getElementById("imageMode").value;
    const seedInput = document.getElementById("seed").value;
    const useDynamicPrompt = document.getElementById("useDynamicPrompt").checked;
    const status = document.getElementById("status");
    const error = document.getElementById("error");
    const button = document.querySelector("button");
    const outputImage = document.getElementById("outputImage");
    const imageActions = document.getElementById("imageActions");

    if (!promptInput) {
        showError(error, "Deskripsi gambar tidak boleh kosong!");
        return;
    }

    if (!document.getElementById("checkpoint")) populateDropdowns();

    showStatus(status, "Membuat gambar...");
    error.style.display = "none";
    outputImage.style.display = "none";
    imageActions.style.display = "none";
    button.disabled = true;

    try {
        const steps = parseInt(stepsInput);
        const cfg = parseFloat(cfgInput);
        if (isNaN(steps) || steps < 1 || steps > 100) throw new Error("Steps harus berupa angka antara 1 dan 100!");
        if (isNaN(cfg) || cfg < 1 || cfg > 30) throw new Error("CFG harus berupa angka antara 1 dan 30!");

        const checkpointSelect = document.getElementById("checkpoint");
        const samplerSelect = document.getElementById("sampler");
        const schedulerSelect = document.getElementById("scheduler");
        if (checkpointSelect && samplerSelect && schedulerSelect) {
            workflow["4"]["inputs"]["ckpt_name"] = checkpointSelect.value;
            workflow["178:0"]["inputs"]["text"] = promptInput;
            workflow["171"]["inputs"]["custom_subject"] = promptInput;
            workflow["105"]["inputs"]["steps"] = steps;
            workflow["105"]["inputs"]["cfg"] = cfg;
            workflow["105"]["inputs"]["sampler_name"] = samplerSelect.value;
            workflow["105"]["inputs"]["scheduler"] = schedulerSelect.value;
            workflow["178:1"]["inputs"]["boolean"] = useDynamicPrompt;
        } else throw new Error("Dropdowns not found!");

        const MAX_SEED = BigInt("18446744073709551615");
        if (!seedInput || isNaN(seedInput) || seedInput === "-1") {
            const randomValue =
                BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)) *
                BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
            const seed = randomValue % (MAX_SEED + BigInt(1));
            currentSeedNum = seed;
            workflow["105"]["inputs"]["seed"] = Number(seed);
            workflow["171"]["inputs"]["seed"] = Number(seed);
        } else {
            const seedNum = BigInt(seedInput);
            if (seedNum < BigInt(0) || seedNum > MAX_SEED) throw new Error(`Seed harus antara 0 dan ${MAX_SEED}!`);
            currentSeedNum = seedNum;
            workflow["105"]["inputs"]["seed"] = Number(seedNum);
            workflow["171"]["inputs"]["seed"] = Number(seedNum);
        }

        if (imageMode === "portrait") workflow["152"]["inputs"]["resolution"] = "896x1152 (0.78)";
        else if (imageMode === "landscape") workflow["152"]["inputs"]["resolution"] = "1152x896 (1.29)";

        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().split("T")[0];
        workflow["217"]["inputs"]["filename_prefix"] = `webui-rated-r/${formattedDate}/${currentSeedNum}`;

        console.log("Generating with:", {
            checkpoint: workflow["4"]["inputs"]["ckpt_name"],
            sampler: workflow["105"]["inputs"]["sampler_name"],
            scheduler: workflow["105"]["inputs"]["scheduler"],
            seed: workflow["105"]["inputs"]["seed"],
            useDynamicPrompt: useDynamicPrompt,
        });

        const response = await fetch(`${COMFYUI_URL}/prompt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: workflow, client_id: "webapp" }),
        });

        if (!response.ok) throw new Error("Gagal terhubung ke server ComfyUI!");

        const { prompt_id } = await response.json();

        let imageUrl = null;
        let attempts = 0;
        const maxAttempts = 30;
        while (!imageUrl && attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const historyResponse = await fetch(`${COMFYUI_URL}/history/${prompt_id}`);
            const history = await historyResponse.json();
            if (history[prompt_id] && history[prompt_id].outputs["217"]) {
                const images = history[prompt_id].outputs["217"].images;
                if (images && images.length > 0) {
                    const imageData = images[0];
                    if (imageData && imageData.filename && imageData.subfolder !== undefined && imageData.type) {
                        imageUrl = `${COMFYUI_URL}/view?filename=${imageData.filename}&subfolder=${imageData.subfolder}&type=${imageData.type}`;
                        lastImageData = imageData;
                    }
                }
            }
            attempts++;
        }

        if (!imageUrl) throw new Error("Gagal mengambil gambar setelah 20 detik.");

        outputImage.src = imageUrl;
        outputImage.style.display = "block";
        imageActions.style.display = "flex";
        const successMessage = `Gambar berhasil dibuat! Seed: ${currentSeedNum}`;
        showStatus(status, successMessage, "success");
        localStorage.setItem("lastGeneratedImage", imageUrl);
        localStorage.setItem("lastSeed", currentSeedNum);
    } catch (err) {
        let errorMessage = err.message;
        if (errorMessage.includes("fetch")) errorMessage = "Tidak dapat terhubung ke server!";
        else if (errorMessage.includes("Seed")) errorMessage = `Seed harus antara 0 dan ${MAX_SEED}!`;
        showError(error, errorMessage);
    } finally {
        button.disabled = false;
    }
}

async function deleteImage() {
    const status = document.getElementById("status");
    const error = document.getElementById("error");
    const outputImage = document.getElementById("outputImage");
    const imageActions = document.getElementById("imageActions");
    const button = document.querySelector(".delete");
    const lightbox = document.getElementById("lightbox");
    const seedInput = document.getElementById("seed");

    if (!lastImageData || !lastImageData.filename) {
        showError(error, "Tidak ada gambar yang dapat dihapus!");
        return;
    }

    showStatus(status, "Menghapus gambar...");
    button.disabled = true;

    try {
        console.log("Attempting to delete image with data:", lastImageData);
        const url = new URL(`${COMFYUI_URL}/comfyapi/v1/output-images/${encodeURIComponent(lastImageData.filename)}`);
        url.searchParams.append("temp", "false");
        url.searchParams.append("subfolder", lastImageData.subfolder);
        console.log("DELETE request URL:", url.toString());

        const response = await fetch(url, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gagal menghapus gambar: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log("Delete response:", result);

        // Randomize the seed
        const MAX_SEED = BigInt("18446744073709551615");
        const randomValue =
            BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)) *
            BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
        currentSeedNum = randomValue % (MAX_SEED + BigInt(1));
        workflow["105"]["inputs"]["seed"] = Number(currentSeedNum);
        workflow["171"]["inputs"]["seed"] = Number(currentSeedNum);
        seedInput.value = currentSeedNum.toString(); // Update the seed input field

        outputImage.src = "";
        outputImage.style.display = "none";
        imageActions.style.display = "none";
        lightbox.style.display = "none"; // Ensure lightbox is closed after deletion
        lastImageData = null;
        showStatus(status, "Gambar berhasil dihapus!", "success");
    } catch (err) {
        console.error("Delete error:", err);
        showError(error, `Gagal menghapus gambar: ${err.message}`);
    } finally {
        button.disabled = false;
    }
}

function clearImage() {
    const status = document.getElementById("status");
    const outputImage = document.getElementById("outputImage");
    const imageActions = document.getElementById("imageActions");
    const lightbox = document.getElementById("lightbox");
    const seedInput = document.getElementById("seed");
    const button = document.querySelector(".clear");

    if (!status || !outputImage || !imageActions || !lightbox || !seedInput || !button) {
        console.error("[DEBUG] Missing DOM elements in clearImage:", {
            status: !!status,
            outputImage: !!outputImage,
            imageActions: !!imageActions,
            lightbox: !!lightbox,
            seedInput: !!seedInput,
            button: !!button,
        });
        showError(document.getElementById("error"), "Kesalahan internal: Elemen UI tidak ditemukan!");
        return;
    }

    showStatus(status, "Membersihkan gambar...");
    button.disabled = true;

    try {
        const MAX_SEED = BigInt("18446744073709551615");
        const randomValue =
            BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)) *
            BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
        currentSeedNum = randomValue % (MAX_SEED + BigInt(1));
        workflow["105"]["inputs"]["seed"] = Number(currentSeedNum);
        workflow["171"]["inputs"]["seed"] = Number(currentSeedNum);
        seedInput.value = currentSeedNum.toString();
        console.log("[DEBUG] Seed randomized in clearImage:", currentSeedNum.toString());

        outputImage.src = "";
        outputImage.style.display = "none";
        imageActions.style.display = "none";
        lightbox.style.display = "none";
        showStatus(status, `Gambar dibersihkan! Seed baru: ${currentSeedNum}`, "success");
    } catch (err) {
        console.error("[DEBUG] Error in clearImage:", err);
        showError(document.getElementById("error"), "Gagal membersihkan gambar!");
    } finally {
        button.disabled = false;
    }
}

function showStatus(statusElement, message, type = "") {
    statusElement.textContent = message;
    statusElement.style.display = "block";
    statusElement.className = type;
    if (type !== "success")
        setTimeout(() => {
            if (statusElement.className !== "success") statusElement.style.display = "none";
        }, 5000);
}

function showError(errorElement, message) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
    setTimeout(() => (errorElement.style.display = "none"), 5000);
}
