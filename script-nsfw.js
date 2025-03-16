const COMFYUI_URL = "http://gambar.ai:8188";
let currentSeedNum = 0;
let lastImageData = null;

// Daftar Preset
const presets = {
    none: "Tidak Ada",
    "cum on face 1":
        "A raw 8K night portrait photo of a 30 yo British woman on a bed, her face covered in cum from a bukkake facial, with cum trails on her wet face, hair, and nude body. She has medium breasts with visible nipples and areolas, freckles, and eyeliner, looking directly at the viewer with her tongue out. Captured with flash photography in a dark setting, the image reflects an amateur, slutty vibe with high detail and a wet, messy aesthetic.",
    "cumshot on tongue 1":
        "beautiful blonde 30 yo, woman, heavy makeup, blue wrinkles, cum on her face, showing her tongue with thick white cum on it, detailed face, skin pore, view from above",
    "dildo 1":
        "seductive atmosphere, featuring a confident female with medium, bouncing breasts and enlarged nipples. She is passionately using a fully inserted dildo with her legs spread wide, captured in a dynamic low-angle shot that emphasizes her form and intensity.",
    "from behind 1":
        "A photo-realistic shoot from above about a woman in a dimly lit room, lying on her stomach in the middle of the image. the woman, who appears to be around 30 years old, has a slim body and is wearing a light brown long-sleeved top and a short blue skirt, which is pulled up to reveal her ass and pussy. she is positioned in the center of the frame, facing away from the camera. her hair is brown and is styled in a long hair style. the lighting is dim, casting shadows and highlighting the woman's body. 1girl, solo, looking at viewer, skirt, brown hair, long sleeves, brown eyes, standing, full body, ass, short sleeves, pleated skirt, pussy, socks, shoes, uncensored, anus, pussy juice, no panties, on floor, clothes pull, all fours, close vagina view",
    "from behind 2":
        "An 18-year-old Goth e-girl with sleek, voluminous blonde hair in a ponytail, fair skin, and a petite African body poses in a dimly lit room. She has small, natural, slightly saggy breasts with small erect nipples, a bubble butt, and realistic skin with blemishes, freckles, and an arm tattoo. Her look features winged eyeliner, slightly parted lips, and a beautiful face with eye contact. Captured in a realistic, film-grain webcam photo with soft, dynamic lighting and a dark, out-of-focus background, she spreads her ass to reveal a hairy, gaping anus in a rear-view shot, blending the styles of Jimmy Nelson and Sally Mann photography",
    "from behind 3":
        "A photorealistic, ultra-detailed 8K digital photo of a topless brunette with long, butt-length braided hair and shiny skin, wearing black tights. The focus is on her round, tight, big butt, captured in a close-up, dynamic motion shot with a dramatic angle. Soft, diffused lighting highlights her ass and vagina in the spotlight, set against a dark, moody background with subtle details. The cinematic composition features rich, deep colors, sharp details, and a mystical, romantic ambiance with depth of field and an epic, colorful aesthetic",
    "from behind 4":
        "A masterpiece anime-style photo with ultra-high resolution and breathtaking detail, featuring a sexy 30 yo blonde with long straight hair, blue eyes, black eyeshadow, and pale skin. She’s naked except for a black hairband, showcasing a perfect, athletic body with a slim hourglass figure, huge hips, thick trained thighs, a round ass, and perfect round breasts with hard nipples. Her shiny, oiled skin glistens as she poses on all fours with her head on the floor, ass up, expanding her ass with her hands to reveal a peek of her anus, pussy, and cameltoe. She has a slutty, horny expression with a smile, narrowed eyes, parted lips, and a blush, looking at the viewer. The composition includes sharp contours, shadows, bright colors, and a blurred castle background, captured in a rear view with uncensored, highly detailed skin and iris.",
    "from behind 5":
        "An amateur voyeur spy-angle photo with film grain and JPEG quality, capturing candid casual nudity in a luxury apartment lounge during daytime morning. A nude 30 yo brunette with messy long hair wears a white crop top, distracted and lost in thought while fingering her pussy. Her ass is visible, with a glimpse of her natural, shaved pubic hair mound partially covering her groin.",
    "from behind 6":
        "A photo of a beautiful, busty secretary leaning over her desk, spreading her butt to reveal a wet pussy with a dripping creampie.",
    "from behind 7":
        "A masterpiece side-profile photo of a 22-year-old sexy Latina supermodel with a pretty face, detailed skin pores, freckles, tan skin, and beautiful eyes with catchlights. She has medium, natural saggy breasts with tiny puffy nipples and brown hair. Lying indoors on a bed, she wears an open shirt, low panties, and pajama bottoms, displaying a sensual, slightly horny expression. She spreads her legs, shows her ass, and grabs and spreads her ass cheeks, revealing a dripping creampie in a realistic, photorealistic composition.",
    "from behind 8":
        "amateur, real life photo, raw, dim bedroom, warm night lamp, girl, cute, blonde, laying on stomach with arms to sides, black shirt, perfect ass, thick thighs, creampie, pussy, cum in pussy, cumdrip",
    "kneeling blowjob 1":
        "A 30-year-old woman with sleek, voluminous blonde hair in a ponytail, fair skin, and detailed realistic features, including slightly parted lips and extended eyeliner. She has a full body with medium breasts, a bubble butt, and realistic skin with blemishes and freckles. The scene is set in a dimly lit bedroom with soft, dynamic lighting and a dark background. She is kneeling on the floor, performing a messy deepthroat blowjob on a light-skinned Caucasian man, with drool dripping from her mouth. The image has a realistic, film-grain webcam photo style and is NSFW.",
    "kneeling blowjob 2":
        "A photorealistic NSFW photo of a 19-year-old woman with messy, wet hair and glistening skin, performing a blowjob on a big penis from a top-of-head POV. She has an intense, piercing gaze and an athletic pose, captured in the rain with saliva dripping during oral sex. Shot on a Nikon F4 with a 50mm f1.2 lens and Fujichrome Velvia 50 film, the textured, edgy image features a rock vibe, bokeh, and a distressed, noisy aesthetic. She wears a ripped, wet Supergirl cosplay outfit in an ominous jungle setting with ambient volumetric light and god rays.",
    "kneeling blowjob 3":
        "side blowjob photo of beautiful woman with standing man, masterpiece, perfect lighting, small breasts, deepthroat, creampie, tanlines",
    "kneeling blowjob 4":
        "cum on face, realistic, highly detailed, cinematic, detailed, photo realistic, RAW photo, subject, (high detailed skin:1.2), 8k uhd, dslr, soft lighting, high quality, film grain, Fujifilm XT3, blowjob, deepthroat, pov, side, front, above, creampie, cum, kneeling, runny makeup, hand holding head, hand on penis, arms behind back, wet penis, dry penis, naked male, clothed male",
    "kneeling blowjob 5":
        "A photorealistic NSFW photo of a 30-year-old Japanese MILF with black, messy, wet hair, sticking out her beautiful tongue to lick a large, veiny black penis with foreskin and male pubic hair, captured from the side in a POV shot. Her detailed face shows freckles, acne, moles, wrinkles, and textured skin with pores, as she looks at the viewer in a dark basement at night. Shot with flash photography, the scene includes bukkake and facial elements, with cum on her tongue, in her mouth, and trailing down, set in an amateur-style interracial context.",
    "kneeling blowjob 6":
        "Blowbang, blowjob, fellatio, 1girl, young faces, young, beautiful faces, oiled skin, light reflections",
    "kneeling blowjob 7":
        "A medium-quality, ultrasharp photo blending aesthetic erotic and street fashion photography, featuring a realistic scene of a long-haired brunette girl with brown eyes, kneeling and looking up at the viewer. Her open mouth and tongue are engaged in fellatio on an uncensored penis, with cum in her mouth and on her face, framed by freckles and lips. The POV shot from above captures a nude hetero moment with a boy, focusing solo on her, his erection and male pubic hair visible. The masterpiece composition boasts high realism and the latest quality standards.",
    "kneeling blowjob 8":
        "A high-quality, explicit medium photo for r/18_19 and Brazzers, featuring a 21-year-old Danish girl with a thicc, curvy yet slim sexy figure and a round face, kneeling nude on a bedroom floor. She has wavy chestnut hair and a sleepy, sad expression with half-closed eyes visible through her hair, accented by bohemian makeup. She’s performing a forced deep blowjob on a man with a huge penis, with excessive cum in her mouth, on her face, dripping as drops, and in her hair. He grabs her hair and wrist, head held firmly, in a side-view candid shot. The professional, balanced photo uses natural daylight with low contrast, studio lighting, and a rear light, styled with lomography and gritty contrast. The close-up background shows a cozy, messy room with an adult in bed, a laptop open, fairy lights, plants, boho decor, and a sunbeam through the window.",
    "kneeling tongue out 1":
        "1girl, (solo:1.6), beautiful 30 y.o hotwife, kneeling, looking up, eyes closed, long lush hair, tongue out, anticipation, (pov), view from top, realistic natural teeth, pale skin, detailed skin texture, natural skin tone, goosebumps, moles, bedroom, cinematic, highly detailed, best quality, intricate details, medium close shot, (wears black casual outfit, with bra and panties:1.1), average medium breasts, natural vivid lighting, bright indoor, vibrant",
    "penetration 1":
        "A cinematic, medium-quality 4K still of a gorgeous, thicc woman with freckles, lips, and a sexy figure, moaning as she has sex with a man on a bed in a squatting cowwoman position. Shot from a closeup POV below, she bounces with vaginal penetration, captured with motion blur. The uncensored, emotional scene for r/18_19 has sharp focus, a moody vignette, and epic, grainy detail, blending realistic human textures and puffy nipples.",
    "pov blowjob 1":
        "An award-winning, cinematic 4K photo of a delicate-featured 30 yo Korean woman with long, dark hair, sitting on a house, performing a realistic blowjob on a boy in a POV shot. Her detailed lips and saliva are highlighted as she engages in oral fellatio on an erect penis, captured with professional bokeh and high detail. Sperm cum on her face and dripping from her mouth",
    "pov blowjob 2":
        "A high-quality 8K cinematic photo shot from above, featuring a 30 yo woman performing a blowjob on an average cock, with cum on her face. She has medium breasts with visible nipples and her pussy exposed.",
    "pov blowjob 3":
        "A high-quality, photorealistic 35mm film photo of a beautiful 30 yo Korean woman with long, polished, wet hair, captured in a dynamic angle and pose. She’s deepthroating a cock with drool and cum dripping, soaking her hair and small tits, some cum in her hair. The cinematic scene, rich with detail, bokeh, depth of field, and film grain, shows her in lingerie and nude, looking at the viewer with a passionate, in-love expression, framed in an ultra-sharp, professional composition.",
    "spreading legs 1":
        "1girl, solo, long hair, breasts, looking at viewer, blush, smile, large breasts, brown hair, navel, closed mouth, brown eyes, nipples, collarbone, ass, thighs, nude, lying, sky, pussy, indoors, spread legs, stomach, on back, armpits, halo, arm up, completely nude, fingernails, pillow, window, uncensored, anus, night, pussy juice, bed, on bed, bed sheet, moon, curtains, night sky, breasts apart, arm behind head, spread pussy, clitoris, presenting, urethra",
    "spreading legs 2":
        "1girl, solo, long hair, breasts, looking at viewer, blue eyes, shirt, blonde hair, closed mouth, medium breasts, full body, short sleeves, lying, barefoot, pussy, indoors, spread legs, on back, feet, legs, lips, pillow, toes, uncensored, anus, bed, on bed, bottomless, blue shirt, t-shirt, masturbation, nose, realistic, bedroom, drawer, newhalf, close camera",
    "spreading legs 3":
        "A seductive brunette lounges in the backseat of a yellow taxi in New York. She flashes her medium breasts and pubic hair, teasing with a provocative pose. soft-focus lens. Her smoldering gaze and glossy lips shine through the cinematic haze",
    "spreading legs 4":
        "A skinny yet curvy woman with perfect, medium breasts and pink nipples lies on the ground in a disco club, tied up with leather straps and a leash in a bondage pose. She has black hair, ripped black sheer tights revealing her wet pussy and big cameltoe, and a shy yet orgasmic expression with pouting lips, blushing cheeks, and smeared mascara. Shot in a dynamic Dutch angle with volumetric, cold soft lighting, her shiny skin and tight ass are highlighted with perfect reflections and shadows. The topless fashion shoot, set against a black background, blends comic book style with sharp lines and high detail, evoking a graphic novel aesthetic",
    "spreading legs 5":
        "A gorgeous young woman, blushing seductively, looks at the viewer in a realistic, sexually suggestive pose. Solo in a masterpiece scene, she wears a transparent nightgown, lifting it with one hand to reveal her pussy and ass from a POV angle, resting aside with an expressive, alluring gaze",
    "spreading legs 6":
        "A high-quality, 4K NSFW night photograph of a seductive adult woman with wavy light brown hair, symmetrical eyes, beauty marks, and a relaxed smile showing her teeth. This full-body shot features her naked with huge, symmetrical natural breasts, light red nipples, and a small areola, plus a perfectly shaven pussy she’s spreading, uncensored. Lit only by a camera flash in a low-light environment, the image has dramatic chiaroscuro lighting, high contrast, sharp shadows, and a dark background, focusing on her detailed facial skin texture and gorgeous face",
    "spreading legs 7":
        "A high-quality, 4K NSFW night photograph of a seductive 30 yo woman with wavy light brown hair, symmetrical eyes, beauty marks, and a relaxed smile showing her teeth. She wears black lingerie, elegant heels, and a garter belt in a full-body shot, featuring her huge, symmetrical natural breasts with light red nipples and small areola, plus a perfectly shaven pussy she’s spreading, uncensored, with globs of cum dripping from it. Lit only by a camera flash in a low-light environment, the image has dramatic chiaroscuro lighting, high contrast, sharp shadows, and a dark background, focusing on her detailed facial skin texture and gorgeous face.",
    "spreading legs 8":
        "A high-quality, explicit NSFW photograph of a sexy blonde 30 yo with a short, streaked hairstyle and makeup, lounging solo on a couch. She wears a low-neckline red dress and black thigh-high lace stockings, posing deliberately with splayed thighs for an upskirt view of her natural hairy pussy. The sharp-focus shot highlights her perfect figure in a raunchy, revealing composition.",
    "spreading legs 9":
        "A high-definition, hyperrealistic photo with soft lighting and a simple background, featuring a skinny goth girl with black hair, red highlights, and vivid green eyes. She has a small waist, huge saggy breasts with nipples, and a perfect body, adorned with black mascara, eyeshadow, a choker, fishnet stockings, white socks, and sneakers. Her long hair with sidelocks and bangs frames a cute face with plump lips and a sweaty, steamy look from heavy breathing. She’s squatting over the viewer or lying on her back on the floor, spreading her own ass and pussy with small, dainty hands sporting black pointy fingernails. The rear shot reveals a realistic anus gape, detailed anus, small labia, urethra, clitoris, and shaved pubic hair, with pussy juice and vivid skin details like pores and skindentation. She looks over her shoulder at the viewer with straight white teeth, set against a front-lit composition.",
    "spreading legs 10":
        "A cinematic 4K still shot on Kodak 35mm with sharp focus, film grain, and a high-budget Cinemascope look, featuring a gorgeous goth girl with a beautiful face, red eyes, a scar, and black hair with blue highlights styled in a messy bun, covering one eye. She lies down with legs spread, one hand on her pussy with a finger inserted, and an arm behind her head, smiling. Her perky yet saggy breasts have dark, puffy nipples, and she has pubic stubble. The moody, harmonious scene with a vignette boasts intricate detail, rich colors, and soft lighting, set against an ambient, dynamic background, creating an emotional, romantic, and inspirational composition with shiny, elegant textures.",
    "spreading legs 11":
        "A photo of a nude woman with long brown hair lying on her bed, legs spread apart, focusing on her wet, glistening genital area with white, viscous fluid—likely semen—dripping from her vulva. She looks into the camera with a satisfied expression, captured under harsh flash photography.",
};

