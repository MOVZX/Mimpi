// Upscalers
const upscaleModels = [
    "4x-ClearRealityV1.pth",
    "4x-ESRGAN.pth",
    "4x-UltraSharp.pth",
    "4x_foolhardy_Remacri.pth",
    "4x_NMKD-Siax_200k.pth",
    "4x_NMKD-Superscale-SP_178000_G.pth",
    "4xFaceUpDAT.pth",
    "4xFaceUpSharpLDAT.pth",
    "4xFFHQDAT.pth",
    "4xNMKDSuperscale_4xNMKDSuperscale.pt",
    "4xNomos2_otf_esrgan.pth",
    "4xNomos8k_atd_jpg.pth",
    "BSRGANx2.pth",
    "ESRGAN_4x.pth",
    "RealESRGAN_x2.pth",
    "RealESRGAN_x4.pth",
    "RealESRGAN_x4plus.pth",
];

// Upscaling Workflow
const upscaleNodes = {
    272: {
        _meta: {
            title: "Load Upscale Model",
        },
        class_type: "UpscaleModelLoader",
        inputs: {
            model_name: "4x-ClearRealityV1.pth",
        },
    },
    273: {
        _meta: {
            title: "Ultimate SD Upscale",
        },
        class_type: "UltimateSDUpscale",
        inputs: {
            cfg: 1,
            denoise: 0.2,
            force_uniform_tiles: true,
            image: ["47", 0],
            mask_blur: 8,
            mode_type: "Linear",
            model: ["193", 0],
            negative: ["103", 0],
            positive: ["259", 0],
            sampler_name: "lcm",
            scheduler: "normal",
            seam_fix_denoise: 1,
            seam_fix_mask_blur: 8,
            seam_fix_mode: "None",
            seam_fix_padding: 16,
            seam_fix_width: 64,
            seed: 0,
            steps: 1,
            tile_height: 1024,
            tile_padding: 32,
            tile_width: 1024,
            tiled_decode: false,
            upscale_by: 1.5,
            upscale_model: ["272", 0],
            vae: ["4", 2],
        },
    },
    274: {
        _meta: {
            title: "Switch",
        },
        class_type: "Any Switch (rgthree)",
        inputs: {
            any_01: ["273", 0],
            any_02: ["47", 0],
        },
    },
};
