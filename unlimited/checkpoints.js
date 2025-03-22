// Cached Checkpoints
const checkpointCache = {};

// Checkpoints Maps
const checkpointNameMapping = {
    // Illustrious
    "Illustrious/cyberillustrious_v30.safetensors": {
        displayName: "CyberIllustrious | v3.0",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "Illustrious/novaRealityXL_illustriousV20.safetensors": {
        displayName: "Nova Reality XL | Illustrious v2.0",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "Illustrious/perfectionRealisticILXL_v12.safetensors": {
        displayName: "Perfection Realistic | Illustrious XL v1.2",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "Illustrious/realismIllustriousBy_v30FP16.safetensors": {
        displayName: "Realism_Illustrious_By_Stable_Yogi | v3.0_FP16",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "Illustrious/redcraftCADSUpdatedMar11_illust3relustion.safetensors": {
        displayName:
            "RedCraft | 红潮 CADS | UPdated-Mar18 | Commercial & Advertising Design System | Illust3Relustion🔥",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "Illustrious/rillusmRealistic_v20.safetensors": {
        displayName: "Rillusm · Realistic IL | v2.0",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },

    // Pony
    "Pony/babesByStableYogi_ponyV4VAEFix.safetensors": {
        displayName: "Babes_By_Stable_Yogi | Pony v4",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "Pony/cyberrealisticPony_v85.safetensors": {
        displayName: "CyberRealistic Pony | v8.5",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "Pony/fasercore_v30PonyFP16.safetensors": {
        displayName: "FaserCore | v3.0_Pony_FP16",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "Pony/fucktasticRealCheckpointPony_21.safetensors": {
        displayName: "Fucktastic Real Checkpoint [Pony/PDXL Porn] [Realistic] [NSFW/SFW] | v2.1",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "Pony/iniverseMixSFWNSFW_ponyRealGuofengV50C.safetensors": {
        displayName: "iNiverse Mix(SFW & NSFW) | Pony Real GuoFeng v5.0C🔥",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "Pony/novaRealityXL_v70.safetensors": {
        displayName: "Nova Reality XL | v7.0",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "Pony/ponyDiffusionV6XL.safetensors": {
        displayName: "Pony Diffusion V6 XL | v6 (start with this one)",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "Pony/pornyPonyByStable_v20FP16.safetensors": {
        displayName: "Porny_Pony_By_Stable_Yogi | v2.0_FP16",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "Pony/realDream_sdxlPony15.safetensors": {
        displayName: "Real Dream | SDXL Pony 15",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "Pony/realismByStableYogi_v40FP16.safetensors": {
        displayName: "Realism_By_Stable_Yogi | v4.0_FP16",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "Pony/uberRealisticPornMergePonyxl_ponyxlHybridV1.safetensors": {
        displayName:
            "Uber Realistic Porn Merge 🦄PonyXL-Hybrid (URPM)|✅XL & Pony LoRAs |✅ControlNet | PonyXL-Hybrid V1",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },

    // SDXL
    "SDXL/1girlPrinter20_v10.safetensors": {
        displayName: "1girl printer 2.0 | v1.0",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/acornIsBoningXL_xlV2.safetensors": {
        displayName: "Acorn Is Boning XL | XL v2",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/agxl_V2.safetensors": {
        displayName: "AGXL | AGXL_v2",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/animaPencilXL_v500.safetensors": {
        displayName: "anima_pencil-XL | v5.0.0",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/annolustxl_v2.safetensors": {
        displayName: "ANNOLustXL | ANNOLustXLV2",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/babesByStableYogi_v4XLFP16.safetensors": {
        displayName: "Babes_By_Stable_Yogi | XL_V4",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/bestPornMergeBPM_v10.safetensors": {
        displayName: "Best Porn Merge [BPM] | v1.0",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/beyondimaginationxl_v0005Fix.safetensors": {
        displayName: "BeyondImaginationXL | v0_005_Fix",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/bigasp_v20.safetensors": {
        displayName: "bigASP 🐍 | v2.0",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/biglovexl2.wBWt.safetensors": {
        displayName: "Big Love | XL2",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/biglust16.kst6.safetensors": {
        displayName: "Big Lust | v1.6",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/biglustydonutmixNSFW_v12.safetensors": {
        displayName: "BigLustyDonutMix (NSFW Realism) | v1.2",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/boomerArtModelBAM_bamV2.safetensors": {
        displayName: "Boomer Art Model (BAM!) | BAM_v2",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/clarityXL_v20.safetensors": {
        displayName: "Clarity XL | v2.0",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/cyberprimeXL_v10.safetensors": {
        displayName: "CyberPrime XL| v1.0",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/cyberrealisticXL_v5.safetensors": {
        displayName: "CyberRealistic XL | v5",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/d33psixSDXL_d33psixSDXL.safetensors": {
        displayName: "D33PSIX - SDXL | D33PSIX - SDXL",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/epicrealismXL_vxvAnewstoryRealism.safetensors": {
        displayName: "epiCRealism XL | VXV-ANewStory (Realism)",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/epicrealismXL_vxviLastfameRealism.safetensors": {
        displayName: "epiCRealism XL | VXVI - LastFAME (Realism)",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/fasercore_xlV1.safetensors": {
        displayName: "FaserCore | XL_V1",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/jibMixRealisticXL_v160Aphrodite.safetensors": {
        displayName: "Jib Mix Realistic XL | v16.0 - Aphrodite",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/juggernautXL_juggXIByRundiffusion.safetensors": {
        displayName: "Juggernaut XL | Jugg_XI_by_RunDiffusion",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/leosamsHelloworldXL_helloworldXL70.safetensors": {
        displayName: "LEOSAM's HelloWorld XL | HelloWorld XL 7.0",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/lustifySDXLNSFW_endgame.safetensors": {
        displayName: "LUSTIFY! [SDXL NSFW checkpoint] | ENDGAME",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/lustifySDXLNSFW_oltONELASTTIME.safetensors": {
        displayName: "LUSTIFY! [SDXL NSFW checkpoint] | OLT (ONE LAST TIME)",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/lustimix_.safetensors": {
        displayName: "LustiMix | LustiMix",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/lustimix_big.safetensors": {
        displayName: "LustiMix | BigLustiMix",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/lustimix_bigRebirth.safetensors": {
        displayName: "LustiMix | BigLustiMix_rebirth",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/mumixxl_v11.safetensors": {
        displayName: "MuMixXL | v1.1",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/msSDXLRealV3_v3.safetensors": {
        displayName: "MS SDXL Real V3 | v3",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/omnigenxlNSFWSFW_v10.safetensors": {
        displayName: "OmnigenXL (NSFW & SFW) | v1.0",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/photoart_V40.safetensors": {
        displayName: "PhotoArt | PhotoArt v4.0",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/photopediaXL_45.safetensors": {
        displayName: "PhotoPedia XL | 4.5",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/polyhedronSDXL_v3.safetensors": {
        displayName: "POLYHEDRON SDXL v3",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/pornmaster_proSDXLV3VAE.safetensors": {
        displayName: "PornMaster-色情大师 | Pro-SDXL-V3-VAE",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/realismByStableYogi_v5XLFP16.safetensors": {
        displayName: "Realism_By_Stable_Yogi | V5_XL_FP16",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/realismEngineSDXL_v30VAE.safetensors": {
        displayName: "Realism Engine SDXL | v3.0 VAE",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/realisticLustXL_v05.safetensors": {
        displayName: "Realistic Lust [XL] | v0.5",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/realisticStockPhoto_v20.safetensors": {
        displayName: "Realistic Stock Photo | v2.0",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/realvisxlV50_v50Bakedvae.safetensors": {
        displayName: "RealVisXL V5.0 | V5.0 (BakedVAE)",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/sd_xl_base_1.0_0.9vae.safetensors": {
        displayName: "SDXL Base 1.0",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/sd_xl_refiner_1.0.safetensors": {
        displayName: "SDXL Refiner 1.0",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/sdXL_v10VAEFix.safetensors": {
        displayName: "SDXL v1.0 VAE Fix",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/sdxlPhotorealisticMix_v10.safetensors": {
        displayName: "SDXL Photorealistic Mix [NSFW] | v1.0",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/sdxxxl_v30.safetensors": {
        displayName: "SDXXXL | v3.0",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/STOIQOAfroditeFLUXXL_XL31.safetensors": {
        displayName: "🟡STOIQO Afrodite | FLUX, XL | 🔵XL 3.1",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/stoiqoNewrealityFLUXSD35_XLPRO.safetensors": {
        displayName: "STOIQO NewReality 🟡 FLUX, SD3.5, SDXL, SD1.5 | 🔵 XL PRO",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/theAramintaExperiment_fv5.safetensors": {
        displayName: "The Araminta Experiment (SDXL+Flux) | Fv5",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },
    "SDXL/unstableIllusion_sdxxxl.safetensors": {
        displayName: "unStable Illusion SDXXXL | SDXXXL",
        sampler: "dpmpp_2s_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 4,
    },

    // SDXL Lightning
    "SDXL-Lightning/agxl_LightningV10.safetensors": {
        displayName: "AGXL | AGXL_Lightning v1.0",
        sampler: "lcm",
        lora: true,
        clip: true,
        clipskip: -2,
        clipskip: -2,
        steps: 11,
        cfg: 1,
    },
    "SDXL-Lightning/babesByStableYogi_v4XLLightning.safetensors": {
        displayName: "Babes_By_Stable_Yogi | V4_XL_Lightning",
        sampler: "lcm",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 1,
    },
    "SDXL-Lightning/copaxTimeless_photorealismSDXL8Step.safetensors": {
        displayName: "Copax TimeLess | Photorealism(SDXL 8 step)",
        sampler: "lcm",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 1,
    },
    "SDXL-Lightning/c_lightningDPMSDE.safetensors": {
        displayName: "DreamShaper XL | Lightning DPM++ SDE",
        sampler: "lcm",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 1,
    },
    "SDXL-Lightning/Epicrealismxl_Hades.safetensors": {
        displayName: "epiCRealismXL-Lightning | 💯 Hades",
        sampler: "lcm",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 1,
    },
    "DMD2/epicrealismXL_vxviLastfameDMD2.safetensors": {
        displayName: "epiCRealism XL | VXVI - LastFAME DMD2 (Realism)",
        sampler: "lcm",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 1,
    },
    "SDXL-Lightning/jibMixRealisticXL_v10Lightning46Step.safetensors": {
        displayName: "Jib Mix Realistic XL | v10 Lightning 4-6 Step",
        sampler: "lcm",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 1,
    },
    "SDXL-Lightning/juggernautXL_v9Rdphoto2Lightning.safetensors": {
        displayName: "Juggernaut XL | V9+RDPhoto2-Lightning_4S",
        sampler: "lcm",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 1,
    },
    "SDXL-Lightning/leosamsHelloworldXL_hw50EulerALightning.safetensors": {
        displayName: "LEOSAM's HelloWorld XL | HW5.0_Euler_a_Lightning",
        sampler: "lcm",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 1,
    },
    "DMD2/lustifySDXLNSFW_endgameDMD2.safetensors": {
        displayName: "LUSTIFY! [SDXL NSFW checkpoint] | ENDGAME ⚡DMD2⚡",
        sampler: "lcm",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 1,
    },
    "DMD2/lustifySDXLNSFW_v40DMD2.safetensors": {
        displayName: "LUSTIFY! [SDXL NSFW checkpoint] | v4.0 ⚡DMD2⚡",
        sampler: "lcm",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 1,
    },
    "SDXL-Lightning/mklanRealistic_mklan220reallight4s.safetensors": {
        displayName: "Mklan Realistic version | Mklan22.0RealLight4S",
        sampler: "ddpm",
        lora: false,
        clip: false,
        clipskip: -2,
        steps: 11,
        cfg: 1,
    },
    "SDXL-Lightning/realismByStableYogi_v5XLLightning.safetensors": {
        displayName: "Realism_By_Stable_Yogi | V5_XL_Lightning",
        sampler: "lcm",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 7,
        cfg: 1,
    },
    "SDXL-Lightning/RealitiesEdgeXLLIGHTNING_LIGHTNING34Step.safetensors": {
        displayName: "⋅ ⊣ Realities Edge XL ⊢ ⋅ LIGHTNING + Turbo! | ⋅ ⊣ Realities Edge XL ⊢ ⋅ LIGHTNING + Turbo!",
        sampler: "dpmpp_sde",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 4,
        cfg: 1.5,
    },
    "SDXL-Lightning/realvisxlV50_v50LightningBakedvae.safetensors": {
        displayName: "RealVisXL V5.0 | V5.0 Lightning (BakedVAE)",
        sampler: "dpmpp_sde",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 4,
        cfg: 2,
    },
    "SDXL-Lightning/stoiqoNewrealityFLUXSD35_XLLight10.safetensors": {
        displayName: "STOIQO NewReality 🟡 FLUX, SD3.5, SDXL, SD1.5 | 🔵 XL Light 1.0",
        sampler: "dpmpp_sde",
        lora: false,
        clip: true,
        clipskip: -1,
        steps: 4,
        cfg: 2,
    },
    "SDXL-Lightning/wildcardxXLLIGHTNING_wildcardxXL.safetensors": {
        displayName: "WildCardX-XL LIGHTNING⚡⚡⚡ | WildCardX-XL+Rundiffusion",
        sampler: "euler_ancestral",
        lora: true,
        clip: true,
        clipskip: -2,
        steps: 11,
        cfg: 1,
    },
};

// Checkpoints
function fetchCheckpointOptions() {
    if (checkpointCache.checkpoints) return checkpointCache.checkpoints;

    // Daftar checkpoint dasar
    const baseCheckpoints = [
        "---- Illustrious ----",
        "Illustrious/cyberillustrious_v30.safetensors",
        "Illustrious/novaRealityXL_illustriousV20.safetensors",
        "Illustrious/perfectionRealisticILXL_v12.safetensors",
        "Illustrious/realismIllustriousBy_v30FP16.safetensors",
        "Illustrious/redcraftCADSUpdatedMar11_illust3relustion.safetensors",
        "Illustrious/rillusmRealistic_v20.safetensors",
        "---- Pony ----",
        "Pony/babesByStableYogi_ponyV4VAEFix.safetensors",
        "Pony/cyberrealisticPony_v85.safetensors",
        "Pony/fasercore_v30PonyFP16.safetensors",
        "Pony/fucktasticRealCheckpointPony_21.safetensors",
        "Pony/iniverseMixSFWNSFW_ponyRealGuofengV50C.safetensors",
        "Pony/novaRealityXL_v70.safetensors",
        "Pony/ponyDiffusionV6XL.safetensors",
        "Pony/pornyPonyByStable_v20FP16.safetensors",
        "Pony/realDream_sdxlPony15.safetensors",
        "Pony/realismByStableYogi_v40FP16.safetensors",
        "Pony/uberRealisticPornMergePonyxl_ponyxlHybridV1.safetensors",
        "---- SDXL ----",
        "SDXL/1girlPrinter20_v10.safetensors",
        "SDXL/acornIsBoningXL_xlV2.safetensors",
        "SDXL/agxl_V2.safetensors",
        "SDXL/animaPencilXL_v500.safetensors",
        "SDXL/annolustxl_v2.safetensors",
        "SDXL/babesByStableYogi_v4XLFP16.safetensors",
        "SDXL/bestPornMergeBPM_v10.safetensors",
        "SDXL/beyondimaginationxl_v0005Fix.safetensors",
        "SDXL/bigasp_v20.safetensors",
        "SDXL/biglovexl2.wBWt.safetensors",
        "SDXL/biglust16.kst6.safetensors",
        "SDXL/biglustydonutmixNSFW_v12.safetensors",
        "SDXL/boomerArtModelBAM_bamV2.safetensors",
        "SDXL/clarityXL_v20.safetensors",
        "SDXL/cyberprimeXL_v10.safetensors",
        "SDXL/cyberrealisticXL_v5.safetensors",
        "SDXL/d33psixSDXL_d33psixSDXL.safetensors",
        "SDXL/epicrealismXL_vxvAnewstoryRealism.safetensors",
        "SDXL/epicrealismXL_vxviLastfameRealism.safetensors",
        "SDXL/fasercore_xlV1.safetensors",
        "SDXL/jibMixRealisticXL_v160Aphrodite.safetensors",
        "SDXL/juggernautXL_juggXIByRundiffusion.safetensors",
        "SDXL/leosamsHelloworldXL_helloworldXL70.safetensors",
        "SDXL/lustifySDXLNSFW_endgame.safetensors",
        "SDXL/lustifySDXLNSFW_oltONELASTTIME.safetensors",
        "SDXL/lustimix_.safetensors",
        "SDXL/lustimix_big.safetensors",
        "SDXL/lustimix_bigRebirth.safetensors",
        "SDXL/mumixxl_v11.safetensors",
        "SDXL/msSDXLRealV3_v3.safetensors",
        "SDXL/omnigenxlNSFWSFW_v10.safetensors",
        "SDXL/photoart_V40.safetensors",
        "SDXL/photopediaXL_45.safetensors",
        "SDXL/polyhedronSDXL_v3.safetensors",
        "SDXL/pornmaster_proSDXLV3VAE.safetensors",
        "SDXL/realismByStableYogi_v5XLFP16.safetensors",
        "SDXL/realismEngineSDXL_v30VAE.safetensors",
        "SDXL/realisticLustXL_v05.safetensors",
        "SDXL/realisticStockPhoto_v20.safetensors",
        "SDXL/realvisxlV50_v50Bakedvae.safetensors",
        "SDXL/sd_xl_base_1.0_0.9vae.safetensors",
        "SDXL/sd_xl_refiner_1.0.safetensors",
        "SDXL/sdXL_v10VAEFix.safetensors",
        "SDXL/sdxlPhotorealisticMix_v10.safetensors",
        "SDXL/sdxxxl_v30.safetensors",
        "SDXL/STOIQOAfroditeFLUXXL_XL31.safetensors",
        "SDXL/stoiqoNewrealityFLUXSD35_XLPRO.safetensors",
        "SDXL/theAramintaExperiment_fv5.safetensors",
        "SDXL/unstableIllusion_sdxxxl.safetensors",
        "---- SDXL Lightning ----",
        "SDXL-Lightning/agxl_LightningV10.safetensors",
        "SDXL-Lightning/babesByStableYogi_v4XLLightning.safetensors",
        "SDXL-Lightning/copaxTimeless_photorealismSDXL8Step.safetensors",
        "SDXL-Lightning/dreamshaperXL_lightningDPMSDE.safetensors",
        "SDXL-Lightning/Epicrealismxl_Hades.safetensors",
        "DMD2/epicrealismXL_vxviLastfameDMD2.safetensors",
        "SDXL-Lightning/jibMixRealisticXL_v10Lightning46Step.safetensors",
        "SDXL-Lightning/juggernautXL_v9Rdphoto2Lightning.safetensors",
        "SDXL-Lightning/leosamsHelloworldXL_hw50EulerALightning.safetensors",
        "DMD2/lustifySDXLNSFW_endgameDMD2.safetensors",
        "DMD2/lustifySDXLNSFW_v40DMD2.safetensors",
        "SDXL-Lightning/mklanRealistic_mklan220reallight4s.safetensors",
        "SDXL-Lightning/realismByStableYogi_v5XLLightning.safetensors",
        "SDXL-Lightning/RealitiesEdgeXLLIGHTNING_LIGHTNING34Step.safetensors",
        "SDXL-Lightning/realvisxlV50_v50LightningBakedvae.safetensors",
        "SDXL-Lightning/stoiqoNewrealityFLUXSD35_XLLight10.safetensors",
        "SDXL-Lightning/wildcardxXLLIGHTNING_wildcardxXL.safetensors",
    ];

    checkpointCache.checkpoints = baseCheckpoints.map((ckpt) => ckpt);
    return checkpointCache.checkpoints;
}

// Samplers
function fetchSamplerOptions() {
    return [
        "euler",
        "euler_cfg_pp",
        "euler_ancestral",
        "euler_ancestral_cfg_pp",
        "heun",
        "heunpp2",
        "dpm_2",
        "dpm_2_ancestral",
        "lms",
        "dpm_fast",
        "dpm_adaptive",
        "dpmpp_2s_ancestral",
        "dpmpp_2s_ancestral_cfg_pp",
        "dpmpp_sde",
        "dpmpp_sde_gpu",
        "dpmpp_2m",
        "dpmpp_2m_cfg_pp",
        "dpmpp_2m_sde",
        "dpmpp_2m_sde_gpu",
        "dpmpp_3m_sde",
        "dpmpp_3m_sde_gpu",
        "ddpm",
        "lcm",
        "ipndm",
        "ipndm_v",
        "deis",
        "res_multistep",
        "res_multistep_cfg_pp",
        "res_multistep_ancestral",
        "res_multistep_ancestral_cfg_pp",
        "gradient_estimation",
        "er_sde",
    ];
}

// Schedulers
function fetchSchedulerOptions() {
    return [
        "normal",
        "karras",
        "exponential",
        "sgm_uniform",
        "simple",
        "ddim_uniform",
        "beta",
        "linear_quadratic",
        "kl_optimal",
    ];
}
