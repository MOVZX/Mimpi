const workflow = {
    4: {
        class_type: "CheckpointLoaderSimple",
        inputs: {
            ckpt_name: "SDXL/perfectionRealisticILXL_v10.safetensors",
        },
    },
    47: {
        class_type: "VAEDecode",
        inputs: {
            samples: ["220", 0],
            vae: ["253", 0],
        },
    },
    76: {
        class_type: "CLIPSetLastLayer",
        inputs: {
            clip: ["84", 1],
            stop_at_clip_layer: -2,
        },
    },
    84: {
        class_type: "Power Lora Loader (rgthree)",
        inputs: {
            "➕ Add Lora": "",
            clip: ["4", 1],
            lora_1: {
                lora: "SDXL/add-detail-xl.safetensors",
                on: true,
                strength: 1,
            },
            lora_2: {
                lora: "SDXL/Breast Slider - Pony_alpha1.0_rank4_noxattn_last.safetensors",
                on: true,
                strength: 0.95,
            },
            lora_3: {
                lora: "SDXL/Beautify-Supermodel-SDXL.safetensors",
                on: true,
                strength: 0.8,
            },
            model: ["4", 0],
            PowerLoraLoaderHeaderWidget: {
                type: "PowerLoraLoaderHeaderWidget",
            },
        },
    },
    103: {
        class_type: "CLIPTextEncode",
        inputs: {
            clip: ["76", 0],
            text: "",
        },
    },
    106: {
        class_type: "ApplyFBCacheOnModel",
        inputs: {
            end: 1,
            max_consecutive_cache_hits: -1,
            model: ["84", 0],
            object_to_patch: "diffusion_model",
            residual_diff_threshold: 0.12,
            start: 0,
        },
    },
    152: {
        class_type: "SDXLEmptyLatentSizePicker+",
        inputs: {
            batch_size: 1,
            height_override: 0,
            resolution: "896x1152 (0.78)",
            width_override: 0,
        },
    },
    171: {
        class_type: "IsulionMegaPromptV3",
        inputs: {
            complexity: "complex",
            custom_location: "",
            custom_subject: ["178:0", 0],
            debug_mode: "off",
            include_effects: "no",
            include_environment: "yes",
            include_style: "no",
            randomize: "enable",
            seed: 0,
            theme: "🎲 Dynamic Random",
        },
    },
    "178:0": {
        class_type: "Text Multiline",
        inputs: {
            text: "",
        },
    },
    "178:1": {
        class_type: "Switch any [Crystools]",
        inputs: {
            boolean: false,
            on_false: ["178:0", 0],
            on_true: ["171", 0],
        },
    },
    "178:2": {
        class_type: "CLIPTextEncode",
        inputs: {
            clip: ["76", 0],
            text: ["178:1", 0],
        },
    },
    193: {
        class_type: "CompileModel",
        inputs: {
            backend: "inductor",
            dynamic: false,
            fullgraph: false,
            mode: "default",
            model: ["106", 0],
        },
    },
    217: {
        class_type: "SaveImage",
        inputs: {
            filename_prefix: "",
            images: ["47", 0],
        },
    },
    218: {
        class_type: "CFGGuider",
        inputs: {
            cfg: 5,
            model: ["193", 0],
            negative: ["103", 0],
            positive: ["178:2", 0],
        },
    },
    219: {
        class_type: "CustomSigmas",
        inputs: {
            interpolate_to_steps: 10,
            sigmas_string: "14.615, 6.315, 3.771, 2.181, 1.342, 0.862, 0.555, 0.380, 0.234, 0.113, 0.029",
        },
    },
    220: {
        class_type: "SamplerCustomAdvanced",
        inputs: {
            guider: ["218", 0],
            latent_image: ["152", 0],
            noise: ["222", 0],
            sampler: ["221", 0],
            sigmas: ["219", 0],
        },
    },
    221: {
        class_type: "KSamplerSelect",
        inputs: {
            sampler_name: "dpmpp_2m",
        },
    },
    222: {
        class_type: "RandomNoise",
        inputs: {
            noise_seed: 0,
        },
    },
    253: {
        class_type: "VAELoader",
        inputs: {
            vae_name: "taesdxl",
        },
    },
};
