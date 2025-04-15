// Main Workflow
const workflow = {
    4: {
        class_type: "CheckpointLoaderSimple",
        inputs: {
            ckpt_name: "SDXL/realisticLustXL_v05.safetensors",
        },
    },
    47: {
        class_type: "VAEDecode",
        inputs: {
            samples: ["279", 0],
            vae: ["4", 2],
        },
    },
    76: {
        class_type: "CLIPSetLastLayer",
        inputs: {
            clip: ["4", 1],
            stop_at_clip_layer: -2,
        },
    },
    103: {
        class_type: "CLIPTextEncode",
        inputs: {
            clip: ["84", 1],
            text: "",
        },
    },
    152: {
        class_type: "SDXLEmptyLatentSizePicker+",
        inputs: {
            batch_size: 1,
            height_override: 0,
            resolution: "1024x1536 (0.67)",
            width_override: 0,
        },
    },
    171: {
        class_type: "IsulionMegaPromptV3",
        inputs: {
            complexity: "complex",
            custom_location: "",
            custom_subject: ["278", 0],
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
        class_type: "Switch any [Crystools]",
        inputs: {
            boolean: false,
            on_false: ["278", 0],
            on_true: ["171", 0],
        },
    },
    259: {
        class_type: "CLIPTextEncode",
        inputs: {
            clip: ["84", 1],
            text: ["178:1", 0],
        },
    },
    267: {
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
    },
    278: {
        inputs: {
            prompt: "",
        },
        class_type: "Prompt Text (Auto Translate)",
    },
    279: {
        inputs: {
            seed: 0,
            steps: 8,
            cfg: 1,
            sampler_name: "lcm",
            scheduler: "exponential",
            denoise: 1,
            model: ["84", 0],
            positive: ["259", 0],
            negative: ["103", 0],
            latent_image: ["152", 0],
        },
        class_type: "KSampler",
    },
};
