const upscaleModels = [
    "4x-ClearRealityV1.pth",
    "4x-ESRGAN.pth",
    "4x-UltraSharp.pth",
    "4x_foolhardy_Remacri.pth",
    "4x_NMKD-Siax_200k.pth",
    "4x_NMKD-Superscale-SP_178000_G.pth",
    "4xFaceUpDAT.pth",
    "4xFFHQDAT.pth",
    "4xNMKDSuperscale_4xNMKDSuperscale.pt",
    "4xNomos2_otf_esrgan.pth",
    "4xNomos8k_atd_jpg.pth",
    "BSRGANx2.pth",
    "ESRGAN_4x.pth",
    "put_esrgan_and_other_upscale_models_here",
    "RealESRGAN_x2.pth",
    "RealESRGAN_x4.pth",
    "RealESRGAN_x4plus.pth",
];

const upscaleNodes = {
    270: {
        _meta: {
            title: "CLIP Text Encode (Prompt)",
        },
        class_type: "CLIPTextEncode",
        inputs: {
            clip: ["76", 0],
            text: "intricate details, best quality, 8k resolution",
        },
    },
    271: {
        _meta: {
            title: "CLIP Text Encode (Prompt)",
        },
        class_type: "CLIPTextEncode",
        inputs: {
            clip: ["76", 0],
            text: "blurry, medium quality, low quality",
        },
    },
    272: {
        _meta: {
            title: "Load Upscale Model",
        },
        class_type: "UpscaleModelLoader",
        inputs: {
            model_name: "4x-UltraSharp.pth",
        },
    },
    273: {
        _meta: {
            title: "Ultimate SD Upscale",
        },
        class_type: "UltimateSDUpscale",
        inputs: {
            cfg: 3.5,
            denoise: 0.25,
            force_uniform_tiles: true,
            image: ["47", 0],
            mask_blur: 8,
            mode_type: "Linear",
            model: ["4", 0],
            negative: ["271", 0],
            positive: ["270", 0],
            sampler_name: "dpmpp_2m",
            scheduler: "karras",
            seam_fix_denoise: 1,
            seam_fix_mask_blur: 8,
            seam_fix_mode: "None",
            seam_fix_padding: 16,
            seam_fix_width: 64,
            seed: 0,
            steps: 35,
            tile_height: 1024,
            tile_padding: 32,
            tile_width: 1024,
            tiled_decode: false,
            upscale_by: 1.5,
            upscale_model: ["272", 0],
            vae: ["4", 2],
        },
    },
    276: {
        _meta: {
            title: "🪛 Switch image",
        },
        class_type: "Switch image [Crystools]",
        inputs: {
            boolean: true,
            on_false: ["47", 0],
            on_true: ["273", 0],
        },
    },
};
