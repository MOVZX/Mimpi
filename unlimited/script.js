const COMFYUI_URL = "http://gambar.ai:8188";
let currentSeedNum = 0;
let lastImageData = null;

const workflow = {
    4: {
        inputs: { ckpt_name: "SDXL/lustimix_.safetensors" },
        class_type: "CheckpointLoaderSimple",
    },
    47: {
        inputs: { samples: ["160", 0], vae: ["4", 2] },
        class_type: "VAEDecode",
    },
    76: {
        inputs: { stop_at_clip_layer: -2, clip: ["84", 1] },
        class_type: "CLIPSetLastLayer",
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
    },
    103: {
        inputs: {
            text: "",
            clip: ["76", 0],
        },
        class_type: "CLIPTextEncode",
    },
    105: {
        inputs: {
            seed: 0,
            steps: 7,
            cfg: 1,
            sampler_name: "lcm",
            scheduler: "normal",
            denoise: 1,
            model: ["193", 0],
            positive: ["178:2", 0],
            negative: ["103", 0],
            latent_image: ["152", 0],
        },
        class_type: "KSampler",
    },
    106: {
        inputs: {
            object_to_patch: "diffusion_model",
            residual_diff_threshold: 0.2,
            start: 0,
            end: 1,
            max_consecutive_cache_hits: -1,
            model: ["84", 0],
        },
        class_type: "ApplyFBCacheOnModel",
    },
    152: {
        inputs: { resolution: "896x1152 (0.78)", batch_size: 1, width_override: 0, height_override: 0 },
        class_type: "SDXLEmptyLatentSizePicker+",
    },
    160: {
        inputs: { aggressive: true, latent: ["105", 0] },
        class_type: "FreeMemoryLatent",
    },
    171: {
        inputs: {
            theme: "🎲 Dynamic Random",
            complexity: "complex",
            randomize: "enable",
            debug_mode: "off",
            seed: 0,
            custom_subject: "",
            custom_location: "",
            include_environment: "yes",
            include_style: "yes",
            include_effects: "yes",
        },
        class_type: "IsulionMegaPromptV3",
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
    },
    217: {
        inputs: { filename_prefix: "", images: ["47", 0] },
        class_type: "SaveImage",
    },
    "178:0": {
        inputs: {
            text: "",
        },
        class_type: "Text Multiline",
    },
    "178:1": {
        inputs: { boolean: false, on_true: ["171", 0], on_false: ["178:0", 0] },
        class_type: "Switch any [Crystools]",
    },
    "178:2": {
        inputs: { text: ["178:1", 0], clip: ["76", 0] },
        class_type: "CLIPTextEncode",
    },
};

const mainPresets = {
    none: { label: "Tidak Ada", prompts: {} },
    sfw: SFWPresets,
    nsfw: NSFWPresets,
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
            const displayName =
                checkpointNameMapping[option] ||
                option
                    .replace(/^(SDXL\/|SDXL-Lightning\/|SDXL-Turbo\/|Pony\/|Illustrious\/)/, "")
                    .replace(/\.safetensors$/, "");
            optionElement.value = option;
            optionElement.textContent = displayName;
            if (option === "SDXL-Lightning/lustifySDXLNSFW_v40DMD2.safetensors") optionElement.selected = true;
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
            if (option === "lcm") optionElement.selected = true;
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
            if (option === "normal") optionElement.selected = true;
            schedulerSelect.appendChild(optionElement);
        });

        schedulerFormGroup.appendChild(schedulerLabel);
        schedulerFormGroup.appendChild(schedulerSelect);
        detailsContent.appendChild(schedulerFormGroup);
    }
}

