// Global variables
const COMFYUI_URL = "https://comfyui.blackmarch.net";
const TOKEN = "$2b$12$DjTDRWrTlVeXtWEULcZVpefMfMcn2GplL8qikphsp1GRm5FqtOWkq";
const MAX_SEED = BigInt("9007199254740991");
let currentSeedNum = 0;
let lastImageData = null;

const mainPresets = {
    none: { label: "Tidak Ada", prompts: {} },
    sfw: SFWPresets,
    nsfw: NSFWPresets,
};

// Cache DOM Elements
const DOMCache = {};

/**
 * Fungsi untuk menyimpan referensi ke elemen-elemen DOM dalam objek DOMCache.
 *
 * Fungsi ini akan mencari elemen-elemen DOM dengan id yang sesuai dan
 * menyimpan referensi ke elemen-elemen tersebut dalam objek DOMCache.
 *
 * @returns {void}
 */
function cacheDOMElements() {
    DOMCache.outputImage = document.getElementById("outputImage");
    DOMCache.imageActions = document.getElementById("imageActions");
    DOMCache.status = document.getElementById("status");
    DOMCache.prompt = document.getElementById("prompt");
    DOMCache.mainPreset = document.getElementById("main-preset");
    DOMCache.subcategory = document.getElementById("subcategory");
    DOMCache.error = document.getElementById("error");
}

/**
 * Fungsi yang dijalankan ketika halaman web selesai dimuat.
 *
 * Fungsi ini akan memulihkan nilai seed yang tersimpan di localStorage
 * dan mengatur elemen-elemen DOM untuk menampilkan hasil output.
 *
 * @returns {void}
 */
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

/**
 * Mengisi dropdown menu dengan opsi-opsi yang diperlukan.
 *
 * Fungsi ini akan menciptakan elemen-elemen dropdown untuk checkpoint model,
 * sampler, dan upscaler jika belum ada. Kemudian, akan mengisi dropdown
 * dengan opsi-opsi yang diperlukan.
 *
 * @returns {void}
 */
function populateDropdowns() {
    const container = document.querySelector(".container");

    if (!container) return console.error("Container not found");

    const detailsContent = container.querySelector("details > div");

    if (!detailsContent) return console.error("Details content not found");

    // Checkpoint Dropdowns
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

        const groups = { DMD2: [], Illustrious: [], Pony: [], SDXL: [], "SDXL Lightning": [] };
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
                    option
                        .replace(/^(SDXL\/|SDXL-Lightning\/|Pony\/|Illustrious\/|DMD2\/)/, "")
                        .replace(/\.safetensors$/, "");
                optionElement.value = option;
                optionElement.textContent = displayName;

                if (option === "DMD2/lustifySDXLNSFW_v40DMD2.safetensors") optionElement.selected = true;

                optgroup.appendChild(optionElement);
            });

            checkpointSelect.appendChild(optgroup);
        });

        checkpointFormGroup.appendChild(checkpointLabel);
        checkpointFormGroup.appendChild(checkpointSelect);
        detailsContent.insertBefore(checkpointFormGroup, detailsContent.firstChild);
    }

    // Sampler Dropdowns
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

    // Upscaler Dropdowns
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

            if (option === "4x-ClearRealityV1.pth") optionElement.selected = true;

            upscalerSelect.appendChild(optionElement);
        });

        upscalerFormGroup.appendChild(upscalerLabel);
        upscalerFormGroup.appendChild(upscalerSelect);
        detailsContent.appendChild(upscalerFormGroup);
    }
}

/**
 * Fungsi yang mengisi dropdown preset dengan data.
 *
 * @description Fungsi ini mengisi dropdown preset dengan data dari objek mainPresets.
 */
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

/**
 * Fungsi yang meregenerasi preset yang dipilih.
 *
 * @description Fungsi ini meregenerasi preset yang dipilih berdasarkan nilai dropdown main preset dan subcategory.
 */
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

/**
 * Fungsi yang dijalankan ketika dokumen telah selesai dimuat.
 *
 * @description Fungsi ini memuat elemen-elemen DOM, mengisi dropdown, dan menambahkan event listener untuk berbagai elemen.
 */
