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

// Mengisi dropdown untuk opsi checkpoint, sampler, dan scheduler
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

            if (option === "lcm") optionElement.selected = true;

            samplerSelect.appendChild(optionElement);
        });

        samplerFormGroup.appendChild(samplerLabel);
        samplerFormGroup.appendChild(samplerSelect);
        detailsContent.appendChild(samplerFormGroup);
    }

    // Membuat dropdown scheduler jika belum ada
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
    if (selectedValue === "none") return; // Tidak perlu regenerasi jika tidak ada preset yang dipilih

    const [categoryType, categoryKey] = selectedValue.split(":");
    const presetObject = mainPresets[categoryType];

    // Mendapatkan definisi preset asli dari SFWPresets atau NSFWPresets
    const originalPreset = categoryType === "sfw" ? SFWPresets[categoryKey] : NSFWPresets[categoryKey];
    if (!originalPreset) return;

    // Mendapatkan room dari label preset (misalnya, "bedroom" dari "Missionary Passion")
    const room = categoryKey.split(" ")[0]; // Asumsi kata pertama adalah room

    // Membuat profil baru dengan nilai acak
    const newProfiles = Array.from({ length: 10 }, () => ({
        hairstyle: randomHairStyles(),
        haircolour: randomHairColours(),
        hairAdjective: randomHairAdjective(),
        age: randomAge(),
        attire: originalPreset.prompts["1"].split(", ")[4].replace("wearing ", ""), // Mengambil attire dari prompt pertama
    }));

    // Meregenerasi prompts
    const newPrompts = generatePrompts(room, newProfiles);

    // Memperbarui mainPresets dengan prompts baru
    presetObject[categoryKey].prompts = newPrompts;

    // Memperbarui dropdown subcategory
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

    // Mengatur prompt textarea ke prompt pertama yang baru
    if (subcategorySelect.options.length > 0) {
        subcategorySelect.value = subcategorySelect.options[0].value;
        promptTextarea.value = newPrompts[subcategorySelect.value];
    }
    console.log("[DEBUG] Prompt diperbarui ke:", promptTextarea.value); // Tambahkan log untuk debugging
}

// Inisialisasi event listener saat DOM dimuat
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
        const schedulerSelect = document.getElementById("scheduler");

        if (!checkpointSelect || !samplerSelect || !schedulerSelect) {
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
        workflow["105"]["inputs"]["steps"] = steps;
        workflow["105"]["inputs"]["cfg"] = cfg;
        workflow["105"]["inputs"]["sampler_name"] = samplerSelect.value;
        workflow["105"]["inputs"]["scheduler"] = schedulerSelect.value;
        workflow["178:1"]["inputs"]["boolean"] = useDynamicPrompt;

        // Menentukan seed secara acak atau manual
        if (useDynamicSeed || !seedInput || isNaN(seedInput) || seedInput === "-1") {
            const randomValue =
                BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)) *
                BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
            const seed = randomValue % (MAX_SEED + BigInt(1));
            currentSeedNum = seed;
            workflow["105"]["inputs"]["seed"] = Number(seed);
            workflow["171"]["inputs"]["seed"] = Number(seed);
            seedInput.value = Number(seed);
        } else {
            const seedNum = BigInt(seedInput);

            if (seedNum < BigInt(0) || seedNum > MAX_SEED) throw new Error(`Seed harus antara 0 dan ${MAX_SEED}!`);

            currentSeedNum = seedNum;
            workflow["105"]["inputs"]["seed"] = Number(seedNum);
            workflow["171"]["inputs"]["seed"] = Number(seedNum);
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
            sampler: workflow["105"]["inputs"]["sampler_name"],
            scheduler: workflow["105"]["inputs"]["scheduler"],
            seed: workflow["105"]["inputs"]["seed"],
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
                    <tr><td>Scheduler:</td><td>${schedulerSelect.value}</td></tr>
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
    const useDynamicSeed = document.getElementById("useDynamicSeed").checked;
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

        // Tidak mengacak seed jika useDynamicSeed tidak dicentang
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
            workflow["105"]["inputs"]["seed"] = Number(currentSeedNum);
            workflow["171"]["inputs"]["seed"] = Number(currentSeedNum);
            seedInput.value = Number(currentSeedNum);

            console.log("[DEBUG] Seed randomized in clearImage:", Number(currentSeedNum));
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
