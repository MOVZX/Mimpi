const workflow = {
    4: {
        inputs: {
            ckpt_name: "SDXL-Lightning/realvisxlV50_v50LightningBakedvae.safetensors",
        },
        class_type: "CheckpointLoaderSimple",
    },
    10: {
        inputs: {
            PowerLoraLoaderHeaderWidget: {
                type: "PowerLoraLoaderHeaderWidget",
            },
            lora_1: {
                on: true,
                lora: "SDXL/detailer_v5.safetensors",
                strength: 1,
            },
            "➕ Add Lora": "",
            model: ["4", 0],
            clip: ["21", 0],
        },
        class_type: "Power Lora Loader (rgthree)",
    },
    11: {
        inputs: {
            object_to_patch: "diffusion_model",
            residual_diff_threshold: 0.20000000000000004,
            start: 0,
            end: 1,
            max_consecutive_cache_hits: -1,
            model: ["10", 0],
        },
        class_type: "ApplyFBCacheOnModel",
    },
    15: {
        inputs: {
            text: "(nsfw:1.6), (porn:1.6), (nude:1.6), (nudity:1.6), (sexy:1.6), (sensual:1.6), (breast:1.6), (tits:1.6), (skimpy:1.6), (bikini:1.6), (cleavage:1.6), gore, horror, simple background, embedding:negativeXL_D",
            clip: ["16", 0],
        },
        class_type: "CLIPTextEncode",
    },
    16: {
        inputs: {
            stop_at_clip_layer: -2,
            clip: ["10", 1],
        },
        class_type: "CLIPSetLastLayer",
    },
    17: {
        inputs: {
            seed: 0,
            steps: 8,
            cfg: 1,
            sampler_name: "euler_ancestral",
            scheduler: "normal",
            denoise: 1,
            model: ["38", 0],
            positive: ["70:2", 0],
            negative: ["15", 0],
            latent_image: ["18", 0],
        },
        class_type: "KSampler",
    },
    18: {
        inputs: {
            resolution: "896x1152 (0.78)",
            batch_size: 1,
            width_override: 0,
            height_override: 0,
        },
        class_type: "SDXLEmptyLatentSizePicker+",
    },
    19: {
        inputs: {
            samples: ["17", 0],
            vae: ["4", 2],
        },
        class_type: "VAEDecode",
    },
    21: {
        inputs: {
            clip_name1: "ViT-L-14-REG-TE-only-balanced-HF-format-ckpt12.safetensors",
            clip_name2: "clip_g.safetensors",
            type: "sdxl",
            device: "default",
        },
        class_type: "DualCLIPLoader",
    },
    22: {
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
            include_effects: "no",
        },
        class_type: "IsulionMegaPromptV3",
    },
    38: {
        inputs: {
            is_patcher: true,
            object_to_patch: "diffusion_model",
            compiler: "torch.compile",
            fullgraph: false,
            dynamic: false,
            mode: "",
            options: "",
            disable: false,
            backend: "inductor",
            model: ["11", 0],
        },
        class_type: "EnhancedCompileModel",
    },
    56: {
        inputs: {
            text: "",
        },
        class_type: "Text Multiline",
    },
    57: {
        inputs: {
            text: "detailerlora, best quality, highly detailed, hyper realistic, 8K resolution, ultra detail, raytracing",
        },
        class_type: "Text Multiline",
    },
    59: {
        inputs: {
            delimiter: ", ",
            clean_whitespace: "true",
            text_a: ["56", 0],
            text_b: ["57", 0],
        },
        class_type: "Text Concatenate",
    },
    71: {
        inputs: {
            model: "nudenet.onnx",
        },
        class_type: "NudenetModelLoader",
    },
    72: {
        inputs: {
            FEMALE_GENITALIA_COVERED: true,
            FACE_FEMALE: false,
            BUTTOCKS_EXPOSED: true,
            FEMALE_BREAST_EXPOSED: true,
            FEMALE_GENITALIA_EXPOSED: true,
            MALE_BREAST_EXPOSED: true,
            ANUS_EXPOSED: true,
            FEET_EXPOSED: false,
            BELLY_COVERED: false,
            FEET_COVERED: false,
            ARMPITS_COVERED: false,
            ARMPITS_EXPOSED: false,
            FACE_MALE: false,
            BELLY_EXPOSED: true,
            MALE_GENITALIA_EXPOSED: true,
            ANUS_COVERED: true,
            FEMALE_BREAST_COVERED: false,
            BUTTOCKS_COVERED: true,
        },
        class_type: "FilterdLabel",
    },
    73: {
        inputs: {
            censor_method: "pixelate",
            min_score: 0.1,
            blocks: 3,
            overlay_strength: 1,
            nudenet_model: ["71", 0],
            image: ["19", 0],
            filtered_labels: ["72", 0],
        },
        class_type: "ApplyNudenet",
    },
    75: {
        inputs: {
            filename_prefix: "",
            images: ["73", 0],
        },
        class_type: "SaveImage",
    },
    "70:0": {
        inputs: {
            text: ["59", 0],
        },
        class_type: "Text Multiline",
    },
    "70:1": {
        inputs: {
            boolean: false,
            on_true: ["22", 0],
            on_false: ["70:0", 0],
        },
        class_type: "Switch any [Crystools]",
    },
    "70:2": {
        inputs: {
            text: ["70:1", 0],
            clip: ["16", 0],
        },
        class_type: "CLIPTextEncode",
    },
};