document.addEventListener("DOMContentLoaded", () => {
    cacheDOMElements();
    populateDropdowns();
    populatePresetDropdowns();

    const checkpointSelect = document.getElementById("checkpoint");
    const samplerSelect = document.getElementById("sampler");
    const useLoRASelect = document.getElementById("useLoRA");
    const useDMD2Select = document.getElementById("useDMD2");
    const useClipSkipSelect = document.getElementById("useClipSkip");
    const clipSkipSet = document.getElementById("clip-skip");
    const stepsSelect = document.getElementById("steps");
    const cfgSelect = document.getElementById("cfg");
    const useUpscaleCheckbox = document.getElementById("useUpscale");
    const upscalerFormGroup = document.getElementById("upscalerFormGroup");
    const clipSkipFormGroup = document.getElementById("clipSkipFormGroup");
    const useDynamicSeedCheckbox = document.getElementById("useDynamicSeed");
    const useIncrementalSeedCheckbox = document.getElementById("useIncrementalSeed");

    // Seed
    function toggleSeedCheckboxes(sourceCheckbox, targetCheckbox) {
        if (sourceCheckbox.checked) {
            targetCheckbox.checked = false;
            targetCheckbox.disabled = true;
        } else {
            targetCheckbox.disabled = false;
        }
    }

    // toggleSeedCheckboxes(useLoRASelect, useDMD2Select);
    toggleSeedCheckboxes(useDynamicSeedCheckbox, useIncrementalSeedCheckbox);

    useLoRASelect.addEventListener("change", () => {
        if (!useLoRASelect.checked) {
            useDMD2Select.checked = false;
            useDMD2Select.disabled = true;
        } else {
            useDMD2Select.checked = false;
            useDMD2Select.disabled = false;
        }
    });

    useDynamicSeedCheckbox.addEventListener("change", () => {
        toggleSeedCheckboxes(useDynamicSeedCheckbox, useIncrementalSeedCheckbox);
    });

    useIncrementalSeedCheckbox.addEventListener("change", () => {
        toggleSeedCheckboxes(useIncrementalSeedCheckbox, useDynamicSeedCheckbox);
    });

    // Checkpoint
    if (checkpointSelect) {
        checkpointSelect.addEventListener("change", () => {
            workflow["4"]["inputs"]["ckpt_name"] = checkpointSelect.value;
            const mapping = checkpointNameMapping[checkpointSelect.value] || {};

            if (samplerSelect) samplerSelect.value = mapping.sampler || "lcm";
            if (useLoRASelect) useLoRASelect.checked = mapping.lora ?? false;
            if (useDMD2Select) useDMD2Select.checked = mapping.dmd2 ?? false;
            if (useClipSkipSelect) {
                useClipSkipSelect.checked = mapping.clip ?? false;
                clipSkipSet.value = mapping.clipskip ?? -2;
            }
            if (stepsSelect) stepsSelect.value = mapping.steps ?? 10;
            if (cfgSelect) cfgSelect.value = mapping.cfg ?? 1;
        });

        checkpointSelect.dispatchEvent(new Event("change"));
    }

    // Sampler
    if (samplerSelect) {
        samplerSelect.addEventListener("change", () => {
            workflow["221"]["inputs"]["sampler_name"] = samplerSelect.value;
        });
    }

    // CLIP Skip
    clipSkipFormGroup?.classList.toggle("visible", useClipSkipSelect?.checked ?? false);
    useClipSkipSelect?.addEventListener("change", () => {
        clipSkipFormGroup?.classList.toggle("visible", useClipSkipSelect.checked);
    });

    // Upscaling
    upscalerFormGroup?.classList.toggle("visible", useUpscaleCheckbox?.checked ?? false);
    useUpscaleCheckbox?.addEventListener("change", () => {
        upscalerFormGroup?.classList.toggle("visible", useUpscaleCheckbox.checked);
    });

    // Lightbox
    DOMCache.outputImage?.addEventListener("click", () => {
        const lightbox = document.getElementById("lightbox");
        const lightboxImage = document.getElementById("lightboxImage");

        if (DOMCache.outputImage.src && DOMCache.outputImage.style.display !== "none" && lightbox && lightboxImage) {
            lightboxImage.src = DOMCache.outputImage.src;
            lightbox.style.display = "flex";
            lightbox.scrollIntoView({ behavior: "smooth" });
        }
    });

    document.getElementById("closeLightbox")?.addEventListener("click", () => {
        document.getElementById("lightbox").style.display = "none";
    });

    document.getElementById("lightbox")?.addEventListener("click", (e) => {
        if (e.target === e.currentTarget) e.currentTarget.style.display = "none";
    });
});