function populatePresetDropdowns() {
    const presetSelect = document.getElementById("main-preset");
    const subcategoryContainer = document.getElementById("subcategory-container");
    const subcategorySelect = document.getElementById("subcategory");
    const promptTextarea = document.getElementById("prompt");

    if (presetSelect && subcategoryContainer && subcategorySelect && promptTextarea) {
        presetSelect.innerHTML = "";

        const noneOption = document.createElement("option");
        noneOption.value = "none";
        noneOption.textContent = "Tidak Ada";
        presetSelect.appendChild(noneOption);

        const sfwOptgroup = document.createElement("optgroup");
        sfwOptgroup.label = "SFW";
        Object.keys(mainPresets.sfw).forEach((categoryKey) => {
            if (categoryKey === "none") return;
            const option = document.createElement("option");
            option.value = `sfw:${categoryKey}`;
            option.textContent = mainPresets.sfw[categoryKey].label;
            sfwOptgroup.appendChild(option);
        });
        presetSelect.appendChild(sfwOptgroup);

        const nsfwOptgroup = document.createElement("optgroup");
        nsfwOptgroup.label = "NSFW";
        Object.keys(mainPresets.nsfw).forEach((categoryKey) => {
            if (categoryKey === "none") return;
            const option = document.createElement("option");
            option.value = `nsfw:${categoryKey}`;
            option.textContent = mainPresets.nsfw[categoryKey].label;
            nsfwOptgroup.appendChild(option);
        });
        presetSelect.appendChild(nsfwOptgroup);

        presetSelect.addEventListener("change", () => {
            const selectedValue = presetSelect.value;
            promptTextarea.value = "";

            if (selectedValue === "none") {
                subcategoryContainer.style.display = "none";
                subcategorySelect.innerHTML = "";
                return;
            }

            subcategoryContainer.style.display = "block";
            subcategorySelect.innerHTML = "";

            const [categoryType, categoryKey] = selectedValue.split(":");
            const presetObject = mainPresets[categoryType];
            const categoryPrompts = presetObject[categoryKey].prompts;

            Object.keys(categoryPrompts).forEach((promptKey) => {
                const option = document.createElement("option");
                option.value = promptKey;
                option.textContent = promptKey.replace(
                    /^\w+\s+\w+\s+(\d+)$/,
                    (match, number) => `${presetObject[categoryKey].label} ${number}`
                );
                subcategorySelect.appendChild(option);
            });

            if (subcategorySelect.options.length > 0) {
                subcategorySelect.value = subcategorySelect.options[0].value;
                promptTextarea.value = categoryPrompts[subcategorySelect.value];
            }
        });

        subcategorySelect.addEventListener("change", () => {
            const selectedValue = presetSelect.value;
            const [categoryType, categoryKey] = selectedValue.split(":");
            const selectedSubcategory = subcategorySelect.value;
            const presetObject = mainPresets[categoryType];
            promptTextarea.value = presetObject[categoryKey].prompts[selectedSubcategory] || "";
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    populateDropdowns();
    populatePresetDropdowns();

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
    const promptNegativeInput = document.getElementById("prompt-negative").value;
    const clipSkipInput = document.getElementById("clip-skip").value;
    const stepsInput = document.getElementById("steps").value;
    const cfgInput = document.getElementById("cfg").value;
    const imageMode = document.getElementById("imageMode").value;
    const seedInput = document.getElementById("seed").value;
    const useDynamicPrompt = document.getElementById("useDynamicPrompt").checked;
    const useDynamicSeed = document.getElementById("useDynamicSeed").checked;
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

    showStatus(status, "<center><b>Membuat gambar...</b></center>");
    error.style.display = "none";
    outputImage.style.display = "none";
    imageActions.style.display = "none";
    button.disabled = true;

    try {
        const steps = parseInt(stepsInput);
        const cfg = parseFloat(cfgInput);
        const clipSkip = parseInt(clipSkipInput);
        if (isNaN(steps) || steps < 1 || steps > 100) throw new Error("Steps harus berupa angka antara 1 dan 100!");
        if (isNaN(cfg) || cfg < 1 || cfg > 30) throw new Error("CFG harus berupa angka antara 1 dan 30!");
        if (isNaN(clipSkip) || clipSkip < -10 || clipSkip > -1)
            throw new Error("CLIP Skip harus berupa angka antara -1 dan -10!");

        const checkpointSelect = document.getElementById("checkpoint");
        const samplerSelect = document.getElementById("sampler");
        const schedulerSelect = document.getElementById("scheduler");
        if (checkpointSelect && samplerSelect && schedulerSelect) {
            workflow["4"]["inputs"]["ckpt_name"] = checkpointSelect.value;
            workflow["178:0"]["inputs"]["text"] = promptInput;
            workflow["171"]["inputs"]["custom_subject"] = promptInput;
            workflow["103"]["inputs"]["text"] = promptNegativeInput;
            workflow["76"]["inputs"]["stop_at_clip_layer"] = clipSkip;
            workflow["105"]["inputs"]["steps"] = steps;
            workflow["105"]["inputs"]["cfg"] = cfg;
            workflow["105"]["inputs"]["sampler_name"] = samplerSelect.value;
            workflow["105"]["inputs"]["scheduler"] = schedulerSelect.value;
            workflow["178:1"]["inputs"]["boolean"] = useDynamicPrompt;
        } else throw new Error("Dropdowns tidak ditemukan!");

        const MAX_SEED = BigInt("18446744073709551615");
        if (useDynamicSeed || !seedInput || isNaN(seedInput) || seedInput === "-1") {
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
        else if (imageMode === "square") workflow["152"]["inputs"]["resolution"] = "1024x1024 (1.0)";

        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().split("T")[0];
        workflow["217"]["inputs"]["filename_prefix"] = `webui-rated-r/${formattedDate}/${currentSeedNum}`;

        console.log("[DEBUG] Parameter pembuatan gambar:", {
            checkpoint: workflow["4"]["inputs"]["ckpt_name"],
            sampler: workflow["105"]["inputs"]["sampler_name"],
            scheduler: workflow["105"]["inputs"]["scheduler"],
            seed: workflow["105"]["inputs"]["seed"],
            steps: steps,
            cfg: cfg,
            imageMode: imageMode,
            useDynamicPrompt: useDynamicPrompt,
        });

        const response = await fetch(`${COMFYUI_URL}/prompt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: workflow, client_id: "webapp" }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gagal terhubung ke server: ${response.status} - ${errorText}`);
        }

        const { prompt_id } = await response.json();
        console.log("[DEBUG] Prompt ID:", prompt_id);

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
                        console.log("[DEBUG] Gambar ditemukan:", imageUrl);
                    }
                }
            }
            attempts++;
        }

        if (!imageUrl) throw new Error("Gagal mengambil gambar setelah 30 detik.");

        outputImage.src = imageUrl;
        outputImage.style.display = "block";
        imageActions.style.display = "flex";

        const successMessage = `
            <details aria-expanded="false">
                <summary style="color: #fff78e;">Data Pembuatan Gambar</summary>
                <table class="success-table">
                    <tr><td>Positive Prompt:</td><td>${promptInput}</td></tr>
                    <tr><td>Negative Prompt:</td><td>${promptNegativeInput}</td></tr>
                    <tr><td>CLIP Skip:</td><td>${clipSkip}</td></tr>
                    <tr><td>Checkpoint:</td><td>${checkpointSelect.value}</td></tr>
                    <tr><td>Mode:</td><td>${imageMode}</td></tr>
                    <tr><td>Steps:</td><td>${steps}</td></tr>
                    <tr><td>CFG:</td><td>${cfg}</td></tr>
                    <tr><td>Seed:</td><td>${currentSeedNum}</td></tr>
                    <tr><td>Sampler:</td><td>${samplerSelect.value}</td></tr>
                    <tr><td>Scheduler:</td><td>${schedulerSelect.value}</td></tr>
                </table>
            </details>
        `;
        showStatus(status, successMessage, "success");
        localStorage.setItem("lastGeneratedImage", imageUrl);
        localStorage.setItem("lastSeed", currentSeedNum);
    } catch (err) {
        let errorMessage = err.message;
        if (errorMessage.includes("fetch")) errorMessage = "Tidak dapat terhubung ke server!";
        else if (errorMessage.includes("Seed")) errorMessage = `Seed harus antara 0 dan ${MAX_SEED}!`;
        showError(error, errorMessage);
        console.error("[DEBUG] Kesalahan saat membuat gambar:", err);
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
    const useDynamicSeed = document.getElementById("useDynamicSeed").checked;

    if (!lastImageData || !lastImageData.filename) {
        showError(error, "Tidak ada gambar yang dapat dihapus!");
        return;
    }

    showStatus(status, "<center><b>Menghapus gambar...</b></center>");
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

        if (useDynamicSeed) {
            const MAX_SEED = BigInt("18446744073709551615");
            const randomValue =
                BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)) *
                BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
            currentSeedNum = randomValue % (MAX_SEED + BigInt(1));
            workflow["105"]["inputs"]["seed"] = Number(currentSeedNum);
            workflow["171"]["inputs"]["seed"] = Number(currentSeedNum);
            seedInput.value = Number(currentSeedNum);
        }

        outputImage.src = "";
        outputImage.style.display = "none";
        imageActions.style.display = "none";
        lightbox.style.display = "none";
        lastImageData = null;
        showStatus(status, "<center><b>Gambar berhasil dihapus!</b></center>", "success");
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
    const useDynamicSeed = document.getElementById("useDynamicSeed").checked;
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

    showStatus(status, "<center><b>Membersihkan gambar...</b></center>");
    button.disabled = true;

    try {
        if (useDynamicSeed) {
            const MAX_SEED = BigInt("18446744073709551615");
            const randomValue =
                BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)) *
                BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
            currentSeedNum = randomValue % (MAX_SEED + BigInt(1));
            workflow["105"]["inputs"]["seed"] = Number(currentSeedNum);
            workflow["171"]["inputs"]["seed"] = Number(currentSeedNum);
            seedInput.value = Number(currentSeedNum);
            console.log("[DEBUG] Seed randomized in clearImage:", Number(currentSeedNum));
        }

        outputImage.src = "";
        outputImage.style.display = "none";
        imageActions.style.display = "none";
        lightbox.style.display = "none";
        showStatus(status, `<center><b>Seed baru: ${currentSeedNum}</b></center>`, "success");
    } catch (err) {
        console.error("[DEBUG] Error in clearImage:", err);
        showError(document.getElementById("error"), "Gagal membersihkan gambar!");
    } finally {
        button.disabled = false;
    }
}

function showStatus(statusElement, message, type = "") {
    statusElement.innerHTML = message;
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
