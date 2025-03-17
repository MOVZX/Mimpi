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
