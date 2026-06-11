import { useState } from "react";

// ── Samplers ──
export const SAMPLERS = [
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

// ── Schedulers ──
export const SCHEDULERS = [
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

// ── Upscalers ──
export const UPSCALERS = [
  "4x-ClearRealityV1.pth",
  "4x-ESRGAN.pth",
  "4x-UltraSharp.pth",
  "4x_foolhardy_Remacri.pth",
  "4x_NMKD-Siax_200k.pth",
  "4x_NMKD-Superscale-SP_178000_G.pth",
  "4xFaceUpDAT.pth",
  "4xFaceUpSharpLDAT.pth",
  "4xFFHQDAT.pth",
  "4xNomos2_otf_esrgan.pth",
  "4xNomos8k_atd_jpg.pth",
  "BSRGANx2.pth",
  "ESRGAN_4x.pth",
  "RealESRGAN_x2.pth",
  "RealESRGAN_x4.pth",
  "RealESRGAN_x4plus.pth",
];

// ── Resolutions ──
export const RES_MAP: Record<string, string> = {
  portrait: "896x1152 (0.78)",
  landscape: "1152x896 (1.29)",
  square: "1024x1024 (1.0)",
};

export const resSize = (m: string) =>
  m === "portrait" ? "896x1152" : m === "landscape" ? "1152x896" : "1024x1024";

// ── localStorage helpers ──
const LS_KEY = "mimpi_collapse_state";

function loadCollapse(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveCollapse(key: string, val: boolean) {
  const s = loadCollapse();
  s[key] = val;
  localStorage.setItem(LS_KEY, JSON.stringify(s));
}

export function useCollapse(
  key: string,
  defaultCollapsed = true,
): [boolean, () => void] {
  const [open, setOpen] = useState(() => {
    const s = loadCollapse();
    return key in s ? !s[key] : !defaultCollapsed;
  });
  const toggle = () => {
    setOpen((prev) => {
      const n = !prev;
      saveCollapse(key, !n);
      return n;
    });
  };
  return [open, toggle];
}
