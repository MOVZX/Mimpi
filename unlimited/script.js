const COMFYUI_URL = "http://gambar.ai:8188";
const MAX_SEED = BigInt("9007199254740991");
let currentSeedNum = 0;
let lastImageData = null;

const mainPresets = {
    none: { label: "Tidak Ada", prompts: {} },
    sfw: SFWPresets,
    nsfw: NSFWPresets,
};

// Cache DOM elements
const DOMCache = {};

function cacheDOMElements() {
    DOMCache.outputImage = document.getElementById("outputImage");
    DOMCache.imageActions = document.getElementById("imageActions");
    DOMCache.status = document.getElementById("status");
    DOMCache.prompt = document.getElementById("prompt");
    DOMCache.mainPreset = document.getElementById("main-preset");
    DOMCache.subcategory = document.getElementById("subcategory");
    DOMCache.error = document.getElementById("error");
}

window.onload = function () {
    const savedSeed = localStorage.getItem("lastSeed");

    if (savedSeed) document.getElementById("seed").value = savedSeed;

    if (DOMCache.outputImage && DOMCache.imageActions && DOMCache.status) {
        DOMCache.outputImage.src = "";
        DOMCache.outputImage.style.display = "none";
        DOMCache.imageActions.style.display = "none";
        DOMCache.status.style.display = "none";
        DOMCache.status.className = "";
        DOMCache.status.textContent = "";
    } else {
        console.error("Missing DOM elements in window.onload");
    }
};

function populateDropdowns() {
    const container = document.querySelector(".container");

    if (!container) return console.error("Container not found");

    const detailsContent = container.querySelector("details > div");

    if (!detailsContent) return console.error("Details content not found");

    if (!document.getElementById("checkpointFormGroup")) {
        const checkpointOptions = fetchCheckpointOptions();
        const checkpointFormGroup = document.createElement("div");
        checkpointFormGroup.id = "checkpointFormGroup";
        checkpointFormGroup.className = "form-group";

        const checkpointLabel = document.createElement("label");
        checkpointLabel.htmlFor = "checkpoint";
        checkpointLabel.textContent = "Checkpoint Model";

        const checkpointSelect = document.createElement("select");
        checkpointSelect.id = "checkpoint";
        checkpointSelect.name = "checkpoint";

        const groups = { Illustrious: [], Pony: [], SDXL: [], "SDXL Lightning": [] };
        let currentGroup = null;

        checkpointOptions.forEach((option) => {
            if (option.startsWith("---- ") && option.endsWith(" ----")) {
                const groupName = option.slice(5, -5).trim();

                if (groups.hasOwnProperty(groupName)) currentGroup = groupName;
            } else if (currentGroup) groups[currentGroup].push(option);
        });

        Object.keys(groups).forEach((groupName) => {
            const optgroup = document.createElement("optgroup");
            optgroup.label = groupName;

            groups[groupName].forEach((option) => {
                const optionElement = document.createElement("option");
                const mapping = checkpointNameMapping[option] || {};
                const displayName =
                    mapping.displayName ||
                    option.replace(/^(SDXL\/|SDXL-Lightning\/|Pony\/|Illustrious\/)/, "").replace(/\.safetensors$/, "");
                optionElement.value = option;
                optionElement.textContent = displayName;

                if (option === "SDXL-Lightning/lustifySDXLNSFW_v40DMD2.safetensors") optionElement.selected = true;

                optgroup.appendChild(optionElement);
            });

            checkpointSelect.appendChild(optgroup);
        });

        checkpointFormGroup.appendChild(checkpointLabel);
        checkpointFormGroup.appendChild(checkpointSelect);
        detailsContent.insertBefore(checkpointFormGroup, detailsContent.firstChild);
    }

    if (!document.getElementById("samplerFormGroup")) {
        const samplerOptions = fetchSamplerOptions();
        const samplerFormGroup = document.createElement("div");
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
            samplerSelect.appendChild(optionElement);
        });

        samplerFormGroup.appendChild(samplerLabel);
        samplerFormGroup.appendChild(samplerSelect);
        detailsContent.appendChild(samplerFormGroup);
    }

    if (!document.getElementById("upscalerFormGroup")) {
        const upscalerOptions = upscaleModels;
        const upscalerFormGroup = document.createElement("div");
        upscalerFormGroup.id = "upscalerFormGroup";
        upscalerFormGroup.className = "form-group";

        const upscalerLabel = document.createElement("label");
        upscalerLabel.htmlFor = "upscaler";
        upscalerLabel.textContent = "Upscaler";

        const upscalerSelect = document.createElement("select");
        upscalerSelect.id = "upscaler";
        upscalerSelect.name = "upscaler";

        upscalerOptions.forEach((option) => {
            const optionElement = document.createElement("option");
            optionElement.value = option;
            optionElement.textContent = option;

            if (option === "4x-UltraSharp.pth") optionElement.selected = true;

            upscalerSelect.appendChild(optionElement);
        });

        upscalerFormGroup.appendChild(upscalerLabel);
        upscalerFormGroup.appendChild(upscalerSelect);
        detailsContent.appendChild(upscalerFormGroup);
    }
}

