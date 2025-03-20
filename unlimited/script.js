const COMFYUI_URL = "http://gambar.ai:8188";
const MAX_SEED = BigInt("9007199254740991");
let currentSeedNum = 0;
let lastImageData = null;

const mainPresets = {
    none: { label: "Tidak Ada", prompts: {} },
    sfw: SFWPresets,
    nsfw: NSFWPresets,
};

// Fungsi yang dijalankan saat halaman dimuat
window.onload = function () {
    const outputImage = document.getElementById("outputImage");
    const imageActions = document.getElementById("imageActions");
    const status = document.getElementById("status");
    const savedSeed = localStorage.getItem("lastSeed");

    // Mengatur nilai seed terakhir jika ada
    if (savedSeed) document.getElementById("seed").value = savedSeed;

    // Mengosongkan dan menyembunyikan elemen gambar serta aksi
    outputImage.src = "";
    outputImage.style.display = "none";
    imageActions.style.display = "none";
    status.style.display = "none";
    status.className = "";
    status.textContent = "";
};

// Mengisi dropdown untuk opsi checkpoint & sampler
// Mengisi dropdown untuk opsi checkpoint, sampler
function populateDropdowns() {
    const container = document.querySelector(".container");
    const detailsContent = container.querySelector("details > div");

    let checkpointFormGroup = document.getElementById("checkpointFormGroup");

    // Membuat dropdown checkpoint jika belum ada
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

        // Define checkpoint groups
        const groups = {
            Illustrious: [],
            Pony: [],
            SDXL: [],
            "SDXL Lightning": [],
        };

        // Populate groups from checkpoint options
        let currentGroup = null;
        checkpointOptions.forEach((option) => {
            if (option.startsWith("---- ") && option.endsWith(" ----")) {
                const groupName = option.slice(5, -5).trim();
                if (groups.hasOwnProperty(groupName)) {
                    currentGroup = groupName;
                }
            } else if (currentGroup) {
                groups[currentGroup].push(option);
            }
        });

        // Create optgroups for each category
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

                if (option === "SDXL-Lightning/lustifySDXLNSFW_v40DMD2.safetensors") {
                    optionElement.selected = true;
                }

                optgroup.appendChild(optionElement);
            });

            checkpointSelect.appendChild(optgroup);
        });

        checkpointFormGroup.appendChild(checkpointLabel);
        checkpointFormGroup.appendChild(checkpointSelect);
        detailsContent.insertBefore(checkpointFormGroup, detailsContent.firstChild);
    }

    // Membuat dropdown sampler jika belum ada
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

            // Default sampler will be set dynamically by checkpoint selection
            // Remove the hardcoded default to "lcm"
            // if (option === "lcm") optionElement.selected = true;

            samplerSelect.appendChild(optionElement);
        });

        samplerFormGroup.appendChild(samplerLabel);
        samplerFormGroup.appendChild(samplerSelect);
        detailsContent.appendChild(samplerFormGroup);
    }
}

// Mengisi dropdown preset utama
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

        // Event listener untuk perubahan preset utama
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

        // Event listener untuk perubahan subkategori
        subcategorySelect.addEventListener("change", () => {
            const selectedValue = presetSelect.value;
            const [categoryType, categoryKey] = selectedValue.split(":");
            const selectedSubcategory = subcategorySelect.value;
            const presetObject = mainPresets[categoryType];
            promptTextarea.value = presetObject[categoryKey].prompts[selectedSubcategory] || "";
        });
    }
}

