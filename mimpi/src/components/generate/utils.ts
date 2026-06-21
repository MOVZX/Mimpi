import { RES_MAP, resSize } from "@/constants/generation";
import ZIMAGE_WORKFLOW_TEMPLATE from "../zimageWorkflow";

export type GenerationMode = "zimage" | "sdxl";
export type ResolutionSize = "portrait" | "landscape" | "square";

export interface ZimageLoraItem {
  name: string;
  strength: number;
  active: boolean;
}

export interface SdxlGenerationState {
  prompt: string;
  negative: string;
  checkpoint: string;
  sampler: string;
  scheduler: string;
  steps: number;
  cfg: number;
  imageMode: ResolutionSize;
  dynamicPrompt: boolean;
  useDMD2: boolean;
  useLoRA: boolean;
  lora1: boolean;
  lora2: boolean;
  lora3: boolean;
  useClipSkip: boolean;
  clipSkipVal: number;
  useCustomClip: boolean;
  useUpscale: boolean;
  upscaler: string;
  useDynamicSeed: boolean;
  useIncSeed: boolean;
  seed: string;
  currentSeedNum: number;
}

export interface ZimageGenerationState {
  prompt: string;
  negative: string;
  model: string;
  sampler: string;
  scheduler: string;
  steps: number;
  cfg: number;
  width: number;
  height: number;
  seed: string;
  currentSeedNum: number;
  useDynamicSeed: boolean;
  useIncSeed: boolean;
  loras: ZimageLoraItem[];
  imageMode: GenerationMode;
}

export interface BuiltWorkflow {
  workflow: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

const MAX_SEED = 9007199254740991;
const EASY_SEED_MAX = 1125899906842624;

export const ZIMAGE_RESOLUTIONS: {
  label: string;
  width: number;
  height: number;
}[] = [
  { label: "896×1152", width: 896, height: 1152 },
  { label: "896×1600", width: 896, height: 1600 },
  { label: "1120×1449", width: 1120, height: 1449 },
  { label: "1152×896", width: 1152, height: 896 },
  { label: "1600×896", width: 1600, height: 896 },
  { label: "1449×1120", width: 1449, height: 1120 },
];

export const DEFAULT_ZIMAGE_LORAS: ZimageLoraItem[] = [
  { name: "REDZ15_DetailDaemonZ_lora_v1.1", strength: -0.1, active: true },
  { name: "Softmute_SoloLoRA_ZIBv1", strength: 1.0, active: true },
  {
    name: "skin texture Photorealistic style v4.5",
    strength: 0.55,
    active: false,
  },
  { name: "Kook_Zimage_Turbo", strength: 0.3, active: false },
  {
    name: "hina_zImageTurbo_asianMix_v4.57-bf16",
    strength: 0.8,
    active: true,
  },
];

export function normalizeLoraName(name: string): string {
  return name.replace(/\.safetensors$/i, "");
}

export function buildZImageLoraText(loras: ZimageLoraItem[]): string {
  return loras
    .filter((lora) => lora.active)
    .map(
      (lora) =>
        `<lora:${normalizeLoraName(lora.name)}.safetensors:${lora.strength}>`,
    )
    .join(", ");
}

export function buildZImageLoraManagerValue(loras: ZimageLoraItem[]) {
  return {
    __value__: loras.map((lora) => ({
      name: normalizeLoraName(lora.name),
      strength: String(lora.strength),
      active: lora.active,
      expanded: false,
      clipStrength: String(lora.strength),
      locked: false,
    })),
  };
}

export function addZImageLora(
  loras: ZimageLoraItem[],
  loraName: string,
): ZimageLoraItem[] {
  return [
    ...loras,
    { name: normalizeLoraName(loraName), strength: 1.0, active: true },
  ];
}

export function removeZImageLora(
  loras: ZimageLoraItem[],
  index: number,
): ZimageLoraItem[] {
  return loras.filter((_, idx) => idx !== index);
}

export function moveZImageLora(
  loras: ZimageLoraItem[],
  index: number,
  direction: "up" | "down",
): ZimageLoraItem[] {
  const next = [...loras];
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= next.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function updateZImageLoraStrength(
  loras: ZimageLoraItem[],
  index: number,
  strength: number,
): ZimageLoraItem[] {
  const next = [...loras];
  next[index] = { ...next[index], strength };
  return next;
}

export function toggleZImageLora(
  loras: ZimageLoraItem[],
  index: number,
  active: boolean,
): ZimageLoraItem[] {
  const next = [...loras];
  next[index] = { ...next[index], active };
  return next;
}

export function moveListItem<T>(
  items: T[],
  index: number,
  direction: "up" | "down",
): T[] {
  const next = [...items];
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= next.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function computeSdxlSeed(
  state: Pick<
    SdxlGenerationState,
    "seed" | "useDynamicSeed" | "useIncSeed" | "currentSeedNum"
  >,
): number {
  const seedInput = state.seed;
  let finalBigInt: bigint;

  if (state.useIncSeed) {
    finalBigInt = BigInt(state.currentSeedNum) + BigInt(1);
    if (finalBigInt > BigInt(MAX_SEED)) finalBigInt = BigInt(0);
  } else if (
    state.useDynamicSeed ||
    !seedInput ||
    seedInput === "-1" ||
    isNaN(Number(seedInput))
  ) {
    finalBigInt =
      (BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)) *
        BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER))) %
      (BigInt(MAX_SEED) + BigInt(1));
  } else {
    finalBigInt = BigInt(seedInput);
  }

  if (finalBigInt < BigInt(0)) finalBigInt = BigInt(0);
  return Number(finalBigInt);
}