function populatePresetDropdowns() {
    if (!DOMCache.mainPreset || !DOMCache.subcategory || !DOMCache.prompt) return;

    DOMCache.mainPreset.innerHTML = "";
    const noneOption = document.createElement("option");
    noneOption.value = "none";
    noneOption.textContent = "Tidak Ada";
    DOMCache.mainPreset.appendChild(noneOption);

    // SFW Preset
    const sfwOptgroup = document.createElement("optgroup");
    sfwOptgroup.label = "SFW";

    Object.keys(mainPresets.sfw).forEach((categoryKey) => {
        if (categoryKey === "none") return;

        const option = document.createElement("option");
        option.value = `sfw:${categoryKey}`;
        option.textContent = mainPresets.sfw[categoryKey].label;

        sfwOptgroup.appendChild(option);
    });

    DOMCache.mainPreset.appendChild(sfwOptgroup);

    // NSFW Preset
    const nsfwOptgroup = document.createElement("optgroup");
    nsfwOptgroup.label = "NSFW";

    Object.keys(mainPresets.nsfw).forEach((categoryKey) => {
        if (categoryKey === "none") return;

        const option = document.createElement("option");
        option.value = `nsfw:${categoryKey}`;
        option.textContent = mainPresets.nsfw[categoryKey].label;
        nsfwOptgroup.appendChild(option);
    });

    DOMCache.mainPreset.appendChild(nsfwOptgroup);

    DOMCache.mainPreset.addEventListener("change", () => {
        DOMCache.prompt.value = "";

        if (DOMCache.mainPreset.value === "none") {
            DOMCache.subcategory.parentElement.style.display = "none";
            DOMCache.subcategory.innerHTML = "";
            return;
        }

        DOMCache.subcategory.parentElement.style.display = "block";
        DOMCache.subcategory.innerHTML = "";
        const [categoryType, categoryKey] = DOMCache.mainPreset.value.split(":");
        const presetObject = mainPresets[categoryType];
        const categoryPrompts = presetObject[categoryKey].prompts;

        Object.keys(categoryPrompts).forEach((promptKey) => {
            const option = document.createElement("option");
            option.value = promptKey;
            option.textContent = promptKey.replace(
                /^\w+\s+\w+\s+(\d+)$/,
                (_, number) => `${presetObject[categoryKey].label} ${number}`
            );

            DOMCache.subcategory.appendChild(option);
        });

        if (DOMCache.subcategory.options.length > 0) {
            DOMCache.subcategory.value = DOMCache.subcategory.options[0].value;
            DOMCache.prompt.value = categoryPrompts[DOMCache.subcategory.value];
        }
    });

    DOMCache.subcategory.addEventListener("change", () => {
        const [categoryType, categoryKey] = DOMCache.mainPreset.value.split(":");
        const presetObject = mainPresets[categoryType];
        DOMCache.prompt.value = presetObject[categoryKey].prompts[DOMCache.subcategory.value] || "";
    });
}