// Fungsi untuk meregenerasi preset yang dipilih
function regenerateSelectedPreset() {
    const presetSelect = document.getElementById("main-preset");
    const subcategoryContainer = document.getElementById("subcategory-container");
    const subcategorySelect = document.getElementById("subcategory");
    const promptTextarea = document.getElementById("prompt");

    if (!presetSelect || !subcategoryContainer || !subcategorySelect || !promptTextarea) return;

    const selectedValue = presetSelect.value;
    console.log("[DEBUG] Selected Value:", selectedValue);
    if (selectedValue === "none") return;

    const currentSubcategory = subcategorySelect.value || "1";
    console.log("[DEBUG] Current Subcategory:", currentSubcategory);

    const [categoryType, categoryKey] = selectedValue.split(":");
    console.log("[DEBUG] Category Type:", categoryType, "Category Key:", categoryKey);

    const presetObject = mainPresets[categoryType];
    console.log("[DEBUG] Preset Object:", presetObject);

    let originalPreset = categoryType === "sfw" ? SFWPresets[categoryKey] : NSFWPresets[categoryKey];
    if (!originalPreset) {
        const normalizedCategoryKey = categoryKey
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
        originalPreset =
            categoryType === "sfw" ? SFWPresets[normalizedCategoryKey] : NSFWPresets[normalizedCategoryKey];
        console.log("[DEBUG] Trying Normalized Key:", normalizedCategoryKey);
    }

    if (!originalPreset) {
        console.error("[ERROR] Preset not found for key:", categoryKey);
        promptTextarea.value = "Error: Preset not found for '" + categoryKey + "'. Please check preset configuration.";
        return;
    }

    const originalPrompt = originalPreset.prompts["1"];
    console.log("[DEBUG] Original Prompt:", originalPrompt);

    // Parse the original prompt dynamically
    const parts = originalPrompt.split(", ");
    let agePartIndex = parts.findIndex((part) => part.includes("year-old woman"));
    let hairPartIndex = parts.findIndex((part) => part.includes("hair"));

    if (agePartIndex === -1 || hairPartIndex === -1) {
        console.error("[ERROR] Could not parse age or hair from prompt:", originalPrompt);

        return;
    }

    // Extract and replace age and hair dynamically
    const newProfiles = Array.from({ length: 10 }, () => {
        const newAge = randomAge();
        const newHair = `${randomHairAdjective()} ${randomHairStyles()} ${randomHairColours()}`;
        const newPromptParts = [...parts];

        // Replace age
        newPromptParts[agePartIndex] = `${newAge}-year-old woman`;

        // Replace hair
        newPromptParts[hairPartIndex] = `${newHair} hair`;

        return newPromptParts.join(", ");
    });

    // Store new prompts with numeric keys
    const newPrompts = newProfiles.reduce((acc, prompt, index) => {
        acc[index + 1] = prompt;

        return acc;
    }, {});

    presetObject[categoryKey].prompts = newPrompts;

    subcategoryContainer.style.display = "block";
    subcategorySelect.innerHTML = "";

    Object.keys(newPrompts).forEach((promptKey) => {
        const option = document.createElement("option");
        option.value = promptKey;
        option.textContent = promptKey.replace(
            /^\w+\s+\w+\s+(\d+)$/,
            (match, number) => `${presetObject[categoryKey].label} ${number}`
        );

        subcategorySelect.appendChild(option);
    });

    subcategorySelect.value = newPrompts[currentSubcategory] ? currentSubcategory : "1";
    promptTextarea.value = newPrompts[subcategorySelect.value];

    console.log(
        "[DEBUG] Regenerated - Preset:",
        selectedValue,
        "Subcategory:",
        subcategorySelect.value,
        "Prompt:",
        promptTextarea.value
    );
}

