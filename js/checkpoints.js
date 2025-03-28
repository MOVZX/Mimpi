// Cached Checkpoints
const checkpointCache = {};

// Checkpoints Maps
const checkpointNameMapping = {
    // DMD2
    "DMD2/centerfold_versionXIDmd2.safetensors": {
        displayName: "Centerfold | version XI dmd2",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: false,
        nsfw: true,
    },
    "DMD2/epicrealismXL_vxviLastfameDMD2.safetensors": {
        displayName: "epiCRealism XL | VXVI - LastFAME DMD2 (Realism)",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: false,
        nsfw: true,
    },
    "DMD2/lustifySDXLNSFW_endgameDMD2.safetensors": {
        displayName: "LUSTIFY! [SDXL NSFW checkpoint] | ENDGAME ⚡DMD2⚡",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: false,
        nsfw: true,
    },
    "DMD2/lustifySDXLNSFW_v40DMD2.safetensors": {
        displayName: "LUSTIFY! [SDXL NSFW checkpoint] | v4.0 ⚡DMD2⚡",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: false,
        nsfw: true,
    },

    // Illustrious
    "Illustrious/cyberillustrious_v30.safetensors": {
        displayName: "CyberIllustrious | v3.0",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "Illustrious/novaRealityXL_illustriousV20.safetensors": {
        displayName: "Nova Reality XL | Illustrious v2.0",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "Illustrious/perfection3DILXLIllustrious_v11.safetensors": {
        displayName: "Perfection 3D [ILXL / Illustrious XL] - NSFW / SFW Checkpoint | v1.1",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "Illustrious/perfectionRealisticILXL_v12.safetensors": {
        displayName: "Perfection Realistic | Illustrious XL v1.2",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "Illustrious/realismIllustriousBy_v30FP16.safetensors": {
        displayName: "Realism_Illustrious_By_Stable_Yogi | v3.0_FP16",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "Illustrious/redcraftCADSUpdatedMar11_illust3relustion.safetensors": {
        displayName:
            "RedCraft | 红潮 CADS | UPdated-Mar18 | Commercial & Advertising Design System | Illust3Relustion🔥",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "Illustrious/rillusmRealistic_v20.safetensors": {
        displayName: "Rillusm · Realistic IL | v2.0",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },

    // Pony
    "Pony/babesByStableYogi_ponyV4VAEFix.safetensors": {
        displayName: "Babes_By_Stable_Yogi | Pony v4",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "Pony/cyberrealisticPony_v85.safetensors": {
        displayName: "CyberRealistic Pony | v8.5",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "Pony/fasercore_v30PonyFP16.safetensors": {
        displayName: "FaserCore | v3.0_Pony_FP16",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "Pony/fucktasticRealCheckpointPony_21.safetensors": {
        displayName: "Fucktastic Real Checkpoint [Pony/PDXL Porn] [Realistic] [NSFW/SFW] | v2.1",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "Pony/iniverseMixSFWNSFW_ponyRealGuofengV50C.safetensors": {
        displayName: "iNiverse Mix(SFW & NSFW) | Pony Real GuoFeng v5.0C🔥",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "Pony/novaRealityXL_v70.safetensors": {
        displayName: "Nova Reality XL | v7.0",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "Pony/ponyDiffusionV6XL.safetensors": {
        displayName: "Pony Diffusion V6 XL | v6 (start with this one)",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "Pony/realDream_sdxlPony15.safetensors": {
        displayName: "Real Dream | SDXL Pony 15",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "Pony/realismByStableYogi_v40FP16.safetensors": {
        displayName: "Realism_By_Stable_Yogi | v4.0_FP16",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },

    // SDXL
    "SDXL/1girlPrinter20_v10.safetensors": {
        displayName: "1girl printer 2.0 | v1.0",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/agxl_V2.safetensors": {
        displayName: "AGXL | AGXL_v2",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/animaPencilXL_v500.safetensors": {
        displayName: "anima_pencil-XL | v5.0.0",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/annolustxl_v2.safetensors": {
        displayName: "ANNOLustXL | ANNOLustXLV2",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/babesByStableYogi_v4XLFP16.safetensors": {
        displayName: "Babes_By_Stable_Yogi | XL_V4",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/beyondimaginationxl_v0005Fix.safetensors": {
        displayName: "BeyondImaginationXL | v0_005_Fix",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/bigasp_v20.safetensors": {
        displayName: "bigASP 🐍 | v2.0",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/bigLove_xl25.safetensors": {
        displayName: "Big Love | XL2.5",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/biglust16.kst6.safetensors": {
        displayName: "Big Lust | v1.6",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/biglustydonutmixNSFW_v12.safetensors": {
        displayName: "BigLustyDonutMix (NSFW Realism) | v1.2",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/boomerArtModelBAM_bamV2.safetensors": {
        displayName: "Boomer Art Model (BAM!) | BAM_v2",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/chirps_v1.safetensors": {
        displayName: "chirps | v1",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/clarityXL_v20.safetensors": {
        displayName: "Clarity XL | v2.0",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/cyberprimeXL_v10.safetensors": {
        displayName: "CyberPrime XL| v1.0",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/cyberrealisticXL_v5.safetensors": {
        displayName: "CyberRealistic XL | v5",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/d33psixSDXL_d33psixSDXL.safetensors": {
        displayName: "D33PSIX - SDXL | D33PSIX - SDXL",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/epicjuggernautxl_vxvXI.safetensors": {
        displayName: "EpicJuggernautXL | VXV+XI",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: false,
    },
    "SDXL/epicrealismXL_vxvAnewstoryRealism.safetensors": {
        displayName: "epiCRealism XL | VXV-ANewStory (Realism)",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/epicrealismXL_vxviLastfameRealism.safetensors": {
        displayName: "epiCRealism XL | VXVI - LastFAME (Realism)",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/evalisenniaRealisticEastAsian_v30.safetensors": {
        displayName: "Evalisennia 伊岚: Realistic East Asian Female | 写实东亚女性人像 | v3.01",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/fasercore_xlV1.safetensors": {
        displayName: "FaserCore | XL_V1",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/FuchsiaXLPhoto_v10.safetensors": {
        displayName: "Fuchsia XL (Photo) | v10",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/galaxytimemachinesGTM_xlplusV35.safetensors": {
        displayName: 'GalaxyTimeMachine\'s GTM "XLPlus" | XLPlus_v3.5',
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/jibMixRealisticXL_v160Aphrodite.safetensors": {
        displayName: "Jib Mix Realistic XL | v16.0 - Aphrodite",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/juggernautXL_juggXIByRundiffusion.safetensors": {
        displayName: "Juggernaut XL | Jugg_XI_by_RunDiffusion",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: false,
    },
    "SDXL/leosamsHelloworldXL_helloworldXL70.safetensors": {
        displayName: "LEOSAM's HelloWorld XL | HelloWorld XL 7.0",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/lustifySDXLNSFW_endgame.safetensors": {
        displayName: "LUSTIFY! [SDXL NSFW checkpoint] | ENDGAME",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/lustifySDXLNSFW_oltFIXEDTEXTURES.safetensors": {
        displayName: "LUSTIFY! [SDXL NSFW checkpoint] | OLT (FIXED TEXTURES)",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/lustimix_.safetensors": {
        displayName: "LustiMix | LustiMix",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/lustimix_big.safetensors": {
        displayName: "LustiMix | BigLustiMix",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/lustimix_bigRebirth.safetensors": {
        displayName: "LustiMix | BigLustiMix_rebirth",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/midgardTHLHybrid_midgardV295SDXLHel.safetensors": {
        displayName: "Midgard [THL] Hybrid | Midgard V2.95 (SDXL Hel)",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/msSDXLRealV3_v3.safetensors": {
        displayName: "MS SDXL Real V3 | v3",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/mumixxl_v11.safetensors": {
        displayName: "MuMixXL | v1.1",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/mythNightXL_v5MythNightVISION.safetensors": {
        displayName: "Myth&Night XL - Myth&Night V4 - FLEX | Myth&Night V4 - FLEX",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/omnigenxlNSFWSFW_v10.safetensors": {
        displayName: "OmnigenXL (NSFW & SFW) | v1.0",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/photoart_V50.safetensors": {
        displayName: "PhotoArt | PhotoArt v5.0",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/photopediaXL_45.safetensors": {
        displayName: "PhotoPedia XL | 4.5",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/polyhedronSDXL_v3.safetensors": {
        displayName: "POLYHEDRON SDXL v3",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/realhotspice_sdxlV10VAE.safetensors": {
        displayName: "RealHotSpice | SDXL - v1.0VAE",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/realismByStableYogi_v5XLFP16.safetensors": {
        displayName: "Realism_By_Stable_Yogi | V5_XL_FP16",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/realismEngineSDXL_v30VAE.safetensors": {
        displayName: "Realism Engine SDXL | v3.0 VAE",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/realisticLustXL_v05.safetensors": {
        displayName: "Realistic Lust [XL] | v0.5",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/realisticStockPhoto_v20.safetensors": {
        displayName: "Realistic Stock Photo | v2.0",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/realityPhoto_a.safetensors": {
        displayName: "Reality Photo | RealityPhotoA",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/realvisxlV50_v50Bakedvae.safetensors": {
        displayName: "RealVisXL V5.0 | V5.0 (BakedVAE)",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/sdXL_v10VAEFix.safetensors": {
        displayName: "SDXL v1.0 VAE Fix",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: false,
    },
    "SDXL/sdxlPhotorealisticMix_v10.safetensors": {
        displayName: "SDXL Photorealistic Mix [NSFW] | v1.0",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/sdxxxl_v30.safetensors": {
        displayName: "SDXXXL | v3.0",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/stepDadsStashXLV2_v20.safetensors": {
        displayName: "Step Dads Stash XL V.2 | v2.0",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/STOIQOAfroditeFLUXXL_XL31.safetensors": {
        displayName: "🟡STOIQO Afrodite | FLUX, XL | 🔵XL 3.1",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/stoiqoNewrealityFLUXSD35_XLPRO.safetensors": {
        displayName: "STOIQO NewReality 🟡 FLUX, SD3.5, SDXL, SD1.5 | 🔵 XL PRO",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/theAramintaExperiment_fv5.safetensors": {
        displayName: "The Araminta Experiment (SDXL+Flux) | Fv5",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/unstableIllusion_sdxxxl.safetensors": {
        displayName: "unStable Illusion SDXXXL | SDXXXL",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },
    "SDXL/xxxRay_v11.safetensors": {
        displayName: "XXX-Ray | v1.1",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: true,
        nsfw: true,
    },

    // SDXL Lightning
    "SDXL-Lightning/agxl_LightningV10.safetensors": {
        displayName: "AGXL | AGXL_Lightning v1.0",
        sampler: "euler_ancestral",
        scheduler: "normal",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: false,
        nsfw: true,
    },
    "SDXL-Lightning/babesByStableYogi_v4XLLightning.safetensors": {
        displayName: "Babes_By_Stable_Yogi | V4_XL_Lightning",
        sampler: "euler_ancestral",
        scheduler: "normal",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: false,
        nsfw: true,
    },
    "SDXL-Lightning/copaxTimeless_photorealismSDXL8Step.safetensors": {
        displayName: "Copax TimeLess | Photorealism(SDXL 8 step)",
        sampler: "euler_ancestral",
        scheduler: "normal",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: false,
        nsfw: true,
    },
    "SDXL-Lightning/dreamshaperXL_lightningDPMSDE.safetensors": {
        displayName: "DreamShaper XL | Lightning DPM++ SDE",
        sampler: "euler_ancestral",
        scheduler: "normal",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: false,
        nsfw: true,
    },
    "SDXL-Lightning/Epicrealismxl_Hades.safetensors": {
        displayName: "epiCRealismXL-Lightning | 💯 Hades",
        sampler: "euler_ancestral",
        scheduler: "normal",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: false,
        nsfw: true,
    },
    "SDXL-Lightning/jibMixRealisticXL_v10Lightning46Step.safetensors": {
        displayName: "Jib Mix Realistic XL | v10 Lightning 4-6 Step",
        sampler: "euler_ancestral",
        scheduler: "normal",
        lora: false,
        clip: false,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: false,
        nsfw: true,
    },
    "SDXL-Lightning/juggernautXL_v9Rdphoto2Lightning.safetensors": {
        displayName: "Juggernaut XL | V9+RDPhoto2-Lightning_4S",
        sampler: "euler_ancestral",
        scheduler: "normal",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: false,
        nsfw: false,
    },
    "SDXL-Lightning/leosamsHelloworldXL_hw50EulerALightning.safetensors": {
        displayName: "LEOSAM's HelloWorld XL | HW5.0_Euler_a_Lightning",
        sampler: "euler_ancestral",
        scheduler: "normal",
        lora: false,
        clip: false,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: false,
        nsfw: true,
    },
    "SDXL-Lightning/mklanRealistic_mklan220reallight4s.safetensors": {
        displayName: "Mklan Realistic version | Mklan22.0RealLight4S",
        sampler: "euler_ancestral",
        scheduler: "normal",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: false,
        nsfw: true,
    },
    "SDXL-Lightning/realismByStableYogi_v5XLLightning.safetensors": {
        displayName: "Realism_By_Stable_Yogi | V5_XL_Lightning",
        sampler: "lcm",
        scheduler: "exponential",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: false,
        nsfw: true,
    },
    "SDXL-Lightning/RealitiesEdgeXLLIGHTNING_LIGHTNING34Step.safetensors": {
        displayName: "⋅ ⊣ Realities Edge XL ⊢ ⋅ LIGHTNING + Turbo! | ⋅ ⊣ Realities Edge XL ⊢ ⋅ LIGHTNING + Turbo!",
        sampler: "euler_ancestral",
        scheduler: "normal",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: false,
        nsfw: true,
    },
    "SDXL-Lightning/realvisxlV50_v50LightningBakedvae.safetensors": {
        displayName: "RealVisXL V5.0 | V5.0 Lightning (BakedVAE)",
        sampler: "euler_ancestral",
        scheduler: "normal",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: false,
        nsfw: true,
    },
    "SDXL-Lightning/stoiqoNewrealityFLUXSD35_XLLight10.safetensors": {
        displayName: "STOIQO NewReality 🟡 FLUX, SD3.5, SDXL, SD1.5 | 🔵 XL Light 1.0",
        sampler: "euler_ancestral",
        scheduler: "normal",
        lora: false,
        clip: false,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: false,
        nsfw: true,
    },
    "SDXL-Lightning/wildcardxXLLIGHTNING_wildcardxXL.safetensors": {
        displayName: "WildCardX-XL LIGHTNING⚡⚡⚡ | WildCardX-XL+Rundiffusion",
        sampler: "euler_ancestral",
        scheduler: "normal",
        lora: false,
        clip: true,
        clipskip: -2,
        steps: 8,
        cfg: 1,
        dmd2: false,
        nsfw: true,
    },
};

/**
 * Fungsi yang mengambil daftar checkpoint.
 *
 * @description Fungsi ini mengambil daftar checkpoint dari cache atau mengembalikan nilai default jika cache belum diisi.
 * @returns {string[]} Daftar checkpoint.
 */
// Checkpoints
function fetchCheckpointOptions() {
    if (checkpointCache.checkpoints) return checkpointCache.checkpoints;

    // Daftar checkpoint dasar
    const baseCheckpoints = [
        "---- DMD2 ----",
        "DMD2/centerfold_versionXIDmd2.safetensors",
        "DMD2/epicrealismXL_vxviLastfameDMD2.safetensors",
        "DMD2/lustifySDXLNSFW_endgameDMD2.safetensors",
        "DMD2/lustifySDXLNSFW_v40DMD2.safetensors",

        "---- Illustrious ----",
        "Illustrious/cyberillustrious_v30.safetensors",
        "Illustrious/novaRealityXL_illustriousV20.safetensors",
        "Illustrious/perfection3DILXLIllustrious_v11.safetensors",
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
        "Pony/realDream_sdxlPony15.safetensors",
        "Pony/realismByStableYogi_v40FP16.safetensors",

        "---- SDXL ----",
        "SDXL/1girlPrinter20_v10.safetensors",
        "SDXL/agxl_V2.safetensors",
        "SDXL/animaPencilXL_v500.safetensors",
        "SDXL/annolustxl_v2.safetensors",
        "SDXL/babesByStableYogi_v4XLFP16.safetensors",
        "SDXL/beyondimaginationxl_v0005Fix.safetensors",
        "SDXL/bigasp_v20.safetensors",
        "SDXL/bigLove_xl25.safetensors",
        "SDXL/biglust16.kst6.safetensors",
        "SDXL/biglustydonutmixNSFW_v12.safetensors",
        "SDXL/boomerArtModelBAM_bamV2.safetensors",
        "SDXL/chirps_v1.safetensors",
        "SDXL/clarityXL_v20.safetensors",
        "SDXL/cyberprimeXL_v10.safetensors",
        "SDXL/cyberrealisticXL_v5.safetensors",
        "SDXL/d33psixSDXL_d33psixSDXL.safetensors",
        "SDXL/epicjuggernautxl_vxvXI.safetensors",
        "SDXL/epicrealismXL_vxvAnewstoryRealism.safetensors",
        "SDXL/epicrealismXL_vxviLastfameRealism.safetensors",
        "SDXL/evalisenniaRealisticEastAsian_v30.safetensors",
        "SDXL/fasercore_xlV1.safetensors",
        "SDXL/FuchsiaXLPhoto_v10.safetensors",
        "SDXL/galaxytimemachinesGTM_xlplusV35.safetensors",
        "SDXL/jibMixRealisticXL_v160Aphrodite.safetensors",
        "SDXL/juggernautXL_juggXIByRundiffusion.safetensors",
        "SDXL/leosamsHelloworldXL_helloworldXL70.safetensors",
        "SDXL/lustifySDXLNSFW_endgame.safetensors",
        "SDXL/lustifySDXLNSFW_oltFIXEDTEXTURES.safetensors",
        "SDXL/lustimix_.safetensors",
        "SDXL/lustimix_big.safetensors",
        "SDXL/lustimix_bigRebirth.safetensors",
        "SDXL/midgardTHLHybrid_midgardV295SDXLHel.safetensors",
        "SDXL/msSDXLRealV3_v3.safetensors",
        "SDXL/mumixxl_v11.safetensors",
        "SDXL/mythNightXL_v5MythNightVISION.safetensors",
        "SDXL/omnigenxlNSFWSFW_v10.safetensors",
        "SDXL/photoart_V50.safetensors",
        "SDXL/photopediaXL_45.safetensors",
        "SDXL/polyhedronSDXL_v3.safetensors",
        "SDXL/realhotspice_sdxlV10VAE.safetensors",
        "SDXL/realismByStableYogi_v5XLFP16.safetensors",
        "SDXL/realismEngineSDXL_v30VAE.safetensors",
        "SDXL/realisticLustXL_v05.safetensors",
        "SDXL/realisticStockPhoto_v20.safetensors",
        "SDXL/realityPhoto_a.safetensors",
        "SDXL/realvisxlV50_v50Bakedvae.safetensors",
        "SDXL/sdXL_v10VAEFix.safetensors",
        "SDXL/sdxlPhotorealisticMix_v10.safetensors",
        "SDXL/sdxxxl_v30.safetensors",
        "SDXL/stepDadsStashXLV2_v20.safetensors",
        "SDXL/STOIQOAfroditeFLUXXL_XL31.safetensors",
        "SDXL/stoiqoNewrealityFLUXSD35_XLPRO.safetensors",
        "SDXL/theAramintaExperiment_fv5.safetensors",
        "SDXL/unstableIllusion_sdxxxl.safetensors",
        "SDXL/xxxRay_v11.safetensors",

        "---- SDXL Lightning ----",
        "SDXL-Lightning/agxl_LightningV10.safetensors",
        "SDXL-Lightning/babesByStableYogi_v4XLLightning.safetensors",
        "SDXL-Lightning/copaxTimeless_photorealismSDXL8Step.safetensors",
        "SDXL-Lightning/dreamshaperXL_lightningDPMSDE.safetensors",
        "SDXL-Lightning/Epicrealismxl_Hades.safetensors",
        "SDXL-Lightning/jibMixRealisticXL_v10Lightning46Step.safetensors",
        "SDXL-Lightning/juggernautXL_v9Rdphoto2Lightning.safetensors",
        "SDXL-Lightning/leosamsHelloworldXL_hw50EulerALightning.safetensors",
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

/**
 * Fungsi yang mengambil daftar sampler.
 *
 * @description Fungsi ini mengembalikan daftar sampler yang tersedia.
 * @returns {string[]} Daftar sampler.
 */
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

/**
 * Fungsi yang mengambil daftar scheduler.
 *
 * @description Fungsi ini mengembalikan daftar scheduler yang tersedia.
 * @returns {string[]} Daftar scheduler.
 */
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