export function computeZimageSeed(
  state: Pick<
    ZimageGenerationState,
    "seed" | "useDynamicSeed" | "useIncSeed" | "currentSeedNum"
  >,
): { finalSeed: string; clampedSeed: number } {
  const seedInput = state.seed;
  let finalBigInt: bigint;

  if (state.useIncSeed) {
    finalBigInt = BigInt(state.currentSeedNum) + BigInt(1);
  } else if (
    state.useDynamicSeed ||
    !seedInput ||
    seedInput === "-1" ||
    isNaN(Number(seedInput))
  ) {
    finalBigInt = BigInt(Math.floor(Math.random() * Number(EASY_SEED_MAX)));
  } else {
    finalBigInt = BigInt(seedInput);
  }

  const finalSeed = finalBigInt.toString();
  const clampedSeed =
    finalBigInt > BigInt(EASY_SEED_MAX)
      ? Number(finalBigInt % BigInt(EASY_SEED_MAX))
      : Number(finalSeed);

  return { finalSeed, clampedSeed };
}

export function buildSdxlWorkflow(state: SdxlGenerationState): BuiltWorkflow {
  const finalSeed = computeSdxlSeed(state);
  const wf: Record<string, any> = {};

  wf["4"] = {
    class_type: "CheckpointLoaderSimple",
    inputs: { ckpt_name: state.checkpoint },
  };
  wf["47"] = {
    class_type: "VAEDecode",
    inputs: { samples: ["279", 0], vae: ["4", 2] },
  };
  wf["268"] = {
    class_type: "DualCLIPLoader",
    inputs: {
      clip_name1: "Long-ViT-L-14-REG-TE-only-HF-format.safetensors",
      clip_name2: "clip_g.safetensors",
      type: "sdxl",
      device: "default",
    },
  };
  wf["76"] = {
    class_type: "CLIPSetLastLayer",
    inputs: {
      clip: state.useCustomClip ? ["268", 0] : ["4", 1],
      stop_at_clip_layer: state.useClipSkip ? state.clipSkipVal : -2,
    },
  };
  wf["103"] = {
    class_type: "CLIPTextEncode",
    inputs: {
      clip: ["84", 1],
      text: `${state.negative || ""}, embedding:Stable_Yogis_PDXL_Negatives-neg, embedding:CyberRealistic_Negative_SDXL-neg`,
    },
  };
  wf["6"] = {
    class_type: "SDXLEmptyLatentSizePicker+",
    inputs: {
      batch_size: 1,
      height_override: 0,
      resolution: RES_MAP[state.imageMode] || RES_MAP.square,
      width_override: 0,
    },
  };
  wf["171"] = {
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
      seed: finalSeed,
      theme: "🎲 Dynamic Random",
    },
  };
  wf["178:1"] = {
    class_type: "Switch any [Crystools]",
    inputs: {
      boolean: state.dynamicPrompt,
      on_false: ["278", 0],
      on_true: ["171", 0],
    },
  };
  wf["259"] = {
    class_type: "CLIPTextEncode",
    inputs: { clip: ["84", 1], text: ["178:1", 0] },
  };
  wf["267"] = {
    class_type: "SaveImage",
    inputs: {
      filename_prefix: `webui/${new Date().toISOString().split("T")[0]}/${String(
        new Date().getHours(),
      ).padStart(2, "0")}-${String(new Date().getMinutes()).padStart(
        2,
        "0",
      )}-${String(new Date().getSeconds()).padStart(2, "0")}`,
      images: state.useUpscale ? ["274", 0] : ["47", 0],
    },
  };
  wf["278"] = {
    class_type: "Prompt Text (Auto Translate)",
    inputs: { prompt: state.prompt },
  };
  wf["84"] = {
    class_type: "Power Lora Loader (rgthree)",
    inputs: {
      "➕ Add Lora": "",
      clip: ["76", 0],
      lora_1: {
        on: state.useDMD2,
        lora: "DMD2/dmd2_sdxl_4step_lora_fp16.safetensors",
        strength: 1,
      },
      lora_2: {
        on: state.useLoRA && state.lora1,
        lora: "SDXL/add-detail-xl.safetensors",
        strength: 0.95,
      },
      lora_3: {
        on: state.useLoRA && state.lora2,
        lora: "SDXL/Breast Slider - Pony_alpha1.0_rank4_noxattn_last.safetensors",
        strength: 0.85,
      },
      lora_4: {
        on: state.useLoRA && state.lora3,
        lora: "SDXL/Beautify-Supermodel-SDXL.safetensors",
        strength: 0.8,
      },
      model: ["4", 0],
      PowerLoraLoaderHeaderWidget: { type: "PowerLoraLoaderHeaderWidget" },
    },
  };
  wf["279"] = {
    class_type: "KSampler",
    inputs: {
      seed: finalSeed,
      steps: state.steps,
      cfg: state.cfg,
      sampler_name: state.sampler,
      scheduler: state.scheduler,
      denoise: 1,
      model: ["84", 0],
      positive: ["259", 0],
      negative: ["103", 0],
      latent_image: ["6", 0],
    },
  };
  wf["274"] = { class_type: "PreviewImage", inputs: { images: ["47", 0] } };

  if (state.useUpscale) {
    wf["272"] = {
      class_type: "UpscaleModelLoader",
      inputs: { model_name: state.upscaler },
    };
    wf["273"] = {
      class_type: "ImageUpscaleWithModel",
      inputs: {
        seed: finalSeed,
        upscale_model: ["272", 0],
        image: ["47", 0],
      },
    };
    wf["274"] = {
      class_type: "PreviewImage",
      inputs: { images: ["273", 0], any_02: ["47", 0] },
    };
  }

  return {
    workflow: wf,
    metadata: {
      prompt: state.prompt,
      promptNegative: state.negative,
      seed: String(finalSeed),
      checkpoint: state.checkpoint,
      sampler: state.sampler,
      scheduler: state.scheduler,
      steps: state.steps,
      cfg: state.cfg,
      resolution: resSize(state.imageMode),
      imageMode: state.imageMode,
    },
  };
}