const workflow = {
    4: {
        inputs: { ckpt_name: "SDXL/lustimix_.safetensors" },
        class_type: "CheckpointLoaderSimple",
    },
    47: {
        inputs: { samples: ["160", 0], vae: ["4", 2] },
        class_type: "VAEDecode",
    },
    76: {
        inputs: { stop_at_clip_layer: -2, clip: ["84", 1] },
        class_type: "CLIPSetLastLayer",
    },
    84: {
        inputs: {
            PowerLoraLoaderHeaderWidget: { type: "PowerLoraLoaderHeaderWidget" },
            lora_1: { on: true, lora: "SDXL/add-detail-xl.safetensors", strength: 0.25 },
            lora_2: {
                on: true,
                lora: "SDXL_1.0/Breast Slider - Pony_alpha1.0_rank4_noxattn_last.safetensors",
                strength: 0.9,
            },
            "➕ Add Lora": "",
            model: ["4", 0],
            clip: ["4", 1],
        },
        class_type: "Power Lora Loader (rgthree)",
    },
    103: {
        inputs: {
            text: "",
            clip: ["76", 0],
        },
        class_type: "CLIPTextEncode",
    },
    105: {
        inputs: {
            seed: 0,
            steps: 6,
            cfg: 1.5,
            sampler_name: "euler_ancestral",
            scheduler: "normal",
            denoise: 1,
            model: ["193", 0],
            positive: ["178:2", 0],
            negative: ["103", 0],
            latent_image: ["152", 0],
        },
        class_type: "KSampler",
    },
    106: {
        inputs: {
            object_to_patch: "diffusion_model",
            residual_diff_threshold: 0.1,
            start: 0,
            end: 1,
            max_consecutive_cache_hits: -1,
            model: ["84", 0],
        },
        class_type: "ApplyFBCacheOnModel",
    },
    152: {
        inputs: { resolution: "896x1152 (0.78)", batch_size: 1, width_override: 0, height_override: 0 },
        class_type: "SDXLEmptyLatentSizePicker+",
    },
    160: {
        inputs: { aggressive: true, latent: ["105", 0] },
        class_type: "FreeMemoryLatent",
    },
    171: {
        inputs: {
            theme: "🎲 Dynamic Random",
            complexity: "complex",
            randomize: "enable",
            debug_mode: "off",
            seed: 0,
            custom_subject: "",
            custom_location: "",
            include_environment: "yes",
            include_style: "yes",
            include_effects: "yes",
        },
        class_type: "IsulionMegaPromptV3",
    },
    193: {
        inputs: {
            mode: "default",
            backend: "inductor",
            fullgraph: false,
            dynamic: false,
            model: ["106", 0],
        },
        class_type: "CompileModel",
    },
    217: {
        inputs: { filename_prefix: "", images: ["47", 0] },
        class_type: "SaveImage",
    },
    "178:0": {
        inputs: {
            text: "",
        },
        class_type: "Text Multiline",
    },
    "178:1": {
        inputs: { boolean: false, on_true: ["171", 0], on_false: ["178:0", 0] },
        class_type: "Switch any [Crystools]",
    },
    "178:2": {
        inputs: { text: ["178:1", 0], clip: ["76", 0] },
        class_type: "CLIPTextEncode",
    },
};

