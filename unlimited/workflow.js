// Main Workflow
const workflow = {
    4: {
        _meta: {
            title: "Load Checkpoint",
        },
        class_type: "CheckpointLoaderSimple",
        inputs: {
            ckpt_name: "SDXL-Lightning/lustifySDXLNSFW_v40DMD2.safetensors",
        },
    },
    47: {
        _meta: {
            title: "VAE Decode",
        },
        class_type: "VAEDecode",
        inputs: {
            samples: ["220", 0],
            vae: ["4", 2],
        },
    },
    76: {
        _meta: {
            title: "CLIP Set Last Layer",
        },
        class_type: "CLIPSetLastLayer",
        inputs: {
            clip: ["4", 1],
            stop_at_clip_layer: -2,
        },
    },
    84: {
        _meta: {
            title: "Power Lora Loader (rgthree)",
        },
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
            model: ["269", 0],
            PowerLoraLoaderHeaderWidget: {
                type: "PowerLoraLoaderHeaderWidget",
            },
        },
    },
    103: {
        _meta: {
            title: "Negative Prompt",
        },
        class_type: "CLIPTextEncode",
        inputs: {
            clip: ["84", 1],
            text: "",
        },
    },
    106: {
        _meta: {
            title: "Apply First Block Cache",
        },
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
        _meta: {
            title: "🔧 SDXL Empty Latent Size Picker",
        },
        class_type: "SDXLEmptyLatentSizePicker+",
        inputs: {
            batch_size: 1,
            height_override: 0,
            resolution: "896x1152 (0.78)",
            width_override: 0,
        },
    },
    171: {
        _meta: {
            title: "IsulionMegaPromptV3",
        },
        class_type: "IsulionMegaPromptV3",
        inputs: {
            complexity: "complex",
            custom_location: "",
            custom_subject: ["260", 0],
            debug_mode: "off",
            include_effects: "yes",
            include_environment: "yes",
            include_style: "yes",
            randomize: "enable",
            seed: 0,
            theme: "🎲 Dynamic Random",
        },
    },
    "178:1": {
        _meta: {
            title: "Switch: Prompts",
        },
        class_type: "Switch any [Crystools]",
        inputs: {
            boolean: false,
            on_false: ["260", 0],
            on_true: ["171", 0],
        },
    },
    193: {
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
            model: ["106", 0],
        },
        class_type: "EnhancedCompileModel",
        _meta: {
            title: "Compile Model+",
        },
    },
    218: {
        _meta: {
            title: "CFGGuider",
        },
        class_type: "CFGGuider",
        inputs: {
            cfg: 1,
            model: ["193", 0],
            negative: ["103", 0],
            positive: ["259", 0],
        },
    },
    220: {
        _meta: {
            title: "SamplerCustomAdvanced",
        },
        class_type: "SamplerCustomAdvanced",
        inputs: {
            guider: ["218", 0],
            latent_image: ["152", 0],
            noise: ["222", 0],
            sampler: ["221", 0],
            sigmas: ["252", 0],
        },
    },
    221: {
        _meta: {
            title: "KSamplerSelect",
        },
        class_type: "KSamplerSelect",
        inputs: {
            sampler_name: "lcm",
        },
    },
    222: {
        _meta: {
            title: "RandomNoise",
        },
        class_type: "RandomNoise",
        inputs: {
            noise_seed: 0,
        },
    },
    252: {
        _meta: {
            title: "AlignYourStepsScheduler",
        },
        class_type: "AlignYourStepsScheduler",
        inputs: {
            denoise: 1,
            model_type: "SDXL",
            steps: 11,
        },
    },
    259: {
        _meta: {
            title: "CLIP Text Encode (Prompt)",
        },
        class_type: "CLIPTextEncode",
        inputs: {
            clip: ["84", 1],
            text: ["178:1", 0],
        },
    },
    260: {
        _meta: {
            title: "Positive Prompt",
        },
        class_type: "Text Multiline",
        inputs: {
            text: "1girl, solo, 30-year-old stunningly beautiful woman, feathered strawberry blonde hair, nun, blowjob, cum on face, cum dripping from her mouth, tongue out, living room, intricate details, realistic skin textures, skin pores, high resolution, best quality, real human aesthetic, bright lighting",
        },
    },
    267: {
        _meta: {
            title: "Save Image",
        },
        class_type: "SaveImage",
        inputs: {
            filename_prefix: "",
            images: ["274", 0],
        },
    },
    268: {
        inputs: {
            clip_name1: "Long-ViT-L-14-REG-TE-only-HF-format.safetensors",
            clip_name2: "clip_g.safetensors",
            type: "sdxl",
            device: "default",
        },
        class_type: "DualCLIPLoader",
        _meta: {
            title: "DualCLIPLoader",
        },
    },
};
