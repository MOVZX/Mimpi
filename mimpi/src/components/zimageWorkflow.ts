// Z-Image Workflow Template (auto-generated from zzzz.json)
// Do not edit - regenerate from source workflow

const ZIMAGE_WORKFLOW_TEMPLATE = {
  "1": {
    inputs: {
      samples: ["10", 0],
      vae: ["2", 0],
    },
    class_type: "VAEDecode",
    _meta: {
      title: "VAE Decode",
    },
  },
  "2": {
    inputs: {
      vae_name: "Z-Image/Z-Image VAE.safetensors",
    },
    class_type: "VAELoader",
    _meta: {
      title: "Load VAE",
    },
  },
  "3": {
    inputs: {
      conditioning: ["7", 0],
    },
    class_type: "ConditioningZeroOut",
    _meta: {
      title: "ConditioningZeroOut",
    },
  },
  "4": {
    inputs: {
      upscale_method: "bislerp",
      scale_by: 1.2,
      samples: ["12", 0],
    },
    class_type: "LatentUpscaleBy",
    _meta: {
      title: "Upscale Latent By",
    },
  },
  "5": {
    inputs: {
      samples: ["8", 0],
      vae: ["2", 0],
    },
    class_type: "VAEDecode",
    _meta: {
      title: "VAE Decode",
    },
  },
  "6": {
    inputs: {
      width: 896,
      height: 1600,
      batch_size: 1,
    },
    class_type: "EmptySD3LatentImage",
    _meta: {
      title: "EmptySD3LatentImage",
    },
  },
  "7": {
    inputs: {
      text: 'hyper-realistic full-body portrait of a stunning 36yo Asian woman, delicate facial features, almond-shaped brown eyes with clear catchlights, soft natural eyebrows, straight nose, rosy pink lips with a gentle closed-mouth smile, fair skin with visible pores and faint freckles across the nose. She has long, straight, jet-black hair with a silky sheen, parted slightly off-center, falling over her shoulders. She is wearing a tight-fitting white cotton t-shirt with a deep U-shaped scoop neck that reveals her collarbones, a stylish colorful text of "HINATA" written on the chest part of t-shirt, the fabric is thin and slightly translucent, showing the texture of the material. She is wearing blue denim jeans, visible at the waist. She is sitting on a dark grey textured sofa, leaning slightly forward, looking directly into the camera lens with a calm, inviting expression. Soft, diffused natural window light coming from the left, illuminating her face and creating soft shadows on the right side of her neck and chest. Plain white wall background, minimalistic interior, 8k resolution, shot on 85mm lens, f/1.8 aperture, highly detailed texture, raw photography.',
      clip: ["16", 1],
    },
    class_type: "CLIPTextEncode",
    _meta: {
      title: "正面提示詞 (positive)",
    },
  },
  "8": {
    inputs: {
      seed: ["13", 0],
      steps: 8,
      cfg: 1,
      sampler_name: "euler",
      scheduler: "simple",
      denoise: 0.65,
      model: ["16", 0],
      positive: ["7", 0],
      negative: ["3", 0],
      latent_image: ["4", 0],
    },
    class_type: "KSampler",
    _meta: {
      title: "KSampler",
    },
  },
  "9": {
    inputs: {
      filename_prefix: "",
      subdirectory_name: "",
      output_format: "png",
      quality: "max",
      metadata_scope: "workflow_only",
      include_batch_num: true,
      prefer_nearest: true,
      images: ["5", 0],
    },
    class_type: "SaveImageWithMetaData",
    _meta: {
      title: "Save Image With MetaData",
    },
  },
  "10": {
    inputs: {
      add_noise: "enable",
      noise_seed: ["13", 0],
      steps: 4,
      cfg: 1,
      sampler_name: "euler",
      scheduler: "simple",
      start_at_step: 0,
      end_at_step: 9994,
      return_with_leftover_noise: "disable",
      model: ["16", 0],
      positive: ["7", 0],
      negative: ["3", 0],
      latent_image: ["6", 0],
    },
    class_type: "KSamplerAdvanced",
    _meta: {
      title: "KSampler (Advanced)",
    },
  },
  "11": {
    inputs: {
      unet_name: "Z-Image/beyondREALITY_V30.safetensors",
      weight_dtype: "default",
    },
    class_type: "UNETLoader",
    _meta: {
      title: "Load Diffusion Model",
    },
  },
  "12": {
    inputs: {
      anything: ["10", 0],
    },
    class_type: "easy cleanGpuUsed",
    _meta: {
      title: "Clean VRAM Used",
    },
  },
  "13": {
    inputs: {
      seed: 781226025206956,
    },
    class_type: "easy seed",
    _meta: {
      title: "EasySeed",
    },
  },
  "14": {
    inputs: {
      shift: 3,
      model: ["11", 0],
    },
    class_type: "ModelSamplingAuraFlow",
    _meta: {
      title: "ModelSamplingAuraFlow",
    },
  },
  "15": {
    inputs: {
      clip_name: "Z-Image/qwen-4b-zimage-hereticV2-q8.gguf",
      type: "lumina2",
      device: "default",
    },
    class_type: "ClipLoaderGGUF",
    _meta: {
      title: "GGUF CLIP Loader",
    },
  },
  "16": {
    inputs: {
      text: "<lora:REDZ15_DetailDaemonZ_lora_v1.1:-0.10>, <lora:Softmute_SoloLoRA_ZIBv1:1.00>, <lora:skin texture Photorealistic style v4.5:0.55>, <lora:Kook_Zimage_Turbo:0.30>, <lora:hina_zImageTurbo_asianMix_v4.57-bf16:0.80>",
      loras: {
        __value__: [
          {
            name: "REDZ15_DetailDaemonZ_lora_v1.1",
            strength: "-0.10",
            active: true,
            expanded: false,
            clipStrength: "-0.10",
            locked: false,
          },
          {
            name: "Softmute_SoloLoRA_ZIBv1",
            strength: "1.00",
            active: true,
            expanded: false,
            clipStrength: "1.00",
            locked: false,
          },
          {
            name: "skin texture Photorealistic style v4.5",
            strength: "0.55",
            active: false,
            expanded: false,
            clipStrength: "0.55",
            locked: false,
          },
          {
            name: "Kook_Zimage_Turbo",
            strength: "0.30",
            active: false,
            expanded: false,
            clipStrength: "0.30",
            locked: false,
          },
          {
            name: "hina_zImageTurbo_asianMix_v4.57-bf16",
            strength: "0.80",
            active: true,
            expanded: false,
            clipStrength: "0.80",
            locked: false,
          },
        ],
      },
      model: ["14", 0],
      clip: ["15", 0],
    },
    class_type: "Lora Loader (LoraManager)",
    _meta: {
      title: "Lora Loader (LoraManager)",
    },
  },
};

export default ZIMAGE_WORKFLOW_TEMPLATE;