window.onload = function () {
    const outputImage = document.getElementById("outputImage");
    const imageActions = document.getElementById("imageActions");
    const info = document.getElementById("info");
    const status = document.getElementById("status");
    const savedSeed = localStorage.getItem("lastSeed");
    if (savedSeed) document.getElementById("seed").value = savedSeed;

    outputImage.src = "";
    outputImage.style.display = "none";
    imageActions.style.display = "none";
    info.style.display = "none";
    info.className = "";
    info.textContent = "";
    status.style.display = "none";
    status.className = "";
    status.textContent = "";
};

const checkpointCache = {};
function fetchCheckpointOptions() {
    if (checkpointCache.checkpoints) return checkpointCache.checkpoints;

    const baseCheckpoints = [
        "---- Illustrious ----",
        "Illustrious/cyberillustrious_v30.safetensors",
        "Illustrious/novaRealityXL_illustriousV20.safetensors",
        "Illustrious/realismIllustriousBy_v30FP16.safetensors",
        "Illustrious/redcraftCADSUpdatedMar11_illust3relustion.safetensors",
        "Illustrious/rillusmRealistic_v20.safetensors",
        "---- Pony ----",
        "Pony/3xthreat2kModelThatUsesPONY_v10.safetensors",
        "Pony/babesByStableYogi_ponyV4VAEFix.safetensors",
        "Pony/cyberrealisticPony_v85.safetensors",
        "Pony/fasercore_v30PonyFP16.safetensors",
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
        "SDXL/babesByStableYogi_v4XLFP16.safetensors",
        "SDXL/biglovexl2.wBWt.safetensors",
        "SDXL/biglust16.kst6.safetensors",
        "SDXL/boomerArtModelBAM_bamV2.safetensors",
        "SDXL/clarityXL_v20.safetensors",
        "SDXL/cyberrealisticXL_v5.safetensors",
        "SDXL/epicrealismXL_vxvAnewstoryRealism.safetensors",
        "SDXL/fasercore_xlV1.safetensors",
        "SDXL/jibMixRealisticXL_v160Aphrodite.safetensors",
        "SDXL/juggernautXL_juggXIByRundiffusion.safetensors",
        "SDXL/leosamsHelloworldXL_helloworldXL70.safetensors",
        "SDXL/lustifySDXLNSFW_endgame.safetensors",
        "SDXL/lustifySDXLNSFW_oltONELASTTIME.safetensors",
        "SDXL/lustimix_.safetensors",
        "SDXL/lustimix_big.safetensors",
        "SDXL/msSDXLRealV3_v3.safetensors",
        "SDXL/novaRealityXL_v70.safetensors",
        "SDXL/omnigenxlNSFWSFW_v10.safetensors",
        "SDXL/perfectionRealisticILXL_v10.safetensors",
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
        "---- SDXL Lightning ----",
        "SDXL-Lightning/agxl_LightningV10.safetensors",
        "SDXL-Lightning/babesByStableYogi_v4XLLightning.safetensors",
        "SDXL-Lightning/copaxTimeless_photorealismSDXL8Step.safetensors",
        "SDXL-Lightning/dreamshaperXL_lightningDPMSDE.safetensors",
        "SDXL-Lightning/Epicrealismxl_Hades.safetensors",
        "SDXL-Lightning/jibMixRealisticXL_v10Lightning46Step.safetensors",
        "SDXL-Lightning/juggernautXL_v9Rdphoto2Lightning.safetensors",
        "SDXL-Lightning/realismByStableYogi_v5XLLightning.safetensors",
        "SDXL-Lightning/realvisxlV50_v50LightningBakedvae.safetensors",
    ];

    checkpointCache.checkpoints = baseCheckpoints.map((ckpt) => ckpt);
    return checkpointCache.checkpoints;
}

