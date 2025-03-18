const checkpointCache = {};

// Checkpoints
function fetchCheckpointOptions() {
    if (checkpointCache.checkpoints) return checkpointCache.checkpoints;

    const baseCheckpoints = [
        "agxl_LightningV10.safetensors",
        "dreamshaperXL_lightningDPMSDE.safetensors",
        "Epicrealismxl_Hades.safetensors",
        "jibMixRealisticXL_v10Lightning46Step.safetensors",
        "juggernautXL_v9Rdphoto2Lightning.safetensors",
        "realvisxlV50_v50LightningBakedvae.safetensors",
    ];

    checkpointCache.checkpoints = baseCheckpoints.map((ckpt) => `SDXL-Lightning/${ckpt}`);
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