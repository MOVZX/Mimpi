// Cached Checkpoints
const checkpointCache = {};

// Checkpoints Maps
const checkpointNameMapping = {
    "Illustrious/cyberillustrious_v30.safetensors": "CyberIllustrious V30",
    "Illustrious/novaRealityXL_illustriousV20.safetensors": "NovaRealityXL V20",
    "Illustrious/perfectionRealisticILXL_v12.safetensors": "Perfection Realistic V1.2",
    "Illustrious/realismIllustriousBy_v30FP16.safetensors": "RealismIllustrious V30",
    "Illustrious/redcraftCADSUpdatedMar11_illust3relustion.safetensors": "RedcraftCADS Mar11",
    "Illustrious/rillusmRealistic_v20.safetensors": "RillusmRealistic V20",
    "Pony/3xthreat2kModelThatUsesPONY_v10.safetensors": "3xThreat2k V10",
    "Pony/babesByStableYogi_ponyV4VAEFix.safetensors": "BabesByStableYogi V4",
    "Pony/cyberrealisticPony_v85.safetensors": "CyberRealisticPony V85",
    "Pony/fasercore_v30PonyFP16.safetensors": "Fasercore V30",
    "Pony/fucktasticRealCheckpointPony_21.safetensors": "Fucktastic Real Checkpoint V2.1",
    "Pony/iniverseMixSFWNSFW_ponyRealGuofengV50C.safetensors": "IniverseMix V50C",
    "Pony/ponyDiffusionV6XL.safetensors": "PonyDiffusion V6XL",
    "Pony/pornyPonyByStable_v20FP16.safetensors": "PornyPony V20",
    "Pony/realDream_sdxlPony15.safetensors": "RealDream Pony15",
    "Pony/realismByStableYogi_v40FP16.safetensors": "RealismByStableYogi V40",
    "Pony/uberRealisticPornMergePonyxl_ponyxlHybridV1.safetensors": "UberRealisticPornMerge V1",
    "SDXL/acornIsBoningXL_xlV2.safetensors": "AcornIsBoningXL V2",
    "SDXL/agxl_V2.safetensors": "AGXL V2",
    "SDXL/animaPencilXL_v500.safetensors": "AnimaPencilXL V500",
    "SDXL/annolustxl_v2.safetensors": "ANNOLustXL v2 (euler_ancestral/normal, 35, 3.5, CLIP Skip 1)",
    "SDXL/babesByStableYogi_v4XLFP16.safetensors": "BabesByStableYogi V4XL",
    "SDXL/bestPornMergeBPM_v10.safetensors": "BestPornMergeBPM v10 V4XL",
    "SDXL/biglovexl2.wBWt.safetensors": "BigLoveXL2",
    "SDXL/biglust16.kst6.safetensors": "BigLust16",
    "SDXL/boomerArtModelBAM_bamV2.safetensors": "BoomerArtModel V2",
    "SDXL/clarityXL_v20.safetensors": "ClarityXL V20",
    "SDXL/cyberprimeXL_v10.safetensors": "Cyberprime XL v1.0 (euler_ancestral/normal, 35, 5, No CLIP Skip)",
    "SDXL/cyberrealisticXL_v5.safetensors": "CyberRealisticXL V5",
    "SDXL/d33psixSDXL_d33psixSDXL.safetensors": "D33PSIX  (dpmpp_2m/karras, 35, 3.5, CLIP Skip 2)",
    "SDXL/epicrealismXL_vxvAnewstoryRealism.safetensors": "EpicRealismXL VxV AnewstoryRealism",
    "SDXL/epicrealismXL_vxviLastfameRealism.safetensors": "EpicRealismXL VxV LastfameRealism",
    "SDXL/fasercore_xlV1.safetensors": "Fasercore XL V1",
    "SDXL/jibMixRealisticXL_v160Aphrodite.safetensors": "JibMixRealisticXL V160",
    "SDXL/juggernautXL_juggXIByRundiffusion.safetensors": "JuggernautXL XI",
    "SDXL/leosamsHelloworldXL_helloworldXL70.safetensors": "HelloworldXL V70",
    "SDXL/lustifySDXLNSFW_endgame.safetensors": "LustifySDXL Endgame",
    "SDXL/lustifySDXLNSFW_oltONELASTTIME.safetensors": "LustifySDXL OLT",
    "SDXL/lustimix_.safetensors": "Lustimix",
    "SDXL/lustimix_big.safetensors": "Lustimix Big",
    "SDXL/lustimix_bigRebirth.safetensors": "Lustimix Big Rebirth",
    "SDXL/mumixxl_v11.safetensors": "MuMixXL v1.1 (dpmpp_2m/karras, 35, 4.5, No CLIP Skip",
    "SDXL/msSDXLRealV3_v3.safetensors": "MSSDXLReal V3",
    "SDXL/novaRealityXL_v70.safetensors": "NovaRealityXL V70",
    "SDXL/omnigenxlNSFWSFW_v10.safetensors": "OmnigenXL V10",
    "SDXL/perfectionRealisticILXL_v10.safetensors": "PerfectionRealisticILXL V10",
    "SDXL/photoart_V40.safetensors": "PhotoArt",
    "SDXL/photopediaXL_45.safetensors": "PhotopediaXL V45",
    "SDXL/polyhedronSDXL_v3.safetensors": "PolyhedronSDXL V3",
    "SDXL/pornmaster_proSDXLV3VAE.safetensors": "Pornmaster ProSDXL V3",
    "SDXL/realismByStableYogi_v5XLFP16.safetensors": "RealismByStableYogi V5XL",
    "SDXL/realismEngineSDXL_v30VAE.safetensors": "RealismEngineSDXL V30",
    "SDXL/realisticLustXL_v05.safetensors": "RealisticLustXL V05",
    "SDXL/realisticStockPhoto_v20.safetensors": "RealisticStockPhoto V20",
    "SDXL/realvisxlV50_v50Bakedvae.safetensors": "RealvisXL V50",
    "SDXL/sd_xl_base_1.0_0.9vae.safetensors": "SDXL Base 1.0",
    "SDXL/sd_xl_refiner_1.0.safetensors": "SDXL Refiner 1.0",
    "SDXL/sdXL_v10VAEFix.safetensors": "SDXL V10",
    "SDXL/sdxlPhotorealisticMix_v10.safetensors": "SDXLPhotorealisticMix V10",
    "SDXL/sdxxxl_v30.safetensors": "SDXXXL V30",
    "SDXL/STOIQOAfroditeFLUXXL_XL31.safetensors": "STOIQOAfroditeFLUXXL V31",
    "SDXL/stoiqoNewrealityFLUXSD35_XLPRO.safetensors": "StoiqoNewrealityFLUXSD35",
    "SDXL/unstableIllusion_sdxxxl.safetensors": "Unstable Illusion SDXXXL (dpmpp_2m/karras, 35, 3.5, CLIP Skip 2",
    "SDXL-Lightning/agxl_LightningV10.safetensors": "AGXL Lightning V10",
    "SDXL-Lightning/babesByStableYogi_v4XLLightning.safetensors": "BabesByStableYogi V4XL Lightning",
    "SDXL-Lightning/copaxTimeless_photorealismSDXL8Step.safetensors": "CopaxTimeless PhotorealismSDXL",
    "SDXL-Lightning/dreamshaperXL_lightningDPMSDE.safetensors": "DreamshaperXL Lightning",
    "SDXL-Lightning/epicrealismXL_vxviLastfameDMD2.safetensors": "epiCRealism XL VXVI LastFAME DMD2 (lcm/normal, 8, 1, CLIP Skip 2)",
    "SDXL-Lightning/Epicrealismxl_Hades.safetensors": "EpicRealismXL Hades",
    "SDXL-Lightning/jibMixRealisticXL_v10Lightning46Step.safetensors": "JibMixRealisticXL V10 Lightning",
    "SDXL-Lightning/juggernautXL_v9Rdphoto2Lightning.safetensors": "JuggernautXL V9 Lightning",
    "SDXL-Lightning/leosamsHelloworldXL_hw50EulerALightning.safetensors": "HelloworldXL V50 Lightning",
    "SDXL-Lightning/lustifySDXLNSFW_endgameDMD2.safetensors": "Lustify Endgame DMD2 (lcm/normal, 8, 1, CLIP Skip 2)",
    "SDXL-Lightning/lustifySDXLNSFW_v40DMD2.safetensors": "Lustify v4.0 DMD2 (lcm/normal, 8, 1, CLIP Skip 2)",
    "SDXL-Lightning/mklanRealistic_mklan220reallight4s.safetensors": "MklanRealistic Lightning",
    "SDXL-Lightning/realismByStableYogi_v5XLLightning.safetensors": "RealismByStableYogi V5XL Lightning",
    "SDXL-Lightning/RealitiesEdgeXLLIGHTNING_LIGHTNING34Step.safetensors": "RealitiesEdgeXL Lightning",
    "SDXL-Lightning/realvisxlV50_v50LightningBakedvae.safetensors": "RealvisXL V50 Lightning",
    "SDXL-Lightning/stoiqoNewrealityFLUXSD35_XLLight10.safetensors": "StoiqoNewrealityFLUXSD35 Lightning",
    "SDXL-Lightning/wildcardxXLLIGHTNING_wildcardxXL.safetensors":
        "WildCardX-XL (dpmpp_sde/karras, 6, 1.5, CLIP Skip 2)",
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
        "Pony/3xthreat2kModelThatUsesPONY_v10.safetensors",
        "Pony/babesByStableYogi_ponyV4VAEFix.safetensors",
        "Pony/cyberrealisticPony_v85.safetensors",
        "Pony/fasercore_v30PonyFP16.safetensors",
        "Pony/fucktasticRealCheckpointPony_21.safetensors",
        "Pony/iniverseMixSFWNSFW_ponyRealGuofengV50C.safetensors",
        "Pony/ponyDiffusionV6XL.safetensors",
        "Pony/pornyPonyByStable_v20FP16.safetensors",
        "Pony/realDream_sdxlPony15.safetensors",
        "Pony/realismByStableYogi_v40FP16.safetensors",
        "Pony/uberRealisticPornMergePonyxl_ponyxlHybridV1.safetensors",
        "---- SDXL ----",
        "SDXL/acornIsBoningXL_xlV2.safetensors",
        "SDXL/agxl_V2.safetensors",
        "SDXL/animaPencilXL_v500.safetensors",
        "SDXL/annolustxl_v2.safetensors",
        "SDXL/babesByStableYogi_v4XLFP16.safetensors",
        "SDXL/bestPornMergeBPM_v10.safetensors",
        "SDXL/biglovexl2.wBWt.safetensors",
        "SDXL/biglust16.kst6.safetensors",
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
        "SDXL/novaRealityXL_v70.safetensors",
        "SDXL/omnigenxlNSFWSFW_v10.safetensors",
        "SDXL/perfectionRealisticILXL_v10.safetensors",
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
        "SDXL/unstableIllusion_sdxxxl.safetensors",
        "---- SDXL Lightning ----",
        "SDXL-Lightning/agxl_LightningV10.safetensors",
        "SDXL-Lightning/babesByStableYogi_v4XLLightning.safetensors",
        "SDXL-Lightning/copaxTimeless_photorealismSDXL8Step.safetensors",
        "SDXL-Lightning/dreamshaperXL_lightningDPMSDE.safetensors",
        "SDXL-Lightning/Epicrealismxl_Hades.safetensors",
        "SDXL-Lightning/epicrealismXL_vxviLastfameDMD2.safetensors",
        "SDXL-Lightning/jibMixRealisticXL_v10Lightning46Step.safetensors",
        "SDXL-Lightning/juggernautXL_v9Rdphoto2Lightning.safetensors",
        "SDXL-Lightning/leosamsHelloworldXL_hw50EulerALightning.safetensors",
        "SDXL-Lightning/lustifySDXLNSFW_endgameDMD2.safetensors",
        "SDXL-Lightning/lustifySDXLNSFW_v40DMD2.safetensors",
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