// Inisialisasi event listener saat DOM dimuat
document.addEventListener("DOMContentLoaded", () => {
    populateDropdowns();
    populatePresetDropdowns();

    const checkpointSelect = document.getElementById("checkpoint");
    const samplerSelect = document.getElementById("sampler");
    const useLoRASelect = document.getElementById("useLoRA");
    const useClipSkipSelect = document.getElementById("useClipSkip");
    const clipSkipSet = document.getElementById("clip-skip");
    const stepsSelect = document.getElementById("steps");
    const cfgSelect = document.getElementById("cfg");

    if (checkpointSelect) {
        checkpointSelect.addEventListener("change", () => {
            workflow["4"]["inputs"]["ckpt_name"] = checkpointSelect.value;

            console.log("Checkpoint disetel ke:", checkpointSelect.value);

            // Mapping
            const mapping = checkpointNameMapping[checkpointSelect.value] || {};

            // Sampler
            if (samplerSelect) {
                const preferredSampler = mapping.sampler || "dpmpp_2m"; // Default ke "dpmpp_2m"
                samplerSelect.value = preferredSampler;
                workflow["221"]["inputs"]["sampler_name"] = preferredSampler;

                console.log("Sampler secara otomatis disetel ke:", preferredSampler);
            } else {
                console.error("Dropdown untuk Sampler tidak ditemukan!");
            }

            // LoRA
            if (useLoRASelect) {
                const preferredLoRA = mapping.lora ?? false; // Default ke "false"
                useLoRASelect.checked = preferredLoRA;

                console.log("Sampler secara otomatis disetel ke:", preferredLoRA);
            } else {
                console.error("Checkbox untuk LoRA tidak ditemukan!");
            }

            // CLIP Skip
            if (useClipSkipSelect) {
                const preferredClipSkip = mapping.clip ?? false; // Default ke "false"
                useClipSkipSelect.checked = preferredClipSkip;

                const useclipSkip = mapping.clipskip ?? -2; // Default ke "-2"
                clipSkipSet.value = useclipSkip;

                console.log("CLIP Skip secara otomatis disetel ke:", preferredClipSkip);
                console.log("Nilai CLIP Skip secara otomatis disetel ke:", useclipSkip);
            } else {
                console.error("Checkbox untuk CLIP Skip tidak ditemukan!");
            }

            // Steps
            if (stepsSelect) {
                stepsSelect.value = mapping.steps ?? 10; // Default ke 10

                console.log("Steps secara otomatis disetel ke:", stepsSelect.value);
            }

            // CFG
            if (cfgSelect) {
                cfgSelect.value = mapping.cfg ?? 1; // Default ke 1

                console.log("CFG secara otomatis disetel ke:", cfgSelect.value);
            }
        });

        checkpointSelect.dispatchEvent(new Event("change"));
    }

    if (samplerSelect) {
        samplerSelect.addEventListener("change", () => {
            workflow["221"]["inputs"]["sampler_name"] = samplerSelect.value;

            console.log("Sampler disetel ke:", samplerSelect.value);
        });
    }

    // Event listener untuk lightbox gambar
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

function loadImage(imageUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous"; // Tambahkan untuk mengatasi potensi CORS
        img.src = imageUrl;

        img.onload = () => resolve(img);
        img.onerror = (e) => reject(new Error(`Gagal memuat gambar di ${imageUrl}: ${e.message}`));
    });
}

