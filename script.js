const COMFYUI_URL = "http://gambar.ai:8188";
let currentSeedNum = 0;

window.onload = function () {
    const outputImage = document.getElementById("outputImage");
    const imageActions = document.getElementById("imageActions");
    const status = document.getElementById("status");

    outputImage.src = "";
    outputImage.style.display = "none";
    imageActions.style.display = "none";
    status.style.display = "none";
    status.className = "";
    status.textContent = "";
};

function fetchCheckpointOptions() {
    const baseCheckpoints = [
        "agxl_LightningV10.safetensors",
        "dreamshaperXL_lightningDPMSDE.safetensors",
        "Epicrealismxl_Hades.safetensors",
        "jibMixRealisticXL_v10Lightning46Step.safetensors",
        "juggernautXL_v9Rdphoto2Lightning.safetensors",
        "realvisxlV50_v50LightningBakedvae.safetensors",
    ];

    return baseCheckpoints.map((ckpt) => `SDXL-Lightning/${ckpt}`);
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
            const displayName = option.replace("SDXL-Lightning/", "");
            optionElement.value = option;
            optionElement.textContent = displayName;

            if (option === "SDXL-Lightning/realvisxlV50_v50LightningBakedvae.safetensors")
                optionElement.selected = true;

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

            if (option === "euler_ancestral") optionElement.selected = true;

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
            workflow["17"]["inputs"]["sampler_name"] = samplerSelect.value;

            console.log("Sampler updated to:", samplerSelect.value);
        });
    }

    const schedulerSelect = document.getElementById("scheduler");

    if (schedulerSelect) {
        schedulerSelect.addEventListener("change", () => {
            workflow["17"]["inputs"]["scheduler"] = schedulerSelect.value;

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
        if (e.target === lightbox) lightbox.style.display = "none";
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
            workflow["56"]["inputs"]["text"] = promptInput;
            workflow["22"]["inputs"]["custom_subject"] = promptInput;
            workflow["17"]["inputs"]["steps"] = steps;
            workflow["17"]["inputs"]["cfg"] = cfg;
            workflow["17"]["inputs"]["sampler_name"] = samplerSelect.value;
            workflow["17"]["inputs"]["scheduler"] = schedulerSelect.value;
            workflow["70:1"]["inputs"]["boolean"] = useDynamicPrompt;
        } else {
            throw new Error("Checkpoint, Sampler, or Scheduler dropdown not found!");
        }

        const MAX_SEED = BigInt("18446744073709551615");

        if (!seedInput || isNaN(seedInput) || seedInput === "-1") {
            const randomValue =
                BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)) *
                BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
            const seed = randomValue % (MAX_SEED + BigInt(1));
            currentSeedNum = seed;
            workflow["17"]["inputs"]["seed"] = Number(seed);
            workflow["22"]["inputs"]["seed"] = Number(seed);
        } else {
            const seedNum = BigInt(seedInput);

            if (seedNum < BigInt(0) || seedNum > MAX_SEED) throw new Error(`Seed harus antara 0 dan ${MAX_SEED}!`);

            currentSeedNum = seedNum;
            workflow["17"]["inputs"]["seed"] = Number(seedNum);
            workflow["22"]["inputs"]["seed"] = Number(seedNum);
        }

        if (imageMode === "portrait") workflow["18"]["inputs"]["resolution"] = "896x1152 (0.78)";
        else if (imageMode === "landscape") workflow["18"]["inputs"]["resolution"] = "1152x896 (1.29)";

        const formatDateISO = (date) => {
            const isoString = date.toISOString();
            const formattedDate = isoString.split("T")[0];

            return formattedDate;
        };

        const currentDate = new Date();
        const formattedDate = formatDateISO(currentDate);

        workflow["75"]["inputs"]["filename_prefix"] = `webui/${formattedDate}/${currentSeedNum}`;

        console.log("Generating with:", {
            checkpoint: workflow["4"]["inputs"]["ckpt_name"],
            sampler: workflow["17"]["inputs"]["sampler_name"],
            scheduler: workflow["17"]["inputs"]["scheduler"],
            seed: workflow["17"]["inputs"]["seed"],
            useDynamicPrompt: useDynamicPrompt,
        });

        const response = await fetch(`${COMFYUI_URL}/prompt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: workflow, client_id: "webapp" }),
        });

        if (!response.ok) throw new Error("Gagal terhubung ke server. Pastikan server berjalan!");

        const { prompt_id } = await response.json();

        let imageUrl = null;
        let attempts = 0;
        const maxAttempts = 30;

        while (!imageUrl && attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const historyResponse = await fetch(`${COMFYUI_URL}/history/${prompt_id}`);
            const history = await historyResponse.json();

            console.log("History response:", history);

            if (history[prompt_id] && history[prompt_id].outputs && history[prompt_id].outputs["75"]) {
                const images = history[prompt_id].outputs["75"].images;

                if (images && Array.isArray(images) && images.length > 0) {
                    const imageData = images[0];

                    if (
                        imageData &&
                        typeof imageData === "object" &&
                        imageData.filename &&
                        imageData.subfolder !== undefined &&
                        imageData.type
                    ) {
                        imageUrl = `${COMFYUI_URL}/view?filename=${imageData.filename}&subfolder=${imageData.subfolder}&type=${imageData.type}`;
                    } else {
                        console.log("Image data is missing required properties:", imageData);
                    }
                } else {
                    console.log("No images found in output 75 yet:", images);
                }
            } else {
                console.log("Prompt ID or output 75 not found in history:", history[prompt_id]?.outputs);
            }

            attempts++;
        }

        if (!imageUrl) {
            throw new Error(
                "Gagal mengambil gambar setelah mencoba selama 30 detik. Periksa server server atau konfigurasi workflow."
            );
        }

        outputImage.src = imageUrl;
        outputImage.style.display = "block";
        imageActions.style.display = "flex";
        const successMessage = `Gambar berhasil dibuat! Seed: ${currentSeedNum}`;
        showStatus(status, successMessage, "success");

        localStorage.setItem("lastGeneratedImage", imageUrl);
        localStorage.setItem("lastStatus", successMessage);
    } catch (err) {
        let errorMessage = err.message;

        if (errorMessage.includes("fetch")) errorMessage = "Tidak dapat terhubung ke server. Pastikan server berjalan!";
        else if (errorMessage.includes("Seed"))
            errorMessage = `Masukkan seed yang valid (angka antara 0 dan ${MAX_SEED})!`;

        showError(error, errorMessage);
    } finally {
        button.disabled = false;
    }
}

async function downloadImage() {
    const outputImage = document.getElementById("outputImage");
    const imageUrl = outputImage.src;

    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `generated-image-${workflow["17"]["inputs"]["seed"]}.png`;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (err) {
        showError(document.getElementById("error"), "Gagal mengunduh gambar: " + err.message);
    }
}

function showStatus(statusElement, message, type = "") {
    statusElement.textContent = message;
    statusElement.style.display = "block";
    statusElement.className = type;

    if (type !== "success") {
        setTimeout(() => {
            if (statusElement.className !== "success") statusElement.style.display = "none";
        }, 5000);
    }
}

function showError(errorElement, message) {
    errorElement.textContent = message;
    errorElement.style.display = "block";

    setTimeout(() => (errorElement.style.display = "none"), 5000);
}