function fetchSamplerOptions() {
    return [
        "euler",
        "euler_ancestral",
        "dpmpp_sde",
        "dpmpp_2m",
        "dpmpp_2m_sde",
        "dpmpp_3m_sde",
        "deis",
        "res_multistep",
    ];
}

function fetchSchedulerOptions() {
    return ["normal", "karras", "exponential", "sgm_uniform", "simple", "beta"];
}

function populateDropdowns() {
    const container = document.querySelector(".container");
    const detailsContent = container.querySelector("details > div");

    let checkpointFormGroup = document.getElementById("checkpointFormGroup");
    if (!checkpointFormGroup) {
        const checkpointOptions = fetchCheckpointOptions();
        checkpointFormGroup = document.createElement("div");
        checkpointFormGroup.id = "checkpointFormGroup";
        checkpointFormGroup.className = "form-group";

        const checkpointLabel = document.createElement("label");
        checkpointLabel.htmlFor = "checkpoint";
        checkpointLabel.textContent = "Checkpoint Model";

        const checkpointSelect = document.createElement("select");
        checkpointSelect.id = "checkpoint";
        checkpointSelect.name = "checkpoint";

        checkpointOptions.forEach((option) => {
            const optionElement = document.createElement("option");
            const displayName = option.replace(/^(SDXL\/|SDXL-Lightning\/|Pony\/|Illustrious\/)/, "");
            optionElement.value = option;
            optionElement.textContent = displayName;
            if (option === "SDXL-Lightning/realismByStableYogi_v5XLLightning.safetensors")
                optionElement.selected = true;
            checkpointSelect.appendChild(optionElement);
        });

        checkpointFormGroup.appendChild(checkpointLabel);
        checkpointFormGroup.appendChild(checkpointSelect);
        detailsContent.insertBefore(checkpointFormGroup, detailsContent.firstChild);
    }

    let samplerFormGroup = document.getElementById("samplerFormGroup");
    if (!samplerFormGroup) {
        const samplerOptions = fetchSamplerOptions();
        samplerFormGroup = document.createElement("div");
        samplerFormGroup.id = "samplerFormGroup";
        samplerFormGroup.className = "form-group";

        const samplerLabel = document.createElement("label");
        samplerLabel.htmlFor = "sampler";
        samplerLabel.textContent = "Sampler";

        const samplerSelect = document.createElement("select");
        samplerSelect.id = "sampler";
        samplerSelect.name = "sampler";

        samplerOptions.forEach((option) => {
            const optionElement = document.createElement("option");
            optionElement.value = option;
            optionElement.textContent = option;
            if (option === "euler_ancestral") optionElement.selected = true;
            samplerSelect.appendChild(optionElement);
        });

        samplerFormGroup.appendChild(samplerLabel);
        samplerFormGroup.appendChild(samplerSelect);
        detailsContent.appendChild(samplerFormGroup);
    }

    let schedulerFormGroup = document.getElementById("schedulerFormGroup");
    if (!schedulerFormGroup) {
        const schedulerOptions = fetchSchedulerOptions();
        schedulerFormGroup = document.createElement("div");
        schedulerFormGroup.id = "schedulerFormGroup";
        schedulerFormGroup.className = "form-group";

        const schedulerLabel = document.createElement("label");
        schedulerLabel.htmlFor = "scheduler";
        schedulerLabel.textContent = "Scheduler";

        const schedulerSelect = document.createElement("select");
        schedulerSelect.id = "scheduler";
        schedulerSelect.name = "scheduler";

        schedulerOptions.forEach((option) => {
            const optionElement = document.createElement("option");
            optionElement.value = option;
            optionElement.textContent = option;
            if (option === "normal") optionElement.selected = true;
            schedulerSelect.appendChild(optionElement);
        });

        schedulerFormGroup.appendChild(schedulerLabel);
        schedulerFormGroup.appendChild(schedulerSelect);
        detailsContent.appendChild(schedulerFormGroup);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    populateDropdowns();

    const presetSelect = document.getElementById("preset");
    const promptTextarea = document.getElementById("prompt");
    if (presetSelect) {
        presetSelect.addEventListener("change", () => {
            const selectedPreset = presetSelect.value;
            if (selectedPreset !== "none") {
                promptTextarea.value = presets[selectedPreset];
            } else {
                promptTextarea.value = "";
            }
        });
    }

    const checkpointSelect = document.getElementById("checkpoint");
    if (checkpointSelect) {
        checkpointSelect.addEventListener("change", () => {
            workflow["4"]["inputs"]["ckpt_name"] = checkpointSelect.value;
            console.log("Checkpoint updated to:", checkpointSelect.value);
        });
    }

    const samplerSelect = document.getElementById("sampler");
    if (samplerSelect) {
        samplerSelect.addEventListener("change", () => {
            workflow["105"]["inputs"]["sampler_name"] = samplerSelect.value;
            console.log("Sampler updated to:", samplerSelect.value);
        });
    }

    const schedulerSelect = document.getElementById("scheduler");
    if (schedulerSelect) {
        schedulerSelect.addEventListener("change", () => {
            workflow["105"]["inputs"]["scheduler"] = schedulerSelect.value;
            console.log("Scheduler updated to:", schedulerSelect.value);
        });
    }

    const outputImage = document.getElementById("outputImage");
    const lightbox = document.getElementById("lightbox");
    const lightboxImage = document.getElementById("lightboxImage");
    const closeLightbox = document.getElementById("closeLightbox");

    outputImage.addEventListener("click", () => {
        if (outputImage.src && outputImage.style.display !== "none") {
            lightboxImage.src = outputImage.src;
            lightbox.style.display = "flex";
        }
    });

    closeLightbox.addEventListener("click", () => {
        lightbox.style.display = "none";
    });

    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = "none";
        }
    });
});