/**
 * Menghasilkan gambar berdasarkan input pengguna dan pengaturan.
 *
 * @async
 * @fungsi generateImage
 * @returns {Promise<void>}
 *
 * @deskripsi Fungsi ini menghasilkan gambar berdasarkan input pengguna seperti prompt, prompt negatif, checkpoint, sampler, dan pengaturan lainnya.
 * Fungsi ini mengirimkan permintaan ke server untuk menghasilkan gambar dan kemudian menampilkan gambar yang dihasilkan di halaman.
 *
 * @throws {Error} Jika input pengguna tidak valid (misalnya prompt kosong, checkpoint tidak valid, dll.).
 * @throws {Error} Jika terjadi kesalahan jaringan saat mengirimkan permintaan ke server.
 *
 * @global {Object} workflow - Objek yang mewakili alur kerja proses penghasilan gambar.
 * @global {string} COMFYUI_URL - URL server yang menghasilkan gambar.
 * @global {Object} DOMCache - Objek yang menyimpan elemen DOM untuk akses yang mudah.
 */
async function generateImage() {
    const inputs = {
        prompt: DOMCache.prompt?.value,
        promptNegative: document.getElementById("prompt-negative")?.value,
        useCheckpointCache: document.getElementById("useCheckpointCache")?.checked,
        useDMD2: document.getElementById("useDMD2")?.checked,
        clipSkip: document.getElementById("clip-skip")?.value,
        useLoRA: document.getElementById("useLoRA")?.checked,
        useCustomClip: document.getElementById("useCustomClip")?.checked,
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
        useIncrementalSeed: document.getElementById("useIncrementalSeed")?.checked,
    };

    if (!inputs.prompt) {
        showError(DOMCache.error, "Deskripsi gambar tidak boleh kosong!");

        return;
    }

    // Daftar Checkpoint
    if (!document.getElementById("checkpoint")) populateDropdowns();

    // Dropdown Checkpoint/Sampler
    const checkpointSelect = document.getElementById("checkpoint");
    const samplerSelect = document.getElementById("sampler");

    if (!checkpointSelect || !samplerSelect)
        return showError(DOMCache.error, "Dropdown Checkpoint/Sampler tidak ditemukan!");

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

        // Checkpoints
        workflow["4"]["inputs"]["ckpt_name"] = checkpointSelect.value;

        // LoRA
        if (inputs.useLoRA) {
            workflow["84"]["inputs"]["model"] = ["4", 0];
            workflow[inputs.useCheckpointCache ? "106" : "193"]["inputs"]["model"] = [
                inputs.useCheckpointCache ? "84" : "106",
                0,
            ];

            if (inputs.useDMD2) workflow["84"]["inputs"]["lora_1"]["on"] = true;
            else workflow["84"]["inputs"]["lora_1"]["on"] = false;
        } else {
            workflow[inputs.useCheckpointCache ? "106" : "193"]["inputs"]["model"] = ["4", 0];
        }

        // CLIP Skip
        if (inputs.useClipSkip) {
            // Custom CLIP
            if (inputs.useCustomClip) workflow["76"]["inputs"]["clip"] = ["268", 0];
            else workflow["76"]["inputs"]["clip"] = ["4", 1];

            workflow["76"]["inputs"]["stop_at_clip_layer"] = clipSkip;
            workflow["84"]["inputs"]["clip"] = ["76", 0];
            workflow["103"]["inputs"]["clip"] = ["84", 1];
            workflow["259"]["inputs"]["clip"] = ["84", 1];
        } else {
            // Custom CLIP
            if (inputs.useCustomClip) workflow["84"]["inputs"]["clip"] = ["268", 0];
            else workflow["84"]["inputs"]["clip"] = ["4", 1];

            workflow["103"]["inputs"]["clip"] = ["84", 1];
            workflow["259"]["inputs"]["clip"] = ["84", 1];
        }

        // Prompt Generator
        workflow["178:1"]["inputs"]["boolean"] = inputs.useDynamicPrompt;

        // Positive Prompt
        workflow["260"]["inputs"]["text"] = inputs.prompt;
        workflow["171"]["inputs"]["custom_subject"] = inputs.prompt;

        // Negative Prompt
        workflow["103"]["inputs"]["text"] = `${
            inputs.promptNegative || ""
        }, embedding:Stable_Yogis_PDXL_Negatives-neg, embedding:negativeXL_D`;

        // CFG
        workflow["218"]["inputs"]["cfg"] = cfg;

        // Steps
        workflow["252"]["inputs"]["steps"] = steps;

        // Sampler
        workflow["221"]["inputs"]["sampler_name"] = samplerSelect.value;

        // Seeds
        let seed;

        if (inputs.useIncrementalSeed) {
            seed = BigInt(currentSeedNum) + BigInt(1);
            if (seed > MAX_SEED) seed = BigInt(0);
        } else if (inputs.useDynamicSeed || !inputs.seed || isNaN(inputs.seed) || inputs.seed === "-1") {
            seed =
                (BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)) *
                    BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER))) %
                (MAX_SEED + BigInt(1));
        } else {
            seed = BigInt(inputs.seed);
        }

        if (seed < BigInt(0) || seed > MAX_SEED) throw new Error(`Seed harus antara 0 dan ${MAX_SEED}!`);

        currentSeedNum = seed;
        workflow["171"]["inputs"]["seed"] = Number(seed);
        workflow["222"]["inputs"]["noise_seed"] = Number(seed);
        document.getElementById("seed").value = Number(seed);

        // Image Mode
        workflow["152"]["inputs"]["resolution"] =
            inputs.imageMode === "portrait"
                ? "896x1152 (0.78)"
                : inputs.imageMode === "landscape"
                ? "1152x896 (1.29)"
                : "1024x1024 (1.0)";

        // Filename
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().split("T")[0];
        const formattedTime = `${String(currentDate.getHours()).padStart(2, "0")}-${String(
            currentDate.getMinutes()
        ).padStart(2, "0")}-${String(currentDate.getSeconds()).padStart(2, "0")}`;
        workflow["267"]["inputs"][
            "filename_prefix"
        ] = `webui-rated-r/${formattedDate}/${formattedTime}_${currentSeedNum}`;

        // Upscaling
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

        const response = await fetch(`${COMFYUI_URL}/prompt?token=${TOKEN}`, {
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
            maxAttempts = 60; // masa tunggu 60 detik (1 menit)

        while (!imageUrl && attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, delay));

            delay = Math.min(delay * 1.5, 5000);
            const history = await (await fetch(`${COMFYUI_URL}/history/${prompt_id}?token=${TOKEN}`)).json();

            if (history[prompt_id]?.outputs["267"]?.images?.[0]) {
                const imageData = history[prompt_id].outputs["267"].images[0];
                imageUrl = `${COMFYUI_URL}/view?filename=${imageData.filename}&subfolder=${imageData.subfolder}&type=${imageData.type}&token=${TOKEN}`;
                lastImageData = imageData;
            }

            attempts++;
        }

        if (!imageUrl) throw new Error("Gagal mengambil gambar setelah 60 detik.");

        DOMCache.outputImage.src = imageUrl;
        DOMCache.outputImage.style.display = "block";
        DOMCache.imageActions.style.display = "flex";

        // Tampilkan informasi gambar
        const successMessage = `
            <details aria-expanded="false">
                <summary style="color: #8effb0;">Informasi Gambar</summary>
                <table class="success-table">
                    <tr><td>Positive Prompt:</td><td>${inputs.prompt}</td></tr>
                    <tr><td>Negative Prompt:</td><td>${inputs.promptNegative || "N/A"}</td></tr>
                    <tr><td>Checkpoint:</td><td>${checkpointSelect.value}</td></tr>
                    <tr><td>Checkpoint Cache:</td><td>${inputs.useCheckpointCache ? "Aktif" : "Tidak Aktif"}</td></tr>
                    <tr><td>Custom CLIP:</td><td>${inputs.useCustomClip ? "Aktif" : "Tidak Aktif"}</td></tr>
                    <tr><td>CLIP Skip:</td><td>${inputs.useClipSkip ? inputs.clipSkip : "Tidak Digunakan"}</td></tr>
                    <tr><td>LoRA:</td><td>${inputs.useLoRA ? "Aktif" : "Tidak Aktif"}</td></tr>
                    <tr><td>DMD2:</td><td>${inputs.useDMD2 ? "Aktif" : "Tidak Aktif"}</td></tr>
                    <tr><td>Mode:</td><td>${inputs.imageMode.charAt(0).toUpperCase() + inputs.imageMode.slice(1)} - ${
            workflow["152"]["inputs"]["resolution"]
        }</td></tr>
                    <tr><td>Steps:</td><td>${steps}</td></tr>
                    <tr><td>CFG:</td><td>${cfg}</td></tr>
                    <tr><td>Seed:</td><td>${currentSeedNum}</td></tr>
                    <tr><td>Sampler:</td><td>${samplerSelect.value}</td></tr>
                    <tr><td>Upscale:</td><td>${inputs.useUpscale ? "Aktif" : "Tidak Aktif"}</td></tr>
                </table>
            </details>
        `;

        showStatus(DOMCache.status, successMessage, "success");

        // Simpan gambar dan seed ke localStorage
        localStorage.setItem("lastGeneratedImage", imageUrl);
        localStorage.setItem("lastSeed", currentSeedNum.toString());

        // Acak Prompt
        if (inputs.alwaysRandomisePrompt) regenerateSelectedPreset();

        (async () => {
            try {
                await loadImage(imageUrl);
                window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
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

/**
 * Fungsi untuk menghapus gambar secara permanen dari server.
 *
 * Fungsi ini akan mengatur status, menonaktifkan tombol delete,
 * mengirimkan permintaan DELETE ke API untuk menghapus gambar,
 * dan menampilkan status sukses jika proses menghapus gambar
 * berhasil. Jika proses menghapus gambar gagal, maka akan
 * menampilkan error.
 *
 * @async
 * @returns {void}
 */
async function deleteImage() {
    const button = document.querySelector(".delete");

    if (!lastImageData || !lastImageData.filename) {
        showError(DOMCache.error, "Tidak ada gambar yang dapat dihapus!");

        return;
    }

    showStatus(DOMCache.status, "<h4>Menghapus gambar...</h4>");

    button.disabled = true;

    // Menghapus Gambar
    try {
        const url = new URL(`${COMFYUI_URL}/comfyapi/v1/output-images/${encodeURIComponent(lastImageData.filename)}?token=${TOKEN}`);

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

/**
 * Fungsi untuk membersihkan gambar yang sedang ditampilkan.
 *
 * Fungsi ini akan mengatur status, menonaktifkan tombol clear,
 * membersihkan gambar, dan menampilkan status sukses jika proses
 * membersihkan gambar berhasil. Jika proses membersihkan gambar
 * gagal, maka akan menampilkan error.
 *
 * @async
 * @returns {void}
 */
async function clearImage() {
    const button = document.querySelector(".clear");

    showStatus(DOMCache.status, "<h4>Membersihkan gambar...</h4>");

    button.disabled = true;

    // Membersihkan Gambar
    try {
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

/**
 * Fungsi untuk memuat gambar dari URL yang ditentukan.
 *
 * Fungsi ini akan mengembalikan promise yang akan diselesaikan dengan objek gambar jika gambar berhasil dimuat, atau ditolak dengan error jika gambar gagal dimuat.
 *
 * @param {string} imageUrl URL gambar yang akan dimuat.
 * @returns {Promise<Image>} Promise yang akan diselesaikan dengan objek gambar.
 */
function loadImage(imageUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageUrl;
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(new Error(`Gagal memuat gambar: ${e.message}`));
    });
}

/**
 * Fungsi untuk menampilkan status pada elemen yang ditentukan.
 *
 * Fungsi ini akan menampilkan status pada elemen yang ditentukan
 * dengan tipe yang ditentukan. Jika tipe tidak ditentukan, maka
 * status akan ditampilkan selama 5 detik.
 *
 * @param {HTMLElement} statusElement Elemen yang akan menampilkan status.
 * @param {string} message Pesan status yang akan ditampilkan.
 * @param {string} [type=""] Tipe status yang akan ditampilkan.
 * @returns {void}
 */
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

/**
 * Fungsi untuk menampilkan pesan error pada elemen yang ditentukan.
 *
 * Fungsi ini akan menampilkan pesan error pada elemen yang ditentukan
 * selama 5 detik, kemudian akan menyembunyikan elemen tersebut.
 *
 * @param {HTMLElement} errorElement Elemen yang akan menampilkan pesan error.
 * @param {string} message Pesan error yang akan ditampilkan.
 * @returns {void}
 */
function showError(errorElement, message) {
    if (!errorElement) return;

    errorElement.textContent = message;
    errorElement.style.display = "block";

    setTimeout(() => (errorElement.style.display = "none"), 5000);
}