function regenerateSelectedPreset() {
    if (!DOMCache.mainPreset || !DOMCache.subcategory || !DOMCache.prompt) return;

    const selectedValue = DOMCache.mainPreset.value;

    if (selectedValue === "none") return;

    const currentSubcategory = DOMCache.subcategory.value || "1";
    const [categoryType, categoryKey] = selectedValue.split(":");
    const presetObject = mainPresets[categoryType];
    let originalPreset = categoryType === "sfw" ? SFWPresets[categoryKey] : NSFWPresets[categoryKey];

    if (!originalPreset) {
        const normalizedCategoryKey = categoryKey
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
        originalPreset =
            categoryType === "sfw" ? SFWPresets[normalizedCategoryKey] : NSFWPresets[normalizedCategoryKey];
    }

    if (!originalPreset) {
        DOMCache.prompt.value = "Error: Preset not found for '" + categoryKey + "'.";

        return;
    }

    const originalPrompt = originalPreset.prompts["1"];
    const parts = originalPrompt.split(", ");
    const agePartIndex = parts.findIndex((part) => part.includes("year-old woman"));
    const hairPartIndex = parts.findIndex((part) => part.includes("hair"));

    if (agePartIndex === -1 || hairPartIndex === -1) {
        DOMCache.prompt.value = "Error: Unable to regenerate prompt due to invalid structure.";

        return;
    }

    const newPrompts = Array.from({ length: 10 }, () => {
        const newAge = randomAge();
        const newHair = `${randomHairAdjective()} ${randomHairStyles()} ${randomHairColours()}`;
        const newPromptParts = [...parts];
        newPromptParts[agePartIndex] = `${newAge}-year-old woman`;
        newPromptParts[hairPartIndex] = `${newHair} hair`;

        return newPromptParts.join(", ");
    }).reduce((acc, prompt, index) => {
        acc[index + 1] = prompt;

        return acc;
    }, {});

    presetObject[categoryKey].prompts = newPrompts;
    DOMCache.subcategory.parentElement.style.display = "block";
    DOMCache.subcategory.innerHTML = "";

    Object.keys(newPrompts).forEach((promptKey) => {
        const option = document.createElement("option");
        option.value = promptKey;
        option.textContent = promptKey.replace(
            /^\w+\s+\w+\s+(\d+)$/,
            (_, number) => `${presetObject[categoryKey].label} ${number}`
        );

        DOMCache.subcategory.appendChild(option);
    });

    DOMCache.subcategory.value = newPrompts[currentSubcategory] ? currentSubcategory : "1";
    DOMCache.prompt.value = newPrompts[DOMCache.subcategory.value];
}