// Fungsi untuk menghasilkan gambar
async function generateImage() {
    const promptInput = document.getElementById("prompt").value;
    const promptNegativeInput = document.getElementById("prompt-negative").value;
    const useCheckpointCache = document.getElementById("useCheckpointCache").checked;
    const clipSkipInput = document.getElementById("clip-skip").value;
    const useLoRA = document.getElementById("useLoRA").checked;
    const useClipSkip = document.getElementById("useClipSkip").checked;
    const stepsInput = document.getElementById("steps").value;
    const cfgInput = document.getElementById("cfg").value;
    const imageMode = document.getElementById("imageMode").value;
    const seedInput = document.getElementById("seed").value;
    const useDynamicPrompt = document.getElementById("useDynamicPrompt").checked;
    const alwaysRandomisePrompt = document.getElementById("alwaysRandomisePrompt").checked;
    const useDynamicSeed = document.getElementById("useDynamicSeed").checked;
    const status = document.getElementById("status");
    const error = document.getElementById("error");
    const button = document.querySelector("button");
    const outputImage = document.getElementById("outputImage");
    const imageActions = document.getElementById("imageActions");

    // Validasi input prompt
    if (!promptInput) {
        showError(error, "Deskripsi gambar tidak boleh kosong!");

        return;
    }

    if (!document.getElementById("checkpoint")) populateDropdowns();

    showStatus(status, "<h4>Membuat gambar...</h4>");

    error.style.display = "none";
    outputImage.style.display = "none";
    imageActions.style.display = "none";
    button.disabled = true;

    try {
        const steps = parseInt(stepsInput);
        const cfg = parseFloat(cfgInput);
        const clipSkip = parseInt(clipSkipInput);

        // Validasi input numerik
        if (isNaN(steps) || steps < 1 || steps > 100) throw new Error("Steps harus antara 1 dan 100!");
        if (isNaN(cfg) || cfg < 1 || cfg > 30) throw new Error("CFG harus antara 1 dan 30!");
        if (useClipSkip && (isNaN(clipSkip) || clipSkip < -10 || clipSkip > -1))
            throw new Error("CLIP Skip harus berupa angka antara -1 dan -10!");

        const checkpointSelect = document.getElementById("checkpoint");
        const samplerSelect = document.getElementById("sampler");

        if (!checkpointSelect || !samplerSelect) {
            throw new Error("Dropdowns tidak ditemukan!");
        }

        // Mengatur checkpoint dasar
        workflow["4"]["inputs"]["ckpt_name"] = checkpointSelect.value;

        // Mengatur koneksi model berdasarkan useLoRA dan useCheckpointCache
        if (useLoRA) {
            workflow["84"]["inputs"]["model"] = ["4", 0];

            if (useCheckpointCache) {
                workflow["106"]["inputs"]["model"] = ["84", 0];
                workflow["193"]["inputs"]["model"] = ["106", 0];
            } else {
                workflow["193"]["inputs"]["model"] = ["84", 0];
            }
        } else {
            if (useCheckpointCache) {
                workflow["106"]["inputs"]["model"] = ["4", 0];
                workflow["193"]["inputs"]["model"] = ["106", 0];
            } else {
                workflow["193"]["inputs"]["model"] = ["4", 0];
            }
        }

        // Mengatur koneksi CLIP berdasarkan useClipSkip dan useLoRA
        if (useClipSkip) {
            workflow["76"]["inputs"]["stop_at_clip_layer"] = clipSkip;
            workflow["76"]["inputs"]["clip"] = useLoRA ? ["84", 1] : ["4", 1];
            workflow["103"]["inputs"]["clip"] = ["76", 0];
            workflow["178:2"]["inputs"]["clip"] = ["76", 0];
        } else {
            workflow["103"]["inputs"]["clip"] = useLoRA ? ["84", 1] : ["4", 1];
            workflow["178:2"]["inputs"]["clip"] = useLoRA ? ["84", 1] : ["4", 1];
        }

        // Mengatur prompt dan parameter lainnya dengan nilai terbaru
        workflow["178:0"]["inputs"]["text"] = promptInput;
        workflow["171"]["inputs"]["custom_subject"] = promptInput;
        workflow["103"]["inputs"]["text"] = promptNegativeInput;
        workflow["218"]["inputs"]["cfg"] = cfg;
        workflow["219"]["inputs"]["interpolate_to_steps"] = steps;
        workflow["221"]["inputs"]["sampler_name"] = samplerSelect.value;
        workflow["178:1"]["inputs"]["boolean"] = useDynamicPrompt;

        // Menentukan seed secara acak atau manual
        if (useDynamicSeed || !seedInput || isNaN(seedInput) || seedInput === "-1") {
            const randomValue =
                BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)) *
                BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
            const seed = randomValue % (MAX_SEED + BigInt(1));
            currentSeedNum = seed;
            workflow["171"]["inputs"]["seed"] = Number(seed);
            workflow["222"]["inputs"]["noise_seed"] = Number(seed);
            seedInput.value = Number(seed);
        } else {
            const seedNum = BigInt(seedInput);

            if (seedNum < BigInt(0) || seedNum > MAX_SEED) throw new Error(`Seed harus antara 0 dan ${MAX_SEED}!`);

            currentSeedNum = seedNum;
            workflow["171"]["inputs"]["seed"] = Number(seedNum);
            workflow["222"]["inputs"]["noise_seed"] = Number(seedNum);
            seedInput.value = Number(seedNum);
        }

        // Mengatur resolusi berdasarkan mode gambar
        if (imageMode === "portrait") workflow["152"]["inputs"]["resolution"] = "896x1152 (0.78)";
        else if (imageMode === "landscape") workflow["152"]["inputs"]["resolution"] = "1152x896 (1.29)";
        else if (imageMode === "square") workflow["152"]["inputs"]["resolution"] = "1024x1024 (1.0)";

        // Mengatur prefix nama file berdasarkan tanggal dan seed
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().split("T")[0];
        const hours = String(currentDate.getHours()).padStart(2, "0");
        const minutes = String(currentDate.getMinutes()).padStart(2, "0");
        const seconds = String(currentDate.getSeconds()).padStart(2, "0");
        const formattedTime = `${hours}-${minutes}-${seconds}`;
        workflow["217"]["inputs"][
            "filename_prefix"
        ] = `webui-rated-r/${formattedDate}/${formattedTime}_${currentSeedNum}`;

        console.log("[DEBUG] Parameter pembuatan gambar:", {
            checkpoint: workflow["4"]["inputs"]["ckpt_name"],
            sampler: workflow["221"]["inputs"]["sampler_name"],
            seed: workflow["222"]["inputs"]["noise_seed"],
            steps: steps,
            cfg: cfg,
            imageMode: imageMode,
            useDynamicPrompt: useDynamicPrompt,
            useLoRA: useLoRA,
            useClipSkip: useClipSkip,
            useCheckpointCache: useCheckpointCache,
            prompt: promptInput,
            filename_prefix: workflow["217"]["inputs"]["filename_prefix"],
        });

        // Mengirim permintaan ke server
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

        // Menunggu dan mengambil URL gambar yang dihasilkan
        let imageUrl = null;
        let attempts = 0;
        const maxAttempts = 60;

        while (!imageUrl && attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const historyResponse = await fetch(`${COMFYUI_URL}/history/${prompt_id}`);
            const history = await historyResponse.json();
            console.log("[DEBUG] History response:", history);

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

        if (!imageUrl) throw new Error("Gagal mengambil gambar setelah 60 detik.");

        // Menampilkan gambar yang dihasilkan
        outputImage.src = imageUrl;
        outputImage.style.display = "block";
        imageActions.style.display = "flex";

        const successMessage = `
            <details aria-expanded="false">
                <summary style="color: #8effb0;">Data Pembuatan Gambar</summary>
                <table class="success-table">
                    <tr><td>Positive Prompt:</td><td>${promptInput}</td></tr>
                    <tr><td>Negative Prompt:</td><td>${promptNegativeInput}</td></tr>
                    <tr><td>CLIP Skip:</td><td>${useClipSkip ? clipSkip : "Tidak Digunakan"}</td></tr>
                    <tr><td>Checkpoint:</td><td>${checkpointSelect.value}</td></tr>
                    <tr><td>Mode:</td><td>${imageMode.charAt(0).toUpperCase() + imageMode.slice(1)} - ${
            workflow["152"]["inputs"]["resolution"]
        }</td></tr>
                    <tr><td>Steps:</td><td>${steps}</td></tr>
                    <tr><td>CFG:</td><td>${cfg}</td></tr>
                    <tr><td>Seed:</td><td>${currentSeedNum}</td></tr>
                    <tr><td>Sampler:</td><td>${samplerSelect.value}</td></tr>
                    <tr><td>LoRA:</td><td>${useLoRA ? "Aktif" : "Tidak Aktif"}</td></tr>
                    <tr><td>Checkpoint Cache:</td><td>${useCheckpointCache ? "Aktif" : "Tidak Aktif"}</td></tr>
                </table>
            </details>
        `;

        showStatus(status, successMessage, "success");

        localStorage.setItem("lastGeneratedImage", imageUrl);
        localStorage.setItem("lastSeed", currentSeedNum);

        // Meregenerasi preset hanya jika alwaysRandomisePrompt diaktifkan
        if (alwaysRandomisePrompt) regenerateSelectedPreset();

        // Scroll ke bawah halaman setelah gambar berhasil dibuat & ditampilkan
        (async () => {
            try {
                const img = await loadImage(imageUrl);

                window.scrollTo({
                    top: document.documentElement.scrollHeight,
                    behavior: "smooth",
                });
                console.log("Gambar berhasil dimuat:", img);
            } catch (error) {
                console.error("Kesalahan saat memuat gambar:", error.message);
                showError(error, `Gagal memuat gambar: ${error.message}`);
            }
        })();
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

// Fungsi untuk menghapus gambar dari server
async function deleteImage() {
    const status = document.getElementById("status");
    const error = document.getElementById("error");
    const outputImage = document.getElementById("outputImage");
    const imageActions = document.getElementById("imageActions");
    const button = document.querySelector(".delete");
    const lightbox = document.getElementById("lightbox");
    const seedInput = document.getElementById("seed");
    const alwaysRandomisePrompt = document.getElementById("alwaysRandomisePrompt").checked;

    if (!lastImageData || !lastImageData.filename) {
        showError(error, "Tidak ada gambar yang dapat dihapus!");

        return;
    }

    showStatus(status, "<h4>Menghapus gambar...</h4>");

    button.disabled = true;

    try {
        const url = new URL(`${COMFYUI_URL}/comfyapi/v1/output-images/${encodeURIComponent(lastImageData.filename)}`);
        url.searchParams.append("temp", "false");
        url.searchParams.append("subfolder", lastImageData.subfolder);

        console.log("URL permintaan DELETE:", url.toString());

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

        // Regenerasi prompt hanya jika alwaysRandomisePrompt diaktifkan
        if (alwaysRandomisePrompt) {
            regenerateSelectedPreset();
        }

        // Simpan seed terakhir sebelum menghapus data gambar
        if (seedInput.value) {
            currentSeedNum = BigInt(seedInput.value);
        }

        outputImage.src = "";
        outputImage.style.display = "none";
        imageActions.style.display = "none";
        lightbox.style.display = "none";
        lastImageData = null;

        showStatus(status, "<h4>Gambar berhasil dihapus!</h4>", "success");
    } catch (err) {
        console.error("Kesalahan penghapusan:", err);
        showError(error, `Gagal menghapus gambar: ${err.message}`);
    } finally {
        button.disabled = false;
    }
}

// Fungsi untuk mereset tampilan gambar tanpa menghapus dari server
async function clearImage() {
    const status = document.getElementById("status");
    const outputImage = document.getElementById("outputImage");
    const imageActions = document.getElementById("imageActions");
    const lightbox = document.getElementById("lightbox");
    const seedInput = document.getElementById("seed");
    const useDynamicSeed = document.getElementById("useDynamicSeed").checked;
    const button = document.querySelector(".clear");

    if (!status || !outputImage || !imageActions || !lightbox || !seedInput || !button) {
        console.error("[DEBUG] Elemen DOM hilang di clearImage:", {
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

    showStatus(status, "<h4>Membersihkan gambar...</h4>");

    button.disabled = true;

    try {
        if (useDynamicSeed) {
            const randomValue =
                BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)) *
                BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
            currentSeedNum = randomValue % (MAX_SEED + BigInt(1));
            workflow["171"]["inputs"]["seed"] = Number(currentSeedNum);
            workflow["222"]["inputs"]["noise_seed"] = Number(currentSeedNum);
            seedInput.value = Number(currentSeedNum);

            console.log("[DEBUG] Seed randomized in clearImage:", Number(currentSeedNum));
        }

        // Regenerasi prompt hanya jika alwaysRandomisePrompt diaktifkan
        if (alwaysRandomisePrompt) {
            regenerateSelectedPreset();
        }

        outputImage.src = "";
        outputImage.style.display = "none";
        imageActions.style.display = "none";
        lightbox.style.display = "none";

        showStatus(status, `<h4>Seed baru: ${currentSeedNum}</h4>`, "success");
    } catch (err) {
        console.error("[DEBUG] Kesalahan di clearImage:", err);
        showError(document.getElementById("error"), "Gagal membersihkan gambar!");
    } finally {
        button.disabled = false;
    }
}

// Menampilkan status dengan pesan tertentu
function showStatus(statusElement, message, type = "") {
    statusElement.innerHTML = message;
    statusElement.style.display = "block";
    statusElement.className = type;

    if (type !== "success")
        setTimeout(() => {
            if (statusElement.className !== "success") statusElement.style.display = "none";
        }, 5000);
}

// Menampilkan pesan error
function showError(errorElement, message) {
    errorElement.textContent = message;
    errorElement.style.display = "block";

    setTimeout(() => (errorElement.style.display = "none"), 5000);
}