async function generateImage() {
    const promptInput = document.getElementById("prompt").value;
    const promptNegativeInput = document.getElementById("prompt-negative").value;
    const stepsInput = document.getElementById("steps").value;
    const cfgInput = document.getElementById("cfg").value;
    const imageMode = document.getElementById("imageMode").value;
    const seedInput = document.getElementById("seed").value;
    const useDynamicPrompt = document.getElementById("useDynamicPrompt").checked;
    const info = document.getElementById("info");
    const status = document.getElementById("status");
    const error = document.getElementById("error");
    const button = document.querySelector("button");
    const outputImage = document.getElementById("outputImage");
    const imageActions = document.getElementById("imageActions");

    if (!promptInput) {
        showError(error, "Deskripsi gambar tidak boleh kosong!");
        return;
    }

    if (!document.getElementById("checkpoint")) populateDropdowns();

    showInfo(info, "Membuat gambar...");
    error.style.display = "none";
    outputImage.style.display = "none";
    imageActions.style.display = "none";
    button.disabled = true;

    try {
        const steps = parseInt(stepsInput);
        const cfg = parseFloat(cfgInput);
        if (isNaN(steps) || steps < 1 || steps > 100) throw new Error("Steps harus berupa angka antara 1 dan 100!");
        if (isNaN(cfg) || cfg < 1 || cfg > 30) throw new Error("CFG harus berupa angka antara 1 dan 30!");

        const checkpointSelect = document.getElementById("checkpoint");
        const samplerSelect = document.getElementById("sampler");
        const schedulerSelect = document.getElementById("scheduler");
        if (checkpointSelect && samplerSelect && schedulerSelect) {
            workflow["4"]["inputs"]["ckpt_name"] = checkpointSelect.value;
            workflow["178:0"]["inputs"]["text"] = promptInput;
            workflow["171"]["inputs"]["custom_subject"] = promptInput;
            workflow["103"]["inputs"]["text"] = promptNegativeInput;
            workflow["105"]["inputs"]["steps"] = steps;
            workflow["105"]["inputs"]["cfg"] = cfg;
            workflow["105"]["inputs"]["sampler_name"] = samplerSelect.value;
            workflow["105"]["inputs"]["scheduler"] = schedulerSelect.value;
            workflow["178:1"]["inputs"]["boolean"] = useDynamicPrompt;
        } else throw new Error("Dropdowns tidak ditemukan!");

        const MAX_SEED = BigInt("18446744073709551615");
        if (!seedInput || isNaN(seedInput) || seedInput === "-1") {
            const randomValue =
                BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)) *
                BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
            const seed = randomValue % (MAX_SEED + BigInt(1));
            currentSeedNum = seed;
            workflow["105"]["inputs"]["seed"] = Number(seed);
            workflow["171"]["inputs"]["seed"] = Number(seed);
        } else {
            const seedNum = BigInt(seedInput);
            if (seedNum < BigInt(0) || seedNum > MAX_SEED) throw new Error(`Seed harus antara 0 dan ${MAX_SEED}!`);
            currentSeedNum = seedNum;
            workflow["105"]["inputs"]["seed"] = Number(seedNum);
            workflow["171"]["inputs"]["seed"] = Number(seedNum);
        }

        if (imageMode === "portrait") workflow["152"]["inputs"]["resolution"] = "896x1152 (0.78)";
        else if (imageMode === "landscape") workflow["152"]["inputs"]["resolution"] = "1152x896 (1.29)";
        else if (imageMode === "square") workflow["152"]["inputs"]["resolution"] = "1024x1024 (1.0)";

        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().split("T")[0];
        workflow["217"]["inputs"]["filename_prefix"] = `webui-rated-r/${formattedDate}/${currentSeedNum}`;

        console.log("[DEBUG] Parameter pembuatan gambar:", {
            checkpoint: workflow["4"]["inputs"]["ckpt_name"],
            sampler: workflow["105"]["inputs"]["sampler_name"],
            scheduler: workflow["105"]["inputs"]["scheduler"],
            seed: workflow["105"]["inputs"]["seed"],
            steps: steps,
            cfg: cfg,
            imageMode: imageMode,
            useDynamicPrompt: useDynamicPrompt,
        });

        const response = await fetch(`${COMFYUI_URL}/prompt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: workflow, client_id: "webapp" }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gagal terhubung ke server: ${response.status} - ${errorText}`);
        }

        const { prompt_id } = await response.json();
        console.log("[DEBUG] Prompt ID:", prompt_id);

        let imageUrl = null;
        let attempts = 0;
        const maxAttempts = 30;
        while (!imageUrl && attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const historyResponse = await fetch(`${COMFYUI_URL}/history/${prompt_id}`);
            const history = await historyResponse.json();
            if (history[prompt_id] && history[prompt_id].outputs["217"]) {
                const images = history[prompt_id].outputs["217"].images;
                if (images && images.length > 0) {
                    const imageData = images[0];
                    if (imageData && imageData.filename && imageData.subfolder !== undefined && imageData.type) {
                        imageUrl = `${COMFYUI_URL}/view?filename=${imageData.filename}&subfolder=${imageData.subfolder}&type=${imageData.type}`;
                        lastImageData = imageData;
                        console.log("[DEBUG] Gambar ditemukan:", imageUrl);
                    }
                }
            }
            attempts++;
        }

        if (!imageUrl) throw new Error("Gagal mengambil gambar setelah 30 detik.");

        outputImage.src = imageUrl;
        outputImage.style.display = "block";
        imageActions.style.display = "flex";

        const successMessage = `
            <details aria-expanded="false">
                <summary>Data Pembuatan Gambar</summary>
                <table class="success-table">
                    <tr><th colspan="2">${promptInput}</th></tr>
                    <tr><td>Checkpoint:</td><td>${checkpointSelect.value}</td></tr>
                    <tr><td>Mode:</td><td>${imageMode}</td></tr>
                    <tr><td>Steps:</td><td>${steps}</td></tr>
                    <tr><td>CFG:</td><td>${cfg}</td></tr>
                    <tr><td>Seed:</td><td>${currentSeedNum}</td></tr>
                    <tr><td>Sampler:</td><td>${samplerSelect.value}</td></tr>
                    <tr><td>Scheduler:</td><td>${schedulerSelect.value}</td></tr>
                </table>
            </details>
        `;
        showStatus(status, successMessage, "success");
        localStorage.setItem("lastGeneratedImage", imageUrl);
        localStorage.setItem("lastSeed", currentSeedNum);
    } catch (err) {
        let errorMessage = err.message;
        if (errorMessage.includes("fetch")) errorMessage = "Tidak dapat terhubung ke server!";
        else if (errorMessage.includes("Seed")) errorMessage = `Seed harus antara 0 dan ${MAX_SEED}!`;
        showError(error, errorMessage);
        console.error("[DEBUG] Kesalahan saat membuat gambar:", err);
    } finally {
        button.disabled = false;
    }
}