document.addEventListener("DOMContentLoaded", () => {
    cacheDOMElements();
    populateDropdowns();
    populatePresetDropdowns();

    const checkpointSelect = document.getElementById("checkpoint");
    const samplerSelect = document.getElementById("sampler");
    const useLoRASelect = document.getElementById("useLoRA");
    const useClipSkipSelect = document.getElementById("useClipSkip");
    const clipSkipSet = document.getElementById("clip-skip");
    const stepsSelect = document.getElementById("steps");
    const cfgSelect = document.getElementById("cfg");
    const useUpscaleCheckbox = document.getElementById("useUpscale");
    const upscalerFormGroup = document.getElementById("upscalerFormGroup");
    const clipSkipFormGroup = document.getElementById("clipSkipFormGroup");

    if (checkpointSelect) {
        checkpointSelect.addEventListener("change", () => {
            workflow["4"]["inputs"]["ckpt_name"] = checkpointSelect.value;
            const mapping = checkpointNameMapping[checkpointSelect.value] || {};

            if (samplerSelect) samplerSelect.value = mapping.sampler || "dpmpp_2m";
            if (useLoRASelect) useLoRASelect.checked = mapping.lora ?? false;
            if (useClipSkipSelect) {
                useClipSkipSelect.checked = mapping.clip ?? false;
                clipSkipSet.value = mapping.clipskip ?? -2;
            }
            if (stepsSelect) stepsSelect.value = mapping.steps ?? 10;
            if (cfgSelect) cfgSelect.value = mapping.cfg ?? 1;
        });

        checkpointSelect.dispatchEvent(new Event("change"));
    }

    if (samplerSelect) {
        samplerSelect.addEventListener("change", () => {
            workflow["221"]["inputs"]["sampler_name"] = samplerSelect.value;
        });
    }

    clipSkipFormGroup?.classList.toggle("visible", useClipSkipSelect?.checked ?? false);
    useClipSkipSelect?.addEventListener("change", () => {
        clipSkipFormGroup?.classList.toggle("visible", useClipSkipSelect.checked);
    });

    upscalerFormGroup?.classList.toggle("visible", useUpscaleCheckbox?.checked ?? false);
    useUpscaleCheckbox?.addEventListener("change", () => {
        upscalerFormGroup?.classList.toggle("visible", useUpscaleCheckbox.checked);
    });

    DOMCache.outputImage?.addEventListener("click", () => {
        const lightbox = document.getElementById("lightbox");
        const lightboxImage = document.getElementById("lightboxImage");

        if (DOMCache.outputImage.src && DOMCache.outputImage.style.display !== "none" && lightbox && lightboxImage) {
            lightboxImage.src = DOMCache.outputImage.src;
            lightbox.style.display = "flex";
        }
    });

    document.getElementById("closeLightbox")?.addEventListener("click", () => {
        document.getElementById("lightbox").style.display = "none";
    });

    document.getElementById("lightbox")?.addEventListener("click", (e) => {
        if (e.target === e.currentTarget) e.currentTarget.style.display = "none";
    });
});

