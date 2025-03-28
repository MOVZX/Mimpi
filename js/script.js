// Global variables
const TOKEN = "$2b$12$DjTDRWrTlVeXtWEULcZVpefMfMcn2GplL8qikphsp1GRm5FqtOWkq";
const MAX_SEED = BigInt("9007199254740991");
let currentSeedNum = 0;
let lastImageData = null;

const ACCESS_URL = {
    localhost: "http://localhost:8188",
    "mimpi.blackmarch.net": "https://comfyui.blackmarch.net",
    "192.168.8.3": "http://192.168.8.3:8188",
    "10.42.0.1": "http://10.42.0.1:8188",
};

const COMFYUI_URL = ACCESS_URL[window.location.hostname] || "http://localhost:8188";

// Check if NSFW should be enabled based on URL query parameter
const urlParams = new URLSearchParams(window.location.search);
const isUnlocked = urlParams.has("unlock");

const mainPresets = {
    none: { label: "Tidak Ada", prompts: {} },
    general: GeneralPresets,
    ...(isUnlocked && { sfw: SFWPresets }),
    ...(isUnlocked && { nsfw: NSFWPresets }),
};

if (isUnlocked) {
    document.getElementById("prompt").value =
        "1girl, solo, wanita berusia 30 tahun, rambut pirang, mengenakan pakaian hijab yang tertutup, kamar tidur, detail rumit, instagram, pose dinamis, melihat pemirsa, potret, tampilan dekat seluruh tubuh bagian atas, resolusi tinggi, kualitas terbaik";
} else {
    document.getElementById("prompt").value =
        "Foto kucing yang sangat detail dan nyata. Gambar tersebut menampilkan anatomi yang akurat, tekstur bulu, bulu halus, atau kulit yang realistis, mata yang tampak nyata, dan pencahayaan alami. Tidak ada makhluk mitos atau fantasi, hanya hewan yang ada, yang digambarkan dalam resolusi 8k yang tajam dan cemerlang dengan kualitas terbaik.";

    const useDynamicPromptCheckbox = document.getElementById("useDynamicPrompt");

    if (useDynamicPromptCheckbox) {
        useDynamicPromptCheckbox.checked = true;
        useDynamicPromptCheckbox.dispatchEvent(new Event("change"));
    }

    const alwaysRandomisePromptCheckbox = document.getElementById("alwaysRandomisePrompt");
    const alwaysRandomisePromptLabel = document.querySelector(`label[for="alwaysRandomisePrompt"]`);

    alwaysRandomisePromptCheckbox?.remove();
    alwaysRandomisePromptLabel?.remove();
}

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
 * sampler, scheduler, dan upscaler jika belum ada. Kemudian, akan mengisi dropdown
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

        let groups = { DMD2: [], Illustrious: [], Pony: [], SDXL: [], "SDXL Lightning": [] };
        let currentGroup = null;

        if (!isUnlocked) groups = { SDXL: [], "SDXL Lightning": [] };

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
                const nsfw = mapping.nsfw;

                if (!(isUnlocked === false && nsfw)) {
                    optionElement.value = option;
                    optionElement.textContent = displayName;

                    if (isUnlocked) {
                        if (option === "SDXL/realisticLustXL_v05.safetensors") {
                            optionElement.selected = true;
                        }
                    } else {
                        if (option === "SDXL/epicjuggernautxl_vxvXI.safetensors") {
                            optionElement.selected = true;
                        }
                    }

                    optgroup.appendChild(optionElement);
                }
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

    // Scheduler Dropdowns
    if (!document.getElementById("schedulerFormGroup")) {
        const schedulerOptions = fetchSchedulerOptions();
        const schedulerFormGroup = document.createElement("div");
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
            schedulerSelect.appendChild(optionElement);
        });

        schedulerFormGroup.appendChild(schedulerLabel);
        schedulerFormGroup.appendChild(schedulerSelect);
        detailsContent.appendChild(schedulerFormGroup);
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

    // LoRA Options (already exists in HTML, so we'll populate it)
    const loraOptions = ["Detail Tweaker", "Breast Slider", "Beautify Supermodel"];
    const loraFormGroup = document.getElementById("loraFormGroup");
    const loraCheckboxGroup = document.createElement("div");
    loraCheckboxGroup.className = "form-group";

    loraOptions.forEach((option, index) => {
        const checkboxWrapper = document.createElement("div");
        checkboxWrapper.className = "checkbox-wrapper";

        const input = document.createElement("input");
        input.type = "checkbox";
        input.id = `useLoRA${index + 1}`;
        input.checked = true;

        const label = document.createElement("label");
        label.htmlFor = `useLoRA${index + 1}`;
        label.textContent = option;

        checkboxWrapper.appendChild(input);
        checkboxWrapper.appendChild(label);
        loraCheckboxGroup.appendChild(checkboxWrapper);
    });

    loraFormGroup.appendChild(loraCheckboxGroup);
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

    // General Preset
    const generalOptgroup = document.createElement("optgroup");
    generalOptgroup.label = "General";

    Object.keys(mainPresets.general).forEach((categoryKey) => {
        if (categoryKey === "none") return;

        const option = document.createElement("option");
        option.value = `general:${categoryKey}`;
        option.textContent = mainPresets.general[categoryKey].label;

        generalOptgroup.appendChild(option);
    });

    DOMCache.mainPreset.appendChild(generalOptgroup);

    // SFW & NSFW Preset
    if (isUnlocked) {
        // SFW
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

        // NSFW
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
    }

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
    if (!isUnlocked || !DOMCache.mainPreset || !DOMCache.subcategory || !DOMCache.prompt) return;

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
    const schedulerSelect = document.getElementById("scheduler");
    const useLoRASelect = document.getElementById("useLoRA");
    const useDMD2Select = document.getElementById("useDMD2");
    const useClipSkipSelect = document.getElementById("useClipSkip");
    const clipSkipSet = document.getElementById("clip-skip");
    const stepsSelect = document.getElementById("steps");
    const cfgSelect = document.getElementById("cfg");
    const useUpscaleCheckbox = document.getElementById("useUpscale");
    const upscalerFormGroup = document.getElementById("upscalerFormGroup");
    const loraFormGroup = document.getElementById("loraFormGroup");
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
            if (schedulerSelect) schedulerSelect.value = mapping.scheduler || "exponential";
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
            workflow["279"]["inputs"]["sampler_name"] = samplerSelect.value;
        });
    }

    // Scheduler
    if (schedulerSelect) {
        schedulerSelect.addEventListener("change", () => {
            workflow["279"]["inputs"]["scheduler"] = schedulerSelect.value;
        });
    }

    // LoRAs
    loraFormGroup?.classList.toggle("visible", useLoRASelect?.checked ?? false);
    useLoRASelect?.addEventListener("change", () => {
        loraFormGroup?.classList.toggle("visible", useLoRASelect.checked);
    });

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
 * @deskripsi Fungsi ini menghasilkan gambar berdasarkan input pengguna seperti prompt, prompt negatif, checkpoint, sampler, scheduler, dan pengaturan lainnya.
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
    const schedulerSelect = document.getElementById("scheduler");

    if (!checkpointSelect || !samplerSelect || !schedulerSelect)
        return showError(DOMCache.error, "Dropdown Checkpoint/Sampler/Scheduler tidak ditemukan!");

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
        Object.assign(workflow, loras);

        const useLoRA1 = document.getElementById("useLoRA1")?.checked;
        const useLoRA2 = document.getElementById("useLoRA2")?.checked;
        const useLoRA3 = document.getElementById("useLoRA3")?.checked;

        if (inputs.useLoRA) {
            workflow["193"]["inputs"]["model"] = [inputs.useCheckpointCache ? "106" : "84", 0];

            // DMD2
            workflow["84"]["inputs"]["lora_1"]["on"] = inputs.useDMD2 ? true : false;

            // LoRA 1
            workflow["84"]["inputs"]["lora_2"]["on"] = useLoRA1 ? true : false;

            // LoRA 2
            workflow["84"]["inputs"]["lora_3"]["on"] = useLoRA2 ? true : false;

            // LoRA 3
            workflow["84"]["inputs"]["lora_4"]["on"] = useLoRA3 ? true : false;
        } else {
            workflow["193"]["inputs"]["model"] = [inputs.useCheckpointCache ? "106" : "84", 0];

            // DMD2
            workflow["84"]["inputs"]["lora_1"]["on"] = inputs.useDMD2 ? true : false;

            // LoRAs
            workflow["84"]["inputs"]["lora_2"]["on"] = false;
            workflow["84"]["inputs"]["lora_3"]["on"] = false;
            workflow["84"]["inputs"]["lora_4"]["on"] = false;
        }

        // CLIP Skip
        if (inputs.useClipSkip) {
            // Custom CLIP
            workflow["76"]["inputs"]["clip"] = inputs.useCustomClip ? ["268", 0] : ["4", 1];

            workflow["76"]["inputs"]["stop_at_clip_layer"] = clipSkip;
            workflow["84"]["inputs"]["clip"] = ["76", 0];
            workflow["103"]["inputs"]["clip"] = ["84", 1];
            workflow["259"]["inputs"]["clip"] = ["84", 1];
        } else {
            // Custom CLIP
            workflow["76"]["inputs"]["clip"] = inputs.useCustomClip ? ["268", 0] : ["4", 1];

            workflow["103"]["inputs"]["clip"] = ["84", 1];
            workflow["259"]["inputs"]["clip"] = ["84", 1];
        }

        // Prompt Generator
        workflow["178:1"]["inputs"]["boolean"] = inputs.useDynamicPrompt;

        // Positive Prompt
        workflow["278"]["inputs"]["prompt"] = inputs.prompt;

        // Negative Prompt
        workflow["103"]["inputs"]["text"] = `${
            inputs.promptNegative || ""
        }, embedding:Stable_Yogis_PDXL_Negatives-neg, embedding:CyberRealistic_Negative_SDXL-neg`;

        // CFG
        workflow["279"]["inputs"]["cfg"] = cfg;

        // Steps
        workflow["279"]["inputs"]["steps"] = steps;

        // Sampler
        workflow["279"]["inputs"]["sampler_name"] = samplerSelect.value;

        // Scheduler
        workflow["279"]["inputs"]["scheduler"] = schedulerSelect.value;

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
        workflow["279"]["inputs"]["seed"] = Number(seed);
        document.getElementById("seed").value = Number(seed);

        // Image Mode
        workflow["152"]["inputs"]["resolution"] =
            inputs.imageMode === "portrait-hd"
                ? "1024x1536 (0.67)"
                : inputs.imageMode === "portrait"
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

        if (!isUnlocked) workflow["267"]["inputs"]["filename_prefix"] = `webui/${formattedDate}/${formattedTime}`;
        else workflow["267"]["inputs"]["filename_prefix"] = `webui-rated-r/${formattedDate}/${formattedTime}`;

        // Upscaling
        if (inputs.useUpscale) {
            Object.assign(workflow, upscaleNodes);

            workflow["273"]["inputs"]["seed"] = Number(seed);
            workflow["272"]["inputs"]["model_name"] = inputs.upscaleModel;
            workflow["274"]["inputs"]["any_01"] = ["273", 0];
            workflow["274"]["inputs"]["any_02"] = ["47", 0];

            // Terapkan NudeNet Censorship
            if (!isUnlocked) {
                Object.assign(workflow, censoredNode);

                workflow["267"]["inputs"]["images"] = ["277", 0];
            } else {
                workflow["267"]["inputs"]["images"] = ["274", 0];
            }
        } else {
            ["272", "273", "274"].forEach((node) => delete workflow[node]);

            // Terapkan NudeNet Censorship
            if (!isUnlocked) {
                Object.assign(workflow, censoredNode);

                workflow["267"]["inputs"]["images"] = ["277", 0];
            } else {
                workflow["267"]["inputs"]["images"] = ["47", 0];
            }
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
                    <tr><td>Scheduler:</td><td>${schedulerSelect.value}</td></tr>
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
        const url = new URL(
            `${COMFYUI_URL}/comfyapi/v1/output-images/${encodeURIComponent(lastImageData.filename)}?token=${TOKEN}`
        );

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
 * Fungsi untuk mengunduh gambar yang dihasilkan.
 *
 * Fungsi ini akan mengunduh gambar yang dihasilkan
 * dengan menggunakan nama file `generated-image-<nomor-seed>.png`.
 * Jika proses mengunduh gambar gagal, maka akan
 * menampilkan error.
 *
 * @async
 * @returns {void}
 */
async function downloadImage() {
    const outputImage = document.getElementById("outputImage");
    const imageUrl = outputImage.src;

    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `generated-image-${workflow["171"]["inputs"]["seed"]}.png`;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (err) {
        showError(document.getElementById("error"), "Gagal mengunduh gambar: " + err.message);
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