async function deleteImage() {
    const status = document.getElementById("status");
    const error = document.getElementById("error");
    const outputImage = document.getElementById("outputImage");
    const imageActions = document.getElementById("imageActions");
    const button = document.querySelector(".delete");
    const lightbox = document.getElementById("lightbox");
    const seedInput = document.getElementById("seed");

    if (!lastImageData || !lastImageData.filename) {
        showError(error, "Tidak ada gambar yang dapat dihapus!");
        return;
    }

    showInfo(info, "Menghapus gambar...");
    button.disabled = true;

    try {
        console.log("Attempting to delete image with data:", lastImageData);
        const url = new URL(`${COMFYUI_URL}/comfyapi/v1/output-images/${encodeURIComponent(lastImageData.filename)}`);
        url.searchParams.append("temp", "false");
        url.searchParams.append("subfolder", lastImageData.subfolder);
        console.log("DELETE request URL:", url.toString());

        const response = await fetch(url, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gagal menghapus gambar: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log("Delete response:", result);

        const MAX_SEED = BigInt("18446744073709551615");
        const randomValue =
            BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)) *
            BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
        currentSeedNum = randomValue % (MAX_SEED + BigInt(1));
        workflow["105"]["inputs"]["seed"] = Number(currentSeedNum);
        workflow["171"]["inputs"]["seed"] = Number(currentSeedNum);
        seedInput.value = currentSeedNum.toString();

        outputImage.src = "";
        outputImage.style.display = "none";
        imageActions.style.display = "none";
        lightbox.style.display = "none";
        lastImageData = null;
        showStatus(status, "Gambar berhasil dihapus!", "success");
        showInfo(info, "Gambar berhasil dihapus!", "success");
    } catch (err) {
        console.error("Delete error:", err);
        showError(error, `Gagal menghapus gambar: ${err.message}`);
    } finally {
        button.disabled = false;
    }
}

