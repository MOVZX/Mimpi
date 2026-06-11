import { useState, useEffect, useCallback, useRef } from "react";
import { Sparkles, Loader2, Download, Trash2, X, Info } from "lucide-react";
import { useGallery } from "@/context/GalleryContext";
import { useToast } from "@/context/ToastContext";
import {
  fetchCheckpoints,
  fetchPresets,
  generateImage,
  pollHistory,
  getImageUrl,
  saveToGallery,
} from "@/services/mimpi";
import type { CheckpointCategory, PresetsData, CheckpointModel } from "@/types";

import {
  SAMPLERS,
  SCHEDULERS,
  UPSCALERS,
  RES_MAP,
  resSize,
  useCollapse,
} from "@/constants/generation";
import { CollapseSection } from "@/components/CollapseSection";
import ZIMAGE_WORKFLOW_TEMPLATE from "./zimageWorkflow";

export function GenerateTab() {
  const { refresh } = useGallery();
  const { addToast } = useToast();
  const [prompt, setPrompt] = useState(
    () =>
      localStorage.getItem("mimpi_prompt") ||
      "1girl, solo, 30yo beautiful asian woman, black hair, pale skin, wearing casual t-shirts and blue jeans, bedroom, intricate details, dynamic pose, looking at viewer, portrait, full upper body close view",
  );
  const [negative, setNegative] = useState(
    () =>
      localStorage.getItem("mimpi_negative") ||
      "worst quality, low quality, illustration, 3d, 2d, painting, cartoons, sketch, bad hands, bad fingers, bad anatomy, average quality",
  );
  const [zimagePrompt, setZimagePrompt] = useState(
    () =>
      localStorage.getItem("mimpi_zimagePrompt") ||
      'hyper-realistic full-body portrait of a stunning 36yo Asian woman, delicate facial features, almond-shaped brown eyes with clear catchlights, soft natural eyebrows, straight nose, rosy pink lips with a gentle closed-mouth smile, fair skin with visible pores and faint freckles across the nose. She has long, straight, jet-black hair with a silky sheen, parted slightly off-center, falling over her shoulders. She is wearing a tight-fitting white cotton t-shirt with a deep U-shaped scoop neck that reveals her collarbones, a stylish colorful text of "HINATA" written on the chest part of t-shirt, the fabric is thin and slightly translucent, showing the texture of the material. She is wearing blue denim jeans, visible at the waist. She is sitting on a dark grey textured sofa, leaning slightly forward, looking directly into the camera lens with a calm, inviting expression. Soft, diffused natural window light coming from the left, illuminating her face and creating soft shadows on the right side of her neck and chest. Plain white wall background, minimalistic interior, 8k resolution, shot on 85mm lens, f/1.8 aperture, highly detailed texture, raw photography.',
  );
  const [zimageNegative, setZimageNegative] = useState(
    () =>
      localStorage.getItem("mimpi_zimageNegative") ||
      "bokeh, blurry image, ugly, bad, poor image quality, low image quality, dull colors, JPEG compression, low resolution, censorship, censored, worst quality, low quality, illustration, 3d, 2d, painting, cartoons, sketch, bad hands, bad fingers, bad anatomy, average quality",
  );
  const [dynamicPrompt, setDynamicPrompt] = useState(
    () => localStorage.getItem("mimpi_dynamicPrompt") === "true",
  );
  const [alwaysRandomisePreset, setAlwaysRandomisePreset] = useState(
    () => localStorage.getItem("mimpi_alwaysRandomisePreset") === "true",
  );
  const [mainPreset, setMainPreset] = useState(
    () => localStorage.getItem("mimpi_mainPreset") || "none",
  );
  const [subcategory, setSubcategory] = useState(
    () => localStorage.getItem("mimpi_subcategory") || "",
  );
  const [imageMode, setImageMode] = useState(
    () => localStorage.getItem("mimpi_imageMode") || "portrait",
  );
  const [genMode, setGenMode] = useState<"sdxl" | "zimage">(
    () =>
      (localStorage.getItem("mimpi_genMode") as "sdxl" | "zimage") || "sdxl",
  );
  const [zimageModel, setZimageModel] = useState(
    () =>
      localStorage.getItem("mimpi_zimageModel") ||
      "Z-Image/beyondREALITY_V30.safetensors",
  );
  const [zimageSampler, setZimageSampler] = useState(
    () => localStorage.getItem("mimpi_zimageSampler") || "euler",
  );
  const [zimageScheduler, setZimageScheduler] = useState(
    () => localStorage.getItem("mimpi_zimageScheduler") || "simple",
  );
  const [zimageSteps, setZimageSteps] = useState(() =>
    parseInt(localStorage.getItem("mimpi_zimageSteps") || "4"),
  );
  const [zimageCfg, setZimageCfg] = useState(() =>
    parseFloat(localStorage.getItem("mimpi_zimageCfg") || "1"),
  );
  const [zimageSeed, setZimageSeed] = useState(
    () => localStorage.getItem("mimpi_zimageSeed") || "",
  );
  const [zimageCurrentSeedNum, setZimageCurrentSeedNum] = useState(() =>
    parseInt(localStorage.getItem("mimpi_zimageCurrentSeedNum") || "0"),
  );
  const [zimageUseDynamicSeed, setZimageUseDynamicSeed] = useState(
    () => localStorage.getItem("mimpi_zimageUseDynamicSeed") === "true",
  );
  const [zimageUseIncSeed, setZimageUseIncSeed] = useState(
    () => localStorage.getItem("mimpi_zimageUseIncSeed") === "true",
  );
  const [zimageWidth, setZimageWidth] = useState(() =>
    Number(localStorage.getItem("mimpi_zimageWidth")) || 896,
  );
  const [zimageHeight, setZimageHeight] = useState(() =>
    Number(localStorage.getItem("mimpi_zimageHeight")) || 1152,
  );

  const [checkpoint, setCheckpoint] = useState(
    () => localStorage.getItem("mimpi_checkpoint") || "",
  );
  const [sampler, setSampler] = useState(
    () => localStorage.getItem("mimpi_sampler") || "lcm",
  );
  const [scheduler, setScheduler] = useState(
    () => localStorage.getItem("mimpi_scheduler") || "exponential",
  );
  const [useDMD2, setUseDMD2] = useState(
    () => localStorage.getItem("mimpi_useDMD2") === "true",
  );
  const [useLoRA, setUseLoRA] = useState(
    () => localStorage.getItem("mimpi_useLoRA") === "true",
  );
  const [lora1, setLora1] = useState(
    () => localStorage.getItem("mimpi_lora1") !== "false",
  );
  const [lora2, setLora2] = useState(
    () => localStorage.getItem("mimpi_lora2") !== "false",
  );
  const [lora3, setLora3] = useState(
    () => localStorage.getItem("mimpi_lora3") !== "false",
  );
  const [useCustomClip, setUseCustomClip] = useState(
    () => localStorage.getItem("mimpi_useCustomClip") === "true",
  );
  const [useClipSkip, setUseClipSkip] = useState(
    () => localStorage.getItem("mimpi_useClipSkip") !== "false",
  );
  const [clipSkipVal, setClipSkipVal] = useState(() =>
    parseInt(localStorage.getItem("mimpi_clipSkipVal") || "-2"),
  );
  const [useUpscale, setUseUpscale] = useState(
    () => localStorage.getItem("mimpi_useUpscale") === "true",
  );
  const [upscaler, setUpscaler] = useState(
    () => localStorage.getItem("mimpi_upscaler") || "4x-ClearRealityV1.pth",
  );
  const [useDynamicSeed, setUseDynamicSeed] = useState(
    () => localStorage.getItem("mimpi_useDynamicSeed") !== "false",
  );
  const [useIncSeed, setUseIncSeed] = useState(
    () => localStorage.getItem("mimpi_useIncSeed") === "true",
  );
  const [steps, setSteps] = useState(() =>
    parseInt(localStorage.getItem("mimpi_steps") || "8"),
  );
  const [cfg, setCfg] = useState(() =>
    parseFloat(localStorage.getItem("mimpi_cfg") || "1"),
  );
  const [seed, setSeed] = useState(
    () => localStorage.getItem("mimpi_seed") || "",
  );
  const [currentSeedNum, setCurrentSeedNum] = useState(() =>
    parseInt(localStorage.getItem("mimpi_currentSeedNum") || "0"),
  );
  const [generating, setGenerating] = useState(false);
  const [resultUrl, setResultUrl] = useState("");
  const [status, setStatus] = useState("");
  const [unloading, setUnloading] = useState(false);
  const [categories, setCategories] = useState<CheckpointCategory[]>([]);
  const [presets, setPresets] = useState<PresetsData>({});
  const [fullScreenImg, setFullScreenImg] = useState("");
  const [showFullScreenInfo, setShowFullScreenInfo] = useState(false);

  const [temaOpen, toggleTema] = useCollapse("tema", true);
  const [modelOpen, toggleModel] = useCollapse("model", true);
  const [advancedOpen, toggleAdvanced] = useCollapse("advanced", true);

  const resultRef = useRef<HTMLDivElement>(null);
  const autoScrolled = useRef(false);

  // ── Persist states ──
  useEffect(() => {
    localStorage.setItem("mimpi_prompt", prompt);
  }, [prompt]);
  useEffect(() => {
    localStorage.setItem("mimpi_negative", negative);
  }, [negative]);
  useEffect(() => {
    localStorage.setItem("mimpi_dynamicPrompt", String(dynamicPrompt));
  }, [dynamicPrompt]);
  useEffect(() => {
    localStorage.setItem("mimpi_imageMode", imageMode);
  }, [imageMode]);
  useEffect(() => {
    localStorage.setItem("mimpi_genMode", genMode);
  }, [genMode]);
  useEffect(() => {
    localStorage.setItem("mimpi_zimageModel", zimageModel);
  }, [zimageModel]);
  useEffect(() => {
    localStorage.setItem(
      "mimpi_alwaysRandomisePreset",
      String(alwaysRandomisePreset),
    );
  }, [alwaysRandomisePreset]);
  useEffect(() => {
    localStorage.setItem("mimpi_mainPreset", mainPreset);
  }, [mainPreset]);
  useEffect(() => {
    localStorage.setItem("mimpi_subcategory", subcategory);
  }, [subcategory]);
  useEffect(() => {
    localStorage.setItem("mimpi_imageMode", imageMode);
  }, [imageMode]);
  useEffect(() => {
    localStorage.setItem("mimpi_checkpoint", checkpoint);
  }, [checkpoint]);
  useEffect(() => {
    localStorage.setItem("mimpi_sampler", sampler);
  }, [sampler]);
  useEffect(() => {
    localStorage.setItem("mimpi_scheduler", scheduler);
  }, [scheduler]);
  useEffect(() => {
    localStorage.setItem("mimpi_useDMD2", String(useDMD2));
  }, [useDMD2]);
  useEffect(() => {
    localStorage.setItem("mimpi_useLoRA", String(useLoRA));
  }, [useLoRA]);
  useEffect(() => {
    localStorage.setItem("mimpi_lora1", String(lora1));
  }, [lora1]);
  useEffect(() => {
    localStorage.setItem("mimpi_lora2", String(lora2));
  }, [lora2]);
  useEffect(() => {
    localStorage.setItem("mimpi_lora3", String(lora3));
  }, [lora3]);
  useEffect(() => {
    localStorage.setItem("mimpi_useCustomClip", String(useCustomClip));
  }, [useCustomClip]);
  useEffect(() => {
    localStorage.setItem("mimpi_useClipSkip", String(useClipSkip));
  }, [useClipSkip]);
  useEffect(() => {
    localStorage.setItem("mimpi_clipSkipVal", String(clipSkipVal));
  }, [clipSkipVal]);
  useEffect(() => {
    localStorage.setItem("mimpi_useUpscale", String(useUpscale));
  }, [useUpscale]);
  useEffect(() => {
    localStorage.setItem("mimpi_upscaler", upscaler);
  }, [upscaler]);
  useEffect(() => {
    localStorage.setItem("mimpi_useDynamicSeed", String(useDynamicSeed));
  }, [useDynamicSeed]);
  useEffect(() => {
    localStorage.setItem("mimpi_useIncSeed", String(useIncSeed));
  }, [useIncSeed]);
  useEffect(() => {
    localStorage.setItem("mimpi_steps", String(steps));
  }, [steps]);
  useEffect(() => {
    localStorage.setItem("mimpi_cfg", String(cfg));
  }, [cfg]);
  useEffect(() => {
    localStorage.setItem("mimpi_seed", seed);
  }, [seed]);
  useEffect(() => {
    localStorage.setItem("mimpi_currentSeedNum", String(currentSeedNum));
  }, [currentSeedNum]);
  useEffect(() => {
    localStorage.setItem("mimpi_zimagePrompt", zimagePrompt);
  }, [zimagePrompt]);
  useEffect(() => {
    localStorage.setItem("mimpi_zimageNegative", zimageNegative);
  }, [zimageNegative]);
  useEffect(() => {
    localStorage.setItem("mimpi_zimageSampler", zimageSampler);
  }, [zimageSampler]);
  useEffect(() => {
    localStorage.setItem("mimpi_zimageScheduler", zimageScheduler);
  }, [zimageScheduler]);
  useEffect(() => {
    localStorage.setItem("mimpi_zimageSteps", String(zimageSteps));
  }, [zimageSteps]);
  useEffect(() => {
    localStorage.setItem("mimpi_zimageCfg", String(zimageCfg));
  }, [zimageCfg]);
  useEffect(() => {
    localStorage.setItem("mimpi_zimageSeed", zimageSeed);
  }, [zimageSeed]);
  useEffect(() => {
    localStorage.setItem("mimpi_zimageWidth", String(zimageWidth));
  }, [zimageWidth]);
  useEffect(() => {
    localStorage.setItem("mimpi_zimageHeight", String(zimageHeight));
  }, [zimageHeight]);
  useEffect(() => {
    localStorage.setItem(
      "mimpi_zimageCurrentSeedNum",
      String(zimageCurrentSeedNum),
    );
  }, [zimageCurrentSeedNum]);
  useEffect(() => {
    localStorage.setItem(
      "mimpi_zimageUseDynamicSeed",
      String(zimageUseDynamicSeed),
    );
  }, [zimageUseDynamicSeed]);
  useEffect(() => {
    localStorage.setItem("mimpi_zimageUseIncSeed", String(zimageUseIncSeed));
  }, [zimageUseIncSeed]);

  // ── Auto-scroll ke gambar hasil generate ──
  useEffect(() => {
    if (resultUrl && !autoScrolled.current) {
      autoScrolled.current = true;
      setTimeout(() => {
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 300);
    }
    if (!resultUrl) autoScrolled.current = false;
  }, [resultUrl]);

  useEffect(() => {
    fetchCheckpoints()
      .then((cats) => {
        setCategories(cats);
        if (!checkpoint) {
          for (const cat of cats)
            for (const m of cat.models) {
              if (m.filename.includes("jibMixRealisticXL")) {
                applyMap(m);
                setCheckpoint(m.filename);
                return;
              }
            }
          if (cats[0]?.models[0]) {
            setCheckpoint(cats[0].models[0].filename);
            applyMap(cats[0].models[0]);
          }
        }
      })
      .catch(() => addToast("Gagal memuat checkpoint", "error"));
    fetchPresets()
      .then(setPresets)
      .catch(() => addToast("Gagal memuat presets", "error"));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const applyMap = useCallback((model: CheckpointModel) => {
    const m = (model as any).mapping;
    if (!m) return;
    if (m.sampler) setSampler(m.sampler);
    if (m.scheduler) setScheduler(m.scheduler);
    if (m.dmd2 !== undefined) setUseDMD2(m.dmd2);
    if (m.lora !== undefined) setUseLoRA(m.lora);
    if (m.clip !== undefined) setUseClipSkip(m.clip);
    if (m.clipskip !== undefined) setClipSkipVal(m.clipskip);
    if (m.steps !== undefined) setSteps(m.steps);
    if (m.cfg !== undefined) setCfg(m.cfg);
  }, []);

  const handleCheckpointChange = (fname: string) => {
    setCheckpoint(fname);
    for (const cat of categories)
      for (const m of cat.models) {
        if (m.filename === fname) {
          applyMap(m);
          return;
        }
      }
  };

  const handleMainPresetChange = (val: string) => {
    setMainPreset(val);
    setSubcategory("");
    if (val === "none") return;
    const [type, key] = val.split(":");
    const data = presets[type as keyof PresetsData];
    if (!data?.[key]) return;
    const keys = Object.keys(data[key].prompts);
    if (keys.length > 0) {
      setSubcategory(keys[0]);
      setPrompt(data[key].prompts[keys[0]]);
    }
  };

  const handleSubcategoryChange = (val: string) => {
    setSubcategory(val);
    if (mainPreset === "none") return;
    const [type, key] = mainPreset.split(":");
    const data = presets[type as keyof PresetsData];
    if (data?.[key]?.prompts[val]) setPrompt(data[key].prompts[val]);
  };

  const buildWf = useCallback(() => {
    const MAX_SEED = 9007199254740991;
    const seedInput = seed;
    let finalBigInt: bigint;
    if (useIncSeed) {
      finalBigInt = BigInt(currentSeedNum) + BigInt(1);
      if (finalBigInt > BigInt(MAX_SEED)) finalBigInt = BigInt(0);
    } else if (
      useDynamicSeed ||
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
    const finalSeed = Number(finalBigInt);
    setCurrentSeedNum(Number(finalBigInt));
    setSeed(String(finalSeed));

    const wf: Record<string, any> = {};
    wf["4"] = {
      class_type: "CheckpointLoaderSimple",
      inputs: { ckpt_name: checkpoint },
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
        clip: useCustomClip ? ["268", 0] : ["4", 1],
        stop_at_clip_layer: useClipSkip ? clipSkipVal : -2,
      },
    };
    wf["103"] = {
      class_type: "CLIPTextEncode",
      inputs: {
        clip: ["84", 1],
        text: `${negative || ""}, embedding:Stable_Yogis_PDXL_Negatives-neg, embedding:CyberRealistic_Negative_SDXL-neg`,
      },
    };
    wf["152"] = {
      class_type: "SDXLEmptyLatentSizePicker+",
      inputs: {
        batch_size: 1,
        height_override: 0,
        resolution: RES_MAP[imageMode] || RES_MAP.square,
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
        boolean: dynamicPrompt,
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
        filename_prefix: `webui/${new Date().toISOString().split("T")[0]}/${String(new Date().getHours()).padStart(2, "0")}-${String(new Date().getMinutes()).padStart(2, "0")}-${String(new Date().getSeconds()).padStart(2, "0")}`,
        images: useUpscale ? ["274", 0] : ["47", 0],
      },
    };
    wf["278"] = {
      class_type: "Prompt Text (Auto Translate)",
      inputs: { prompt },
    };
    wf["84"] = {
      class_type: "Power Lora Loader (rgthree)",
      inputs: {
        "➕ Add Lora": "",
        clip: ["76", 0],
        lora_1: {
          on: useDMD2,
          lora: "DMD2/dmd2_sdxl_4step_lora_fp16.safetensors",
          strength: 1,
        },
        lora_2: {
          on: useLoRA && lora1,
          lora: "SDXL/add-detail-xl.safetensors",
          strength: 0.95,
        },
        lora_3: {
          on: useLoRA && lora2,
          lora: "SDXL/Breast Slider - Pony_alpha1.0_rank4_noxattn_last.safetensors",
          strength: 0.85,
        },
        lora_4: {
          on: useLoRA && lora3,
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
        steps,
        cfg,
        sampler_name: sampler,
        scheduler,
        denoise: 1,
        model: ["84", 0],
        positive: ["259", 0],
        negative: ["103", 0],
        latent_image: ["152", 0],
      },
    };
    wf["274"] = { class_type: "PreviewImage", inputs: { images: ["47", 0] } };
    if (useUpscale) {
      wf["272"] = {
        class_type: "UpscaleModelLoader",
        inputs: { model_name: upscaler },
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
        prompt,
        promptNegative: negative,
        seed: String(finalSeed),
        checkpoint,
        sampler,
        scheduler,
        steps,
        cfg,
        resolution: resSize(imageMode),
        imageMode,
      },
    };
  }, [
    prompt,
    negative,
    checkpoint,
    sampler,
    scheduler,
    steps,
    cfg,
    imageMode,
    dynamicPrompt,
    useDMD2,
    useLoRA,
    lora1,
    lora2,
    lora3,
    useClipSkip,
    clipSkipVal,
    useCustomClip,
    useUpscale,
    upscaler,
    useDynamicSeed,
    useIncSeed,
    seed,
    currentSeedNum,
  ]);

  // ── Z-Image Workflow Builder ──
  const buildWfZImage = useCallback(() => {
    const MAX_SEED = 9007199254740991;
    const seedInput = zimageSeed;
    let finalBigInt: bigint;
    if (zimageUseIncSeed) {
      finalBigInt = BigInt(zimageCurrentSeedNum) + BigInt(1);
      if (finalBigInt > BigInt(MAX_SEED)) finalBigInt = BigInt(0);
    } else if (
      zimageUseDynamicSeed ||
      !seedInput ||
      seedInput === "-1" ||
      isNaN(Number(seedInput))
    ) {
      finalBigInt = BigInt(Math.floor(Math.random() * Number(MAX_SEED)));
    } else {
      finalBigInt = BigInt(seedInput);
    }
    const finalSeed = finalBigInt.toString();

    // Deep clone the template
    const wf: Record<string, unknown> = JSON.parse(
      JSON.stringify(ZIMAGE_WORKFLOW_TEMPLATE),
    );

    // Inject prompt, seed, sampler, scheduler, steps, cfg, width, height
    (wf["90"].inputs as Record<string, unknown>).text = zimagePrompt;
    (wf["63"].inputs as Record<string, unknown>).noise_seed = Number(finalSeed);
    (wf["63"].inputs as Record<string, unknown>).sampler_name = zimageSampler;
    (wf["63"].inputs as Record<string, unknown>).scheduler = zimageScheduler;
    (wf["63"].inputs as Record<string, unknown>).steps = Number(zimageSteps);
    (wf["63"].inputs as Record<string, unknown>).cfg = Number(zimageCfg);
    (wf["120"].inputs as Record<string, unknown>).seed = Number(finalSeed);
    (wf["120"].inputs as Record<string, unknown>).sampler_name = zimageSampler;
    (wf["120"].inputs as Record<string, unknown>).scheduler = zimageScheduler;
    (wf["120"].inputs as Record<string, unknown>).steps = Number(zimageSteps);
    (wf["120"].inputs as Record<string, unknown>).cfg = Number(zimageCfg);
    (wf["152"].inputs as Record<string, unknown>).width = Number(zimageWidth);
    (wf["152"].inputs as Record<string, unknown>).height = Number(zimageHeight);

    if (zimageModel) {
      (wf["98"].inputs as Record<string, unknown>).unet_name = zimageModel;
    }

    const metadata: Record<string, unknown> = {
      prompt: zimagePrompt,
      promptNegative: zimageNegative,
      seed: String(finalSeed),
      checkpoint: zimageModel,
      sampler: zimageSampler,
      scheduler: zimageScheduler,
      steps: zimageSteps,
      cfg: zimageCfg,
      resolution: `${zimageWidth}x${zimageHeight}`,
      imageMode,
      genMode: "zimage" as const,
    };

    return { workflow: wf, metadata };
  }, [
    zimagePrompt,
    zimageNegative,
    zimageSeed,
    zimageUseIncSeed,
    zimageUseDynamicSeed,
    zimageCurrentSeedNum,
    zimageSampler,
    zimageScheduler,
    zimageSteps,
    zimageCfg,
    imageMode,
    zimageModel,
    zimageWidth,
    zimageHeight,
  ]);
  const handleGenerate = async () => {
    if (!prompt.trim() || generating) return;

    // Acak Preset? — pick random preset before generate
    if (alwaysRandomisePreset) {
      const allEntries: { type: string; key: string }[] = [];
      Object.entries(presets).forEach(([type, data]) => {
        if (data)
          Object.keys(data).forEach((k) => allEntries.push({ type, key: k }));
      });
      if (allEntries.length > 0) {
        const pick = allEntries[Math.floor(Math.random() * allEntries.length)];
        const val = `${pick.type}:${pick.key}`;
        setMainPreset(val);
        const data = presets[pick.type as keyof PresetsData];
        if (data?.[pick.key]) {
          const pkeys = Object.keys(data[pick.key].prompts);
          if (pkeys.length > 0) {
            const sp = pkeys[Math.floor(Math.random() * pkeys.length)];
            setSubcategory(sp);
            setPrompt(data[pick.key].prompts[sp]);
          }
        }
      }
    }

    setGenerating(true);
    setResultUrl("");
    setStatus("Mengirim ke ComfyUI...");
    try {
      const { workflow, metadata } =
        genMode === "zimage" ? buildWfZImage() : buildWf();
      const { prompt_id } = await generateImage(workflow);
      setStatus("Menunggu hasil...");
      let imgData: any = null;
      for (let i = 0; i < 60; i++) {
        await new Promise((r) => setTimeout(r, 1500));
        imgData = await pollHistory(prompt_id);
        if (imgData) break;
      }
      if (!imgData)
        throw new Error("Timeout: gambar tidak selesai dalam 90 detik");
      const url = getImageUrl(
        imgData.filename,
        imgData.subfolder,
        imgData.type,
      );
      setResultUrl(url);
      try {
        const blob = await (await fetch(url)).blob();
        await saveToGallery(blob, metadata);
        setStatus("✅ Gambar berhasil dibuat & disimpan!");
        refresh();
      } catch {
        setStatus("✅ Gambar berhasil dibuat");
      }
    } catch (e: any) {
      setStatus(`❌ ${e.message || "Error"}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleUnloadModels = async () => {
    setUnloading(true);
    try {
      const r = await fetch("/api/comfy/free", { method: "POST" });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.detail || "Gagal unload model");
      }
    } catch (e: any) {
      setStatus(`❌ ${e.message || "Error unload"}`);
    } finally {
      setUnloading(false);
    }
  };

  const presetGroups: {
    label: string;
    opts: { value: string; label: string }[];
  }[] = [];
  Object.entries(presets).forEach(([type, data]) => {
    if (!data) return;
    const gLabel =
      type === "general" ? "General" : type === "sfw" ? "SFW" : "NSFW";
    const opts = Object.entries(data).map(([k, v]) => ({
      value: `${type}:${k}`,
      label: (v as { label: string }).label,
    }));
    if (opts.length) presetGroups.push({ label: gLabel, opts });
  });

  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto max-w-3xl mx-auto w-full">
      <div className="flex flex-col gap-3">
        {/* ── Mode Toggle ── */}
        <div className="bg-white dark:bg-surface-900/80 rounded-xl border border-surface-200/80 dark:border-surface-700/80 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
              Engine
            </span>
            <div className="flex bg-surface-100 dark:bg-surface-800 rounded-lg p-0.5">
              <button
                onClick={() => setGenMode("sdxl")}
                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  genMode === "sdxl"
                    ? "bg-primary-500 text-white shadow-sm"
                    : "text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200"
                }`}
              >
                SDXL
              </button>
              <button
                onClick={() => setGenMode("zimage")}
                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  genMode === "zimage"
                    ? "bg-primary-500 text-white shadow-sm"
                    : "text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200"
                }`}
              >
                Z-Image
              </button>
            </div>
          </div>
        </div>

        {/* Prompt */}
        <div className="bg-white dark:bg-surface-900/80 rounded-xl border border-surface-200/80 dark:border-surface-700/80 p-4 space-y-3 shadow-sm">
          <h2 className="text-sm font-semibold text-surface-800 dark:text-surface-100 flex items-center gap-2">
            <Sparkles size={16} className="text-primary-500" /> Generate Image
          </h2>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
              Deskripsi Gambar (Positif)
            </label>
            <textarea
              value={genMode === "zimage" ? zimagePrompt : prompt}
              onChange={(e) =>
                genMode === "zimage"
                  ? setZimagePrompt(e.target.value)
                  : setPrompt(e.target.value)
              }
              rows={4}
              className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder-surface-400"
              placeholder="Masukkan deskripsi gambar..."
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
              Hindari (Negatif)
            </label>
            <textarea
              value={genMode === "zimage" ? zimageNegative : negative}
              onChange={(e) =>
                genMode === "zimage"
                  ? setZimageNegative(e.target.value)
                  : setNegative(e.target.value)
              }
              rows={2}
              className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder-surface-400"
              placeholder="Hal-hal yang ingin dihindari..."
            />
          </div>
          {genMode === "sdxl" && (
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dynamicPrompt}
                  onChange={(e) => setDynamicPrompt(e.target.checked)}
                  className="w-3.5 h-3.5 accent-primary-500"
                />
                <span className="text-xs text-surface-600 dark:text-surface-300">
                  Acak tema, gaya, dan lokasi?
                </span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={alwaysRandomisePreset}
                  onChange={(e) => setAlwaysRandomisePreset(e.target.checked)}
                  className="w-3.5 h-3.5 accent-primary-500"
                />
                <span className="text-xs text-surface-600 dark:text-surface-300">
                  Acak Preset?
                </span>
              </label>
            </div>
          )}
        </div>

        {genMode === "sdxl" && (
          <>
            {/* Tema & Mode — COLLAPSED by default */}
            <CollapseSection
              title="Tema & Mode"
              emoji="🎭"
              open={temaOpen}
              onToggle={toggleTema}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                    Tema
                  </label>
                  <select
                    value={mainPreset}
                    onChange={(e) => handleMainPresetChange(e.target.value)}
                    className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="none">Tidak Ada</option>
                    {presetGroups.map((g) => (
                      <optgroup key={g.label} label={g.label}>
                        {g.opts.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                {mainPreset !== "none" && (
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                      Preset
                    </label>
                    <select
                      value={subcategory}
                      onChange={(e) => handleSubcategoryChange(e.target.value)}
                      className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      {(() => {
                        const [t, k] = (mainPreset || "none").split(":");
                        const d = presets[t as keyof PresetsData];
                        if (!d?.[k]) return null;
                        return Object.keys(d[k].prompts).map((pk) => (
                          <option key={pk} value={pk}>
                            {k} {pk}
                          </option>
                        ));
                      })()}
                    </select>
                  </div>
                )}
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                  Mode Gambar
                </label>
                <select
                  value={imageMode}
                  onChange={(e) => setImageMode(e.target.value)}
                  className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="portrait">Portrait (896×1152)</option>
                  <option value="landscape">Landscape (1152×896)</option>
                  <option value="square">Square (1024×1024)</option>
                </select>
              </div>
            </CollapseSection>
          </>
        )}

        {/* Z-Image Controls — model + sampler/scheduler/steps/cfg/seed */}
        {genMode === "zimage" && (
          <CollapseSection
            title="Z-Image"
            emoji="⚡"
            open={true}
            onToggle={() => {}}
          >
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                  Unet Model
                </label>
                <select
                  value={zimageModel}
                  onChange={(e) => setZimageModel(e.target.value)}
                  className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="Z-Image/2127ZImageAsianUtopian_v36TurboFFV.safetensors">
                    2127ZImageAsianUtopian_v36TurboFFV
                  </option>
                  <option value="Z-Image/beyondREALITY_V30.safetensors">
                    beyondREALITY_V30
                  </option>
                  <option value="Z-Image/bigLove_zt3.safetensors">
                    bigLove_zt3
                  </option>
                  <option value="Z-Image/cyberrealisticZImage_v50.safetensors">
                    cyberrealisticZImage_v50
                  </option>
                  <option value="Z-Image/darkBeast_darkblitz6Beyondnsfw.safetensors">
                    darkBeast_darkblitz6Beyondnsfw
                  </option>
                  <option value="Z-Image/gonzalomoZpop_v40.safetensors">
                    gonzalomoZpop_v40
                  </option>
                  <option value="Z-Image/intorealism_zitV50.safetensors">
                    intorealism_zitV50
                  </option>
                  <option value="Z-Image/intorealismZITAsian_v20FP8.safetensors">
                    intorealismZITAsian_v20 FP8
                  </option>
                  <option value="Z-Image/moodyProMix_zitV12DPO.safetensors">
                    moodyProMix_zitV12DPO
                  </option>
                  <option value="Z-Image/moodyProMix_zitV12DPOFP8.safetensors">
                    moodyProMix_zitV12DPO FP8
                  </option>
                  <option value="Z-Image/pornmasterZImage_baseV1.safetensors">
                    pornmasterZImage_baseV1
                  </option>
                  <option value="Z-Image/pornmasterZImage_turboV35Bf16.safetensors">
                    pornmasterZImage_turboV35Bf16
                  </option>
                  <option value="Z-Image/pornmasterZImage_turboV35Fp8.safetensors">
                    pornmasterZImage_turboV35Fp8
                  </option>
                  <option value="Z-Image/realDream_zitV6.safetensors">
                    realDream_zitV6
                  </option>
                  <option value="Z-Image/redcraftERNIERedmix_redzit15AIO.safetensors">
                    redcraftERNIERedmix_redzit15AIO
                  </option>
                  <option value="Z-Image/unstablebastard_7.safetensors">
                    unstablebastard_7
                  </option>
                  <option value="Z-Image/unstablebastard_v9.safetensors">
                    unstablebastard_v9
                  </option>
                  <option value="Z-Image/unstablebastard_v9_fp8.safetensors">
                    unstablebastard_v9_fp8
                  </option>
                  <option value="Z-Image/zImageTurboNSFW_82BF16FP8.safetensors">
                    zImageTurboNSFW_82BF16FP8
                  </option>
                  <option value="Z-Image/zimageTurboNSFWBy_2602NSFWBF16.safetensors">
                    zimageTurboNSFWBy_2602NSFWBF16
                  </option>
                  <option value="Z-Image/zit_v11.safetensors">zit_v11</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                    Sampler
                  </label>
                  <select
                    value={zimageSampler}
                    onChange={(e) => setZimageSampler(e.target.value)}
                    className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    {SAMPLERS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                    Scheduler
                  </label>
                  <select
                    value={zimageScheduler}
                    onChange={(e) => setZimageScheduler(e.target.value)}
                    className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    {SCHEDULERS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                    Steps
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={zimageSteps}
                    onChange={(e) =>
                      setZimageSteps(parseInt(e.target.value) || 8)
                    }
                    className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                    CFG
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    step={0.1}
                    value={zimageCfg}
                    onChange={(e) =>
                      setZimageCfg(parseFloat(e.target.value) || 1)
                    }
                    className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                    Seed
                  </label>
                  <input
                    type="number"
                    min={-1}
                    value={zimageSeed}
                    onChange={(e) => setZimageSeed(e.target.value)}
                    placeholder="-1 = random"
                    className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>
              {/* Width & Height */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                    Width
                  </label>
                  <input
                    type="number"
                    min={256}
                    max={2048}
                    step={8}
                    value={zimageWidth}
                    onChange={(e) =>
                      setZimageWidth(parseInt(e.target.value) || 896)
                    }
                    className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                    Height
                  </label>
                  <input
                    type="number"
                    min={256}
                    max={2048}
                    step={8}
                    value={zimageHeight}
                    onChange={(e) =>
                      setZimageHeight(parseInt(e.target.value) || 1152)
                    }
                    className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          </CollapseSection>
        )}

        {genMode === "sdxl" && (
          <>
            {/* Model — COLLAPSED by default */}
            <CollapseSection
              title="Model"
              emoji="⚙️"
              open={modelOpen}
              onToggle={toggleModel}
            >
              <div>
                <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                  Checkpoint
                </label>
                <select
                  value={checkpoint}
                  onChange={(e) => handleCheckpointChange(e.target.value)}
                  className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  {categories.length === 0 && (
                    <option value="">Loading...</option>
                  )}
                  {categories.map((cat) => (
                    <optgroup key={cat.name} label={cat.name}>
                      {cat.models.map((m) => (
                        <option key={m.filename} value={m.filename}>
                          {m.displayName}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                    Sampler
                  </label>
                  <select
                    value={sampler}
                    onChange={(e) => setSampler(e.target.value)}
                    className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    {SAMPLERS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                    Scheduler
                  </label>
                  <select
                    value={scheduler}
                    onChange={(e) => setScheduler(e.target.value)}
                    className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    {SCHEDULERS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CollapseSection>

            {/* Advanced */}
            <CollapseSection
              title="Opsi Tingkat Lanjut"
              emoji="🔧"
              open={advancedOpen}
              onToggle={toggleAdvanced}
            >
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useDMD2}
                  onChange={(e) => setUseDMD2(e.target.checked)}
                  className="w-3.5 h-3.5 accent-primary-500"
                />
                <span className="text-xs text-surface-600 dark:text-surface-300">
                  Gunakan DMD2?
                </span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useLoRA}
                  onChange={(e) => setUseLoRA(e.target.checked)}
                  className="w-3.5 h-3.5 accent-primary-500"
                />
                <span className="text-xs text-surface-600 dark:text-surface-300">
                  Gunakan LoRA?
                </span>
              </label>
              {useLoRA && (
                <div className="ml-5 space-y-1.5">
                  {[
                    { v: lora1, s: setLora1, l: "Detail Tweaker" },
                    { v: lora2, s: setLora2, l: "Breast Slider" },
                    { v: lora3, s: setLora3, l: "Beautify Supermodel" },
                  ].map((x) => (
                    <label
                      key={x.l}
                      className="flex items-center gap-1.5 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={x.v}
                        onChange={(e) => x.s(e.target.checked)}
                        className="w-3 h-3 accent-primary-500"
                      />
                      <span className="text-xs text-surface-500 dark:text-surface-400">
                        {x.l}
                      </span>
                    </label>
                  ))}
                </div>
              )}
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCustomClip}
                  onChange={(e) => setUseCustomClip(e.target.checked)}
                  className="w-3.5 h-3.5 accent-primary-500"
                />
                <span className="text-xs text-surface-600 dark:text-surface-300">
                  Gunakan Custom CLIP?
                </span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useClipSkip}
                  onChange={(e) => setUseClipSkip(e.target.checked)}
                  className="w-3.5 h-3.5 accent-primary-500"
                />
                <span className="text-xs text-surface-600 dark:text-surface-300">
                  Gunakan CLIP Skip?
                </span>
              </label>
              {useClipSkip && (
                <div className="ml-5">
                  <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                    CLIP Skip (-10 to -1)
                  </label>
                  <input
                    type="number"
                    min={-10}
                    max={-1}
                    value={clipSkipVal}
                    onChange={(e) =>
                      setClipSkipVal(parseInt(e.target.value) || -2)
                    }
                    className="w-20 text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              )}
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useUpscale}
                  onChange={(e) => setUseUpscale(e.target.checked)}
                  className="w-3.5 h-3.5 accent-primary-500"
                />
                <span className="text-xs text-surface-600 dark:text-surface-300">
                  Gunakan Upscale?
                </span>
              </label>
              {useUpscale && (
                <div className="ml-5">
                  <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                    Upscaler
                  </label>
                  <select
                    value={upscaler}
                    onChange={(e) => setUpscaler(e.target.value)}
                    className="w-full max-w-xs text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    {UPSCALERS.map((u) => (
                      <option key={u} value={u}>
                        {u.replace(/\.pth$/, "").replace(/\.pt$/, "")}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useDynamicSeed}
                  onChange={(e) => {
                    setUseDynamicSeed(e.target.checked);
                    if (e.target.checked) setUseIncSeed(false);
                  }}
                  className="w-3.5 h-3.5 accent-primary-500"
                />
                <span className="text-xs text-surface-600 dark:text-surface-300">
                  Acak Nomor Seed?
                </span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useIncSeed}
                  onChange={(e) => {
                    setUseIncSeed(e.target.checked);
                    if (e.target.checked) setUseDynamicSeed(false);
                  }}
                  disabled={useDynamicSeed}
                  className="w-3.5 h-3.5 accent-primary-500"
                />
                <span className="text-xs text-surface-600 dark:text-surface-300">
                  Gunakan Incremental Seed?
                </span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                    Steps
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={steps}
                    onChange={(e) => setSteps(parseInt(e.target.value) || 8)}
                    className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                    CFG
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    step={0.1}
                    value={cfg}
                    onChange={(e) => setCfg(parseFloat(e.target.value) || 1)}
                    className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1 block">
                    Seed
                  </label>
                  <input
                    type="number"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    placeholder="-1"
                    className="w-full text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>
            </CollapseSection>
          </>
        )}

        {/* Reset ke Default */}
        <div className="flex justify-end">
          <button
            onClick={() => {
              const keys = Object.keys(localStorage).filter((k) =>
                k.startsWith("mimpi_"),
              );
              keys.forEach((k) => localStorage.removeItem(k));
              window.location.reload();
            }}
            className="text-[10px] text-surface-400 dark:text-surface-500 hover:text-red-500 dark:hover:text-red-400 transition-colors underline underline-offset-2"
          >
            🔄 Reset semua setting ke default
          </button>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={generating || !prompt.trim()}
          className="w-full py-3 rounded-xl text-sm font-semibold bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors shadow-sm"
        >
          {generating ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              {status}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Sparkles size={16} />✨ Buat Gambar
            </span>
          )}
        </button>

        <button
          onClick={handleUnloadModels}
          disabled={unloading}
          className="w-full py-2.5 rounded-xl text-xs font-medium bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 disabled:opacity-50 disabled:cursor-not-allowed text-surface-600 dark:text-surface-300 transition-colors border border-surface-200 dark:border-surface-700"
        >
          {unloading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-surface-400 border-t-transparent rounded-full" />
              Unloading...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              🗑️ Unload All Models (Free VRAM)
            </span>
          )}
        </button>

        {status && !generating && (
          <p
            className={`text-xs ${status.includes("❌") ? "text-red-500" : "text-emerald-500"}`}
          >
            {status}
          </p>
        )}

        {/* Result — auto-scroll ke sini */}
        {resultUrl ? (
          <div
            ref={resultRef}
            className="rounded-xl overflow-hidden border border-surface-200 dark:border-surface-700 bg-surface-950"
          >
            <img
              src={resultUrl}
              alt="Generated"
              className="w-full cursor-pointer"
              onClick={() => setFullScreenImg(resultUrl)}
              onLoad={() => {
                resultRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
            />
            <div className="flex gap-2 p-2 bg-surface-100 dark:bg-surface-800">
              <a
                href={resultUrl}
                download
                className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition-colors shadow-sm"
              >
                <Download size={14} /> Download
              </a>
              <button
                onClick={() => setResultUrl("")}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 dark:bg-red-500/30 dark:hover:bg-red-500/40 text-red-600 dark:text-red-400 transition-colors"
              >
                <Trash2 size={14} /> Clear
              </button>
            </div>
          </div>
        ) : generating ? (
          <div
            ref={resultRef}
            className="rounded-xl overflow-hidden border border-surface-200 dark:border-surface-700"
          >
            {/* Image skeleton */}
            <div className="relative w-full aspect-[4/3] bg-surface-800/50 animate-pulse">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <svg
                    className="w-10 h-10 text-surface-600 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  <span className="text-sm text-surface-500 animate-pulse">
                    Generating...
                  </span>
                </div>
              </div>
              {/* Shimmer overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-surface-700/30 to-transparent animate-shimmer" />
            </div>
            {/* Button skeleton */}
            <div className="flex gap-2 p-2 bg-surface-100 dark:bg-surface-800">
              <div className="flex-1 h-9 rounded-lg bg-surface-200 dark:bg-surface-700 animate-pulse" />
              <div className="flex-1 h-9 rounded-lg bg-surface-200 dark:bg-surface-700 animate-pulse" />
            </div>
          </div>
        ) : null}
      </div>

      {/* ── Fullscreen overlay — desktop-aware Lightbox ── */}
      {fullScreenImg && (
        <>
          {/* Overlay backdrop + desktop layout */}
          <div
            className="fixed inset-0 z-50 bg-black/95 flex animate-fade-in lg:flex-row flex-col"
            onClick={() => {
              setFullScreenImg("");
              setShowFullScreenInfo(false);
            }}
          >
            {/* Close button */}
            <button
              onClick={() => {
                setFullScreenImg("");
                setShowFullScreenInfo(false);
              }}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
            >
              <X size={24} />
            </button>

            {/* ── Image area ── */}
            <div
              className="flex-1 flex items-center justify-center p-4 min-w-0"
              onClick={() => setFullScreenImg("")}
            >
              <img
                src={fullScreenImg}
                alt="Full screen"
                className="max-w-full max-h-[90vh] object-contain rounded-lg cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* ── Desktop info sidebar (lg+) ── */}
            <aside
              className="hidden lg:block lg:w-96 lg:min-w-96 overflow-y-auto bg-white dark:bg-surface-900 border-l border-surface-200 dark:border-surface-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white dark:bg-surface-900 z-10 flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-700">
                <span className="text-sm font-semibold text-surface-800 dark:text-surface-100">
                  Image Info
                </span>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 flex items-center gap-2">
                    <Sparkles size={14} /> Prompt
                  </h3>
                  <p className="text-sm text-surface-600 dark:text-surface-400 bg-surface-50 dark:bg-surface-800 rounded-lg p-3 leading-relaxed">
                    {prompt}
                  </p>
                </div>
                {negative && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300">
                      Negative Prompt
                    </h3>
                    <p className="text-sm text-surface-600 dark:text-surface-400 bg-surface-50 dark:bg-surface-800 rounded-lg p-3 leading-relaxed">
                      {negative}
                    </p>
                  </div>
                )}
                <div className="h-px bg-surface-200 dark:bg-surface-700" />
                <div className="grid grid-cols-2 gap-3">
                  <MiniDetail
                    label="Model"
                    value={checkpoint.split("/").pop() || checkpoint}
                  />
                  <MiniDetail label="Sampler" value={sampler} />
                  <MiniDetail label="Scheduler" value={scheduler} />
                  <MiniDetail label="Steps" value={String(steps)} />
                  <MiniDetail label="CFG" value={String(cfg)} />
                  <MiniDetail
                    label="Seed"
                    value={seed || String(currentSeedNum)}
                  />
                  <MiniDetail label="Mode" value={imageMode} />
                </div>
              </div>
            </aside>

            {/* ── Mobile info button (lg:hidden) ── */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowFullScreenInfo(true);
              }}
              className="lg:hidden absolute bottom-6 right-6 z-10 p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors shadow-lg"
              aria-label="Show info"
            >
              <Info size={22} />
            </button>
          </div>

          {/* ── Mobile info bottom-sheet overlay ── */}
          {showFullScreenInfo && (
            <div
              className="fixed inset-0 z-[60] flex flex-col bg-black/60 backdrop-blur-sm animate-fade-in lg:hidden"
              onClick={() => setShowFullScreenInfo(false)}
            >
              <div
                className="flex-1 min-h-0 bg-white dark:bg-surface-900 overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-white dark:bg-surface-900 z-10 flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-700">
                  <span className="text-sm font-semibold text-surface-800 dark:text-surface-100">
                    Image Info
                  </span>
                  <button
                    onClick={() => setShowFullScreenInfo(false)}
                    className="p-2 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 flex items-center gap-2">
                      <Sparkles size={14} /> Prompt
                    </h3>
                    <p className="text-sm text-surface-600 dark:text-surface-400 bg-surface-50 dark:bg-surface-800 rounded-lg p-3 leading-relaxed">
                      {prompt}
                    </p>
                  </div>
                  {negative && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300">
                        Negative Prompt
                      </h3>
                      <p className="text-sm text-surface-600 dark:text-surface-400 bg-surface-50 dark:bg-surface-800 rounded-lg p-3 leading-relaxed">
                        {negative}
                      </p>
                    </div>
                  )}
                  <div className="h-px bg-surface-200 dark:bg-surface-700" />
                  <div className="grid grid-cols-2 gap-3">
                    <MiniDetail
                      label="Model"
                      value={checkpoint.split("/").pop() || checkpoint}
                    />
                    <MiniDetail label="Sampler" value={sampler} />
                    <MiniDetail label="Scheduler" value={scheduler} />
                    <MiniDetail label="Steps" value={String(steps)} />
                    <MiniDetail label="CFG" value={String(cfg)} />
                    <MiniDetail
                      label="Seed"
                      value={seed || String(currentSeedNum)}
                    />
                    <MiniDetail label="Mode" value={imageMode} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MiniDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-50 dark:bg-surface-800 rounded-lg p-2.5">
      <p className="text-[10px] font-medium text-surface-400 dark:text-surface-500 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-medium text-surface-800 dark:text-surface-200 mt-0.5 break-all">
        {value}
      </p>
    </div>
  );
}