async function generateImage() {
    const inputs = {
        prompt: DOMCache.prompt?.value,
        promptNegative: document.getElementById("prompt-negative")?.value,
        useCheckpointCache: document.getElementById("useCheckpointCache")?.checked,
        useCustomVAE: document.getElementById("useCustomVAE")?.checked,
        clipSkip: document.getElementById("clip-skip")?.value,
        useLoRA: document.getElementById("useLoRA")?.checked,
        useClipSkip: document.getElementById("useClipSkip")?.checked,
        useUpscale: document.getElementById("useUpscale")?.checked,
        upscaleModel: document.getElementById("upscaler")?.value,
        steps: document.getElementById("steps")?.value,
        cfg: document.getElementById("cfg")?.value,
        imageMode: document.getElementById("imageMode")?.value,
        seed: document.getElementById("seed")?.value,
        useDynamicPrompt: document.getElementById("useDynamicPrompt")?.checked,
        alwaysRandomisePrompt: document.getElementById("alwaysRandomisePrompt")?.checked,
        useDynamicSeed: document.getElementById("useDynamicSeed")?.checked,
    };

    if (!inputs.prompt) {
        showError(DOMCache.error, "Deskripsi gambar tidak boleh kosong!");

        return;
    }

    if (!document.getElementById("checkpoint")) populateDropdowns();

    const checkpointSelect = document.getElementById("checkpoint");
    const samplerSelect = document.getElementById("sampler");

    if (!checkpointSelect || !samplerSelect) return showError(DOMCache.error, "Dropdowns tidak ditemukan!");

    showStatus(DOMCache.status, "<h4>Membuat gambar...</h4>");

    DOMCache.error.style.display = "none";
    DOMCache.outputImage.style.display = "none";
    DOMCache.imageActions.style.display = "none";
    document.querySelector("button").disabled = true;

    try {
        const steps = parseInt(inputs.steps);
        const cfg = parseFloat(inputs.cfg);
        const clipSkip = parseInt(inputs.clipSkip);

        if (isNaN(steps) || steps < 1 || steps > 100) throw new Error("Steps harus antara 1 dan 100!");
        if (isNaN(cfg) || cfg < 1 || cfg > 30) throw new Error("CFG harus antara 1 dan 30!");
        if (inputs.useClipSkip && (isNaN(clipSkip) || clipSkip < -10 || clipSkip > -1))
            throw new Error("CLIP Skip harus antara -1 dan -10!");

        workflow["4"]["inputs"]["ckpt_name"] = checkpointSelect.value;

        if (inputs.useCustomVAE) {
            workflow["47"]["inputs"]["vae"] = ["278", 0];

            if (inputs.useUpscale) {
                workflow["273"]["inputs"]["vae"] = ["278", 0];
            }
        } else {
            workflow["47"]["inputs"]["vae"] = ["4", 2];

            if (inputs.useUpscale) {
                workflow["273"]["inputs"]["vae"] = ["4", 2];
            }
        }

        if (inputs.useLoRA) {
            workflow["84"]["inputs"]["model"] = ["4", 0];
            workflow[inputs.useCheckpointCache ? "106" : "193"]["inputs"]["model"] = [
                inputs.useCheckpointCache ? "84" : "106",
                0,
            ];
        } else {
            workflow[inputs.useCheckpointCache ? "106" : "193"]["inputs"]["model"] = ["4", 0];
        }

        if (inputs.useClipSkip) {
            workflow["76"]["inputs"]["stop_at_clip_layer"] = clipSkip;
            workflow["76"]["inputs"]["clip"] = ["4", 1];
            workflow["84"]["inputs"]["clip"] = ["76", 0];
            workflow["103"]["inputs"]["clip"] = ["84", 1];
            workflow["259"]["inputs"]["clip"] = ["84", 1];
        } else {
            workflow["84"]["inputs"]["clip"] = ["4", 1];
            workflow["103"]["inputs"]["clip"] = ["84", 1];
            workflow["259"]["inputs"]["clip"] = ["84", 1];
        }

        workflow["260"]["inputs"]["text"] = inputs.prompt;
        workflow["171"]["inputs"]["custom_subject"] = inputs.prompt;
        workflow["103"]["inputs"]["text"] = `embedding:Stable_Yogis_PDXL_Negatives-neg, embedding:negativeXL_D, ${
            inputs.promptNegative || ""
        }`;
        workflow["218"]["inputs"]["cfg"] = cfg;
        workflow["252"]["inputs"]["steps"] = steps;
        workflow["221"]["inputs"]["sampler_name"] = samplerSelect.value;
        workflow["178:1"]["inputs"]["boolean"] = inputs.useDynamicPrompt;

        let seed =
            inputs.useDynamicSeed || !inputs.seed || isNaN(inputs.seed) || inputs.seed === "-1"
                ? (BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)) *
                      BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER))) %
                  (MAX_SEED + BigInt(1))
                : BigInt(inputs.seed);
        if (seed < BigInt(0) || seed > MAX_SEED) throw new Error(`Seed harus antara 0 dan ${MAX_SEED}!`);
        currentSeedNum = seed;
        workflow["171"]["inputs"]["seed"] = Number(seed);
        workflow["222"]["inputs"]["noise_seed"] = Number(seed);
        document.getElementById("seed").value = Number(seed);
        workflow["152"]["inputs"]["resolution"] =
            inputs.imageMode === "portrait"
                ? "896x1152 (0.78)"
                : inputs.imageMode === "landscape"
                ? "1152x896 (1.29)"
                : "1024x1024 (1.0)";

        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().split("T")[0];
        const formattedTime = `${String(currentDate.getHours()).padStart(2, "0")}-${String(
            currentDate.getMinutes()
        ).padStart(2, "0")}-${String(currentDate.getSeconds()).padStart(2, "0")}`;
        workflow["267"]["inputs"][
            "filename_prefix"
        ] = `webui-rated-r/${formattedDate}/${formattedTime}_${currentSeedNum}`;

        if (inputs.useUpscale) {
            Object.assign(workflow, upscaleNodes);

            workflow["273"]["inputs"]["seed"] = Number(seed);
            workflow["272"]["inputs"]["model_name"] = inputs.upscaleModel;
            workflow["274"]["inputs"]["any_01"] = ["273", 0];
            workflow["274"]["inputs"]["any_02"] = ["47", 0];
            workflow["267"]["inputs"]["images"] = ["274", 0];
        } else {
            ["272", "273", "274"].forEach((node) => delete workflow[node]);

            workflow["267"]["inputs"]["images"] = ["47", 0];
        }

        const response = await fetch(`${COMFYUI_URL}/prompt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: workflow, client_id: "webapp" }),
        }).catch((err) => {
            throw new Error(`Network error: ${err.message}`);
        });

        if (!response.ok) throw new Error(`Server error: ${response.status} - ${await response.text()}`);

        const { prompt_id } = await response.json();

        let imageUrl = null,
            attempts = 0,
            delay = 1000,
            maxAttempts = 60;

        while (!imageUrl && attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, delay));

            delay = Math.min(delay * 1.5, 5000);
            const history = await (await fetch(`${COMFYUI_URL}/history/${prompt_id}`)).json();

            if (history[prompt_id]?.outputs["267"]?.images?.[0]) {
                const imageData = history[prompt_id].outputs["267"].images[0];
                imageUrl = `${COMFYUI_URL}/view?filename=${imageData.filename}&subfolder=${imageData.subfolder}&type=${imageData.type}`;
                lastImageData = imageData;
            }

            attempts++;
        }

        if (!imageUrl) throw new Error("Gagal mengambil gambar setelah 60 detik.");

        DOMCache.outputImage.src = imageUrl;
        DOMCache.outputImage.style.display = "block";
        DOMCache.imageActions.style.display = "flex";

        const successMessage = `
            <details aria-expanded="false">
                <summary style="color: #8effb0;">Data Pembuatan Gambar</summary>
                <table class="success-table">
                    <tr><td>Positive Prompt:</td><td>${inputs.prompt}</td></tr>
                    <tr><td>Negative Prompt:</td><td>${inputs.promptNegative || "N/A"}</td></tr>
                    <tr><td>CLIP Skip:</td><td>${inputs.useClipSkip ? inputs.clipSkip : "Tidak Digunakan"}</td></tr>
                    <tr><td>Checkpoint:</td><td>${checkpointSelect.value}</td></tr>
                    <tr><td>Mode:</td><td>${inputs.imageMode.charAt(0).toUpperCase() + inputs.imageMode.slice(1)} - ${
            workflow["152"]["inputs"]["resolution"]
        }</td></tr>
                    <tr><td>Steps:</td><td>${steps}</td></tr>
                    <tr><td>CFG:</td><td>${cfg}</td></tr>
                    <tr><td>Seed:</td><td>${currentSeedNum}</td></tr>
                    <tr><td>Sampler:</td><td>${samplerSelect.value}</td></tr>
                    <tr><td>LoRA:</td><td>${inputs.useLoRA ? "Aktif" : "Tidak Aktif"}</td></tr>
                    <tr><td>Checkpoint Cache:</td><td>${inputs.useCheckpointCache ? "Aktif" : "Tidak Aktif"}</td></tr>
                    <tr><td>Upscale:</td><td>${inputs.useUpscale ? "Aktif" : "Tidak Aktif"}</td></tr>
                </table>
            </details>
        `;

        showStatus(DOMCache.status, successMessage, "success");

        localStorage.setItem("lastGeneratedImage", imageUrl);
        localStorage.setItem("lastSeed", currentSeedNum.toString());

        if (inputs.alwaysRandomisePrompt) regenerateSelectedPreset();

        (async () => {
            try {
                await loadImage(imageUrl);
                window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
            } catch (error) {
                showError(DOMCache.error, `Gagal memuat gambar: ${error.message}`);
            }
        })();
    } catch (err) {
        showError(DOMCache.error, err.message.includes("fetch") ? "Tidak dapat terhubung ke server!" : err.message);
    } finally {
        document.querySelector("button").disabled = false;
    }
}

async function deleteImage() {
    const button = document.querySelector(".delete");

    if (!lastImageData || !lastImageData.filename) {
        showError(DOMCache.error, "Tidak ada gambar yang dapat dihapus!");

        return;
    }

    showStatus(DOMCache.status, "<h4>Menghapus gambar...</h4>");

    button.disabled = true;

    try {
        const url = new URL(`${COMFYUI_URL}/comfyapi/v1/output-images/${encodeURIComponent(lastImageData.filename)}`);

        url.searchParams.append("temp", "false");
        url.searchParams.append("subfolder", lastImageData.subfolder);

        const response = await fetch(url, { method: "DELETE", headers: { "Content-Type": "application/json" } });

        if (!response.ok) throw new Error(`Gagal menghapus gambar: ${response.status} - ${await response.text()}`);
        if (document.getElementById("alwaysRandomisePrompt")?.checked) regenerateSelectedPreset();

        currentSeedNum = BigInt(document.getElementById("seed").value || "0");
        DOMCache.outputImage.src = "";
        DOMCache.outputImage.style.display = "none";
        DOMCache.imageActions.style.display = "none";
        document.getElementById("lightbox").style.display = "none";
        lastImageData = null;

        showStatus(DOMCache.status, "<h4>Gambar berhasil dihapus!</h4>", "success");
    } catch (err) {
        showError(DOMCache.error, `Gagal menghapus gambar: ${err.message}`);
    } finally {
        button.disabled = false;
    }
}

async function clearImage() {
    const button = document.querySelector(".clear");
    const seedInput = document.getElementById("seed");
    const useDynamicSeed = document.getElementById("useDynamicSeed")?.checked;

    showStatus(DOMCache.status, "<h4>Membersihkan gambar...</h4>");

    button.disabled = true;

    try {
        if (useDynamicSeed) {
            currentSeedNum =
                (BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)) *
                    BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER))) %
                (MAX_SEED + BigInt(1));
            workflow["171"]["inputs"]["seed"] = Number(currentSeedNum);
            workflow["222"]["inputs"]["noise_seed"] = Number(currentSeedNum);

            if (document.getElementById("useUpscale")?.checked)
                workflow["273"]["inputs"]["seed"] = Number(currentSeedNum);

            seedInput.value = Number(currentSeedNum);
        }

        if (document.getElementById("alwaysRandomisePrompt")?.checked) regenerateSelectedPreset();

        DOMCache.outputImage.src = "";
        DOMCache.outputImage.style.display = "none";
        DOMCache.imageActions.style.display = "none";

        document.getElementById("lightbox").style.display = "none";

        showStatus(DOMCache.status, `<h4>Seed baru: ${currentSeedNum}</h4>`, "success");
    } catch (err) {
        showError(DOMCache.error, "Gagal membersihkan gambar!");
    } finally {
        button.disabled = false;
    }
}

function loadImage(imageUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageUrl;
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(new Error(`Gagal memuat gambar: ${e.message}`));
    });
}

function showStatus(statusElement, message, type = "") {
    if (!statusElement) return;

    statusElement.innerHTML = message;
    statusElement.style.display = "block";
    statusElement.className = type;

    if (type !== "success")
        setTimeout(() => {
            if (statusElement.className !== "success") statusElement.style.display = "none";
        }, 5000);
}

function showError(errorElement, message) {
    if (!errorElement) return;

    errorElement.textContent = message;
    errorElement.style.display = "block";

    setTimeout(() => (errorElement.style.display = "none"), 5000);
}
