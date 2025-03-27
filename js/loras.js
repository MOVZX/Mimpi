// Main Workflow
const loras = {
    84: {
        class_type: "Power Lora Loader (rgthree)",
        inputs: {
            "➕ Add Lora": "",
            clip: ["76", 0],
            lora_1: {
                on: false,
                lora: "DMD2/dmd2_sdxl_4step_lora_fp16.safetensors",
                strength: 1,
            },
            lora_2: {
                on: true,
                lora: "SDXL/add-detail-xl.safetensors",
                strength: 0.95,
            },
            lora_3: {
                on: true,
                lora: "SDXL/Breast Slider - Pony_alpha1.0_rank4_noxattn_last.safetensors",
                strength: 0.85,
            },
            lora_4: {
                on: true,
                lora: "SDXL/Beautify-Supermodel-SDXL.safetensors",
                strength: 0.8,
            },
            model: ["4", 0],
            PowerLoraLoaderHeaderWidget: {
                type: "PowerLoraLoaderHeaderWidget",
            },
        },
    },
};