function clearImage() {
    const info = document.getElementById("info");
    const status = document.getElementById("status");
    const outputImage = document.getElementById("outputImage");
    const imageActions = document.getElementById("imageActions");
    const lightbox = document.getElementById("lightbox");
    const seedInput = document.getElementById("seed");
    const button = document.querySelector(".clear");

    if (!info || !status || !outputImage || !imageActions || !lightbox || !seedInput || !button) {
        console.error("[DEBUG] Missing DOM elements in clearImage:", {
            info: !!info,
            status: !!status,
            outputImage: !!outputImage,
            imageActions: !!imageActions,
            lightbox: !!lightbox,
            seedInput: !!seedInput,
            button: !!button,
        });
        showError(document.getElementById("error"), "Kesalahan internal: Elemen UI tidak ditemukan!");
        return;
    }

    showInfo(info, "Membersihkan gambar...");
    button.disabled = true;

    try {
        const MAX_SEED = BigInt("18446744073709551615");
        const randomValue =
            BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)) *
            BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
        currentSeedNum = randomValue % (MAX_SEED + BigInt(1));
        workflow["105"]["inputs"]["seed"] = Number(currentSeedNum);
        workflow["171"]["inputs"]["seed"] = Number(currentSeedNum);
        seedInput.value = currentSeedNum.toString();
        console.log("[DEBUG] Seed randomized in clearImage:", currentSeedNum.toString());

        outputImage.src = "";
        outputImage.style.display = "none";
        imageActions.style.display = "none";
        lightbox.style.display = "none";
        showStatus(status, `Gambar dibersihkan! Seed baru: ${currentSeedNum}`, "success");
        showInfo(info, `Gambar dibersihkan! Seed baru: ${currentSeedNum}`, "success");
    } catch (err) {
        console.error("[DEBUG] Error in clearImage:", err);
        showError(document.getElementById("error"), "Gagal membersihkan gambar!");
    } finally {
        button.disabled = false;
    }
}

function showInfo(errorElement, message) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
    setTimeout(() => (errorElement.style.display = "none"), 5000);
}

function showStatus(statusElement, message, type = "") {
    statusElement.innerHTML = message;
    statusElement.style.display = "block";
    statusElement.className = type;
    if (type !== "success")
        setTimeout(() => {
            if (statusElement.className !== "success") statusElement.style.display = "none";
        }, 5000);
}

function showError(errorElement, message) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
    setTimeout(() => (errorElement.style.display = "none"), 5000);
}