export function buildZImageWorkflow(
  state: ZimageGenerationState,
): BuiltWorkflow {
  const { clampedSeed } = computeZimageSeed(state);
  const wf: Record<string, any> = JSON.parse(
    JSON.stringify(ZIMAGE_WORKFLOW_TEMPLATE),
  );

  (wf["7"].inputs as Record<string, unknown>).text = state.prompt;
  (wf["13"].inputs as Record<string, unknown>).seed = clampedSeed;
  (wf["10"].inputs as Record<string, unknown>).sampler_name = state.sampler;
  (wf["10"].inputs as Record<string, unknown>).scheduler = state.scheduler;
  (wf["10"].inputs as Record<string, unknown>).cfg = Number(state.cfg);
  (wf["8"].inputs as Record<string, unknown>).sampler_name = state.sampler;
  (wf["8"].inputs as Record<string, unknown>).scheduler = state.scheduler;
  (wf["8"].inputs as Record<string, unknown>).steps = Number(state.steps);
  (wf["8"].inputs as Record<string, unknown>).cfg = Number(state.cfg);
  (wf["6"].inputs as Record<string, unknown>).width = Number(state.width);
  (wf["6"].inputs as Record<string, unknown>).height = Number(state.height);

  if (state.model) {
    (wf["11"].inputs as Record<string, unknown>).unet_name = state.model;
  }

  const loraText = buildZImageLoraText(state.loras);

  (wf["16"].inputs as Record<string, unknown>).text = loraText;
  (wf["16"].inputs as Record<string, unknown>).loras =
    buildZImageLoraManagerValue(state.loras);

  return {
    workflow: wf,
    metadata: {
      prompt: state.prompt,
      promptNegative: state.negative,
      seed: String(clampedSeed),
      checkpoint: state.model,
      sampler: state.sampler,
      scheduler: state.scheduler,
      steps: state.steps,
      cfg: state.cfg,
      resolution: `${state.width}x${state.height}`,
      imageMode: state.imageMode,
      genMode: "zimage" as const,
    },
  };
}
