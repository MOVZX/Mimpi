const workflow = {
    4: {
        inputs: { ckpt_name: "SDXL-Lightning/lustifySDXLNSFW_endgameDMD2.safetensors" },
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
            lora_3: { on: true, lora: "SDXL/Beautify-Supermodel-SDXL.safetensors", strength: 0.8 },
            "➕ Add Lora": "",
            model: ["4", 0],
            clip: ["4", 1],
        },
        class_type: "Power Lora Loader (rgthree)",
    },
    84: {
        inputs: {
            "➕ Add Lora": "",
            clip: ["4", 1],
            lora_1: { lora: "SDXL/add-detail-xl.safetensors", on: true, strength: 1 },
            lora_2: {
                lora: "SDXL/Breast Slider - Pony_alpha1.0_rank4_noxattn_last.safetensors",
                on: true,
                strength: 0.95,
            },
            lora_3: { lora: "SDXL/Beautify-Supermodel-SDXL.safetensors", on: true, strength: 0.8 },
            model: ["4", 0],
            PowerLoraLoaderHeaderWidget: { type: "PowerLoraLoaderHeaderWidget" },
        },
        class_type: "Power Lora Loader (rgthree)",
        _meta: { title: "Power Lora Loader (rgthree)" },
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
            steps: 8,
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
            residual_diff_threshold: 0.12,
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
        inputs: { aggressive: true, latent: ["225", 0] },
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
        inputs: { filename_prefix: "", images: ["226", 0] },
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
    218: {
        inputs: {
            cfg: 1,
            model: ["193", 0],
            positive: ["178:2", 0],
            negative: ["103", 0],
        },
        class_type: "CFGGuider",
    },
    219: {
        inputs: {
            noise: ["222", 0],
            guider: ["218", 0],
            sampler: ["221", 0],
            sigmas: ["220", 0],
            latent_image: ["152", 0],
        },
        class_type: "SamplerCustomAdvanced",
    },
    220: {
        inputs: {
            sigmas_string: "14.615, 6.315, 3.771, 2.181, 1.342, 0.862, 0.555, 0.380, 0.234, 0.113, 0.029",
            interpolate_to_steps: 10,
        },
        class_type: "CustomSigmas",
    },
    221: {
        inputs: {
            sampler_name: "lcm",
        },
        class_type: "KSamplerSelect",
    },
    222: {
        inputs: {
            noise_seed: 0,
        },
        class_type: "RandomNoise",
    },
    223: {
        inputs: {
            guide_size: 512,
            guide_size_for: true,
            max_size: 1024,
            seed: 0,
            steps: 10,
            cfg: 1,
            sampler_name: "dpmpp_2m",
            scheduler: "AYS SDXL",
            denoise: 0.15,
            feather: 5,
            noise_mask: true,
            force_inpaint: true,
            bbox_threshold: 0.5,
            bbox_dilation: 10,
            bbox_crop_factor: 3,
            sam_detection_hint: "center-1",
            sam_dilation: 0,
            sam_threshold: 0.93,
            sam_bbox_expansion: 0,
            sam_mask_hint_threshold: 0.7,
            sam_mask_hint_use_negative: "False",
            drop_size: 10,
            wildcard: "",
            cycle: 1,
            inpaint_model: false,
            noise_mask_feather: 20,
            tiled_encode: false,
            tiled_decode: false,
            image: ["47", 0],
            model: ["193", 0],
            clip: ["76", 0],
            vae: ["4", 2],
            positive: ["178:2", 0],
            negative: ["103", 0],
            bbox_detector: ["224", 0],
        },
        class_type: "FaceDetailer",
    },
    224: {
        inputs: {
            model_name: "bbox/face_yolov8m.pt",
        },
        class_type: "UltralyticsDetectorProvider",
    },
    225: {
        inputs: {
            boolean: true,
            on_true: ["219", 0],
            on_false: ["105", 0],
        },
        class_type: "Switch any [Crystools]",
    },
    226: {
        inputs: {
            boolean: true,
            on_true: ["223", 0],
            on_false: ["47", 0],
        },
        class_type: "Switch any [Crystools]",
    },
    228: {
        inputs: {
            boolean: true,
            on_true: ["47", 0],
            on_false: ["229", 0],
        },
        class_type: "Switch any [Crystools]",
    },
    229: {
        inputs: {},
        class_type: "ImpactDummyInput",
    },
};
