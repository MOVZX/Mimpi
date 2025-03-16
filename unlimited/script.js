const COMFYUI_URL = "http://gambar.ai:8188";
let currentSeedNum = 0;
let lastImageData = null;

const checkpointNameMapping = {
    "Illustrious/cyberillustrious_v30.safetensors": "CyberIllustrious V30",
    "Illustrious/novaRealityXL_illustriousV20.safetensors": "NovaRealityXL V20",
    "Illustrious/realismIllustriousBy_v30FP16.safetensors": "RealismIllustrious V30",
    "Illustrious/redcraftCADSUpdatedMar11_illust3relustion.safetensors": "RedcraftCADS Mar11",
    "Illustrious/rillusmRealistic_v20.safetensors": "RillusmRealistic V20",
    "Pony/3xthreat2kModelThatUsesPONY_v10.safetensors": "3xThreat2k V10",
    "Pony/babesByStableYogi_ponyV4VAEFix.safetensors": "BabesByStableYogi V4",
    "Pony/cyberrealisticPony_v85.safetensors": "CyberRealisticPony V85",
    "Pony/fasercore_v30PonyFP16.safetensors": "Fasercore V30",
    "Pony/iniverseMixSFWNSFW_ponyRealGuofengV50C.safetensors": "IniverseMix V50C",
    "Pony/ponyDiffusionV6XL.safetensors": "PonyDiffusion V6XL",
    "Pony/pornyPonyByStable_v20FP16.safetensors": "PornyPony V20",
    "Pony/realDream_sdxlPony15.safetensors": "RealDream Pony15",
    "Pony/realismByStableYogi_v40FP16.safetensors": "RealismByStableYogi V40",
    "Pony/uberRealisticPornMergePonyxl_ponyxlHybridV1.safetensors": "UberRealisticPornMerge V1",
    "SDXL/acornIsBoningXL_xlV2.safetensors": "AcornIsBoningXL V2",
    "SDXL/agxl_V2.safetensors": "AGXL V2",
    "SDXL/animaPencilXL_v500.safetensors": "AnimaPencilXL V500",
    "SDXL/babesByStableYogi_v4XLFP16.safetensors": "BabesByStableYogi V4XL",
    "SDXL/biglovexl2.wBWt.safetensors": "BigLoveXL2",
    "SDXL/biglust16.kst6.safetensors": "BigLust16",
    "SDXL/boomerArtModelBAM_bamV2.safetensors": "BoomerArtModel V2",
    "SDXL/clarityXL_v20.safetensors": "ClarityXL V20",
    "SDXL/cyberrealisticXL_v5.safetensors": "CyberRealisticXL V5",
    "SDXL/epicrealismXL_vxvAnewstoryRealism.safetensors": "EpicRealismXL VxV",
    "SDXL/fasercore_xlV1.safetensors": "Fasercore XL V1",
    "SDXL/jibMixRealisticXL_v160Aphrodite.safetensors": "JibMixRealisticXL V160",
    "SDXL/juggernautXL_juggXIByRundiffusion.safetensors": "JuggernautXL XI",
    "SDXL/leosamsHelloworldXL_helloworldXL70.safetensors": "HelloworldXL V70",
    "SDXL/lustifySDXLNSFW_endgame.safetensors": "LustifySDXL Endgame",
    "SDXL/lustifySDXLNSFW_oltONELASTTIME.safetensors": "LustifySDXL OLT",
    "SDXL/lustimix_.safetensors": "Lustimix",
    "SDXL/lustimix_big.safetensors": "Lustimix Big",
    "SDXL/msSDXLRealV3_v3.safetensors": "MSSDXLReal V3",
    "SDXL/novaRealityXL_v70.safetensors": "NovaRealityXL V70",
    "SDXL/omnigenxlNSFWSFW_v10.safetensors": "OmnigenXL V10",
    "SDXL/perfectionRealisticILXL_v10.safetensors": "PerfectionRealisticILXL V10",
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
    "SDXL-Lightning/agxl_LightningV10.safetensors": "AGXL Lightning V10",
    "SDXL-Lightning/babesByStableYogi_v4XLLightning.safetensors": "BabesByStableYogi V4XL Lightning",
    "SDXL-Lightning/copaxTimeless_photorealismSDXL8Step.safetensors": "CopaxTimeless PhotorealismSDXL",
    "SDXL-Lightning/dreamshaperXL_lightningDPMSDE.safetensors": "DreamshaperXL Lightning",
    "SDXL-Lightning/Epicrealismxl_Hades.safetensors": "EpicRealismXL Hades",
    "SDXL-Lightning/jibMixRealisticXL_v10Lightning46Step.safetensors": "JibMixRealisticXL V10 Lightning",
    "SDXL-Lightning/juggernautXL_v9Rdphoto2Lightning.safetensors": "JuggernautXL V9 Lightning",
    "SDXL-Lightning/leosamsHelloworldXL_hw50EulerALightning.safetensors": "HelloworldXL V50 Lightning",
    "SDXL-Lightning/lustifySDXLNSFW_v40DMD2.safetensors": "LustifySDXL v4.0 DMD",
    "SDXL-Lightning/realismByStableYogi_v5XLLightning.safetensors": "RealismByStableYogi V5XL Lightning",
    "SDXL-Lightning/realvisxlV50_v50LightningBakedvae.safetensors": "RealvisXL V50 Lightning",
    "SDXL-Lightning/stoiqoNewrealityFLUXSD35_XLLight10.safetensors": "StoiqoNewrealityFLUXSD35 Lightning",
    "SDXL-Turbo/wildcardxXLTURBO_wildcardxXLTURBOV10.safetensors": "WildcardXXLTURBO V10",
};

// Daftar Preset
const presets = {
    none: { label: "Tidak Ada", prompts: {} },
    "cum on face": {
        label: "Cum on Face",
        prompts: {
            "cum on face 1":
                "raw 8K night portrait, 30-year-old British woman, nude on bed, medium breasts with visible nipples and areolas, freckles, eyeliner, face covered in cum from one man, cum trails on wet face, hair, and body, tongue out, direct eye contact, flash photography, dark setting, amateur vibe, high detail, wet messy aesthetic",
            "cum on face 2":
                "photorealistic 4K, 25-year-old woman, long blonde hair, pale skin, small breasts, kneeling on floor, cum on face from one man, glossy lips, soft bedroom lighting, high detail, intimate atmosphere",
            "cum on face 3":
                "cinematic 8K, 32-year-old woman, short black hair, tan skin, medium breasts, sitting on couch, cum on face from one man, drooling slightly, warm living room light, realistic textures, seductive gaze",
            "cum on face 4":
                "amateur-style photo, 20-year-old woman, curly red hair, freckles, large breasts, lying on bed, cum on face from one man, messy hair, natural daylight, casual vibe, sharp focus",
            "cum on face 5":
                "hyperrealistic, 28-year-old woman, wavy brown hair, medium breasts, standing in bathroom, cum on face from one man, wet skin, steamy mirror background, soft lighting, detailed pores",
            "cum on face 6":
                "RAW 4K photo, 35-year-old woman, long dark hair, curvy figure, small breasts, sitting at desk, cum on face from one man, office setting, warm lamp glow, realistic shadows",
            "cum on face 7":
                "cinematic NSFW, 22-year-old woman, platinum blonde ponytail, fair skin, medium breasts, kneeling outdoors, cum on face from one man, sunset lighting, grassy field, high detail, sensual expression",
            "cum on face 8":
                "photorealistic 8K, 27-year-old woman, short bob haircut, tan skin, large breasts, lying on beach towel, cum on face from one man, ocean waves in background, bright sunlight, wet hair",
            "cum on face 9":
                "high-quality photo, 29-year-old woman, long chestnut hair, slim build, small breasts, sitting in car, cum on face from one man, night streetlights, foggy windows, intimate vibe",
            "cum on face 10":
                "ultra-sharp 4K, 31-year-old woman, black hair in bun, pale skin, medium breasts, standing in kitchen, cum on face from one man, morning light, apron only, realistic textures",
        },
    },
    "cumshot on tongue": {
        label: "Cumshot on Tongue",
        prompts: {
            "cumshot on tongue 1":
                "beautiful 30-year-old blonde woman, heavy makeup, blue eyes, cum on face from one man, tongue out with thick white cum, detailed face, visible skin pores, high-angle shot, photorealistic, sharp focus",
            "cumshot on tongue 2":
                "cinematic 4K, 24-year-old woman, long brown hair, green eyes, tongue out with cum from one man, medium breasts, kneeling in bedroom, soft lighting, realistic skin, intimate POV",
            "cumshot on tongue 3":
                "RAW photo, 28-year-old woman, short black hair, fair skin, tongue out with cum from one man, small breasts, sitting on floor, dim living room, warm glow, high detail",
            "cumshot on tongue 4":
                "photorealistic 8K, 21-year-old woman, curly blonde hair, tan skin, tongue out with cum from one man, large breasts, lying on couch, natural daylight, seductive look, sharp textures",
            "cumshot on tongue 5":
                "amateur-style, 33-year-old woman, wavy red hair, freckles, tongue out with cum from one man, medium breasts, kneeling in bathroom, wet hair, soft lighting, casual vibe",
            "cumshot on tongue 6":
                "high-quality 4K, 26-year-old woman, long dark hair, pale skin, tongue out with cum from one man, small breasts, sitting outdoors, sunset glow, grassy background, realistic detail",
            "cumshot on tongue 7":
                "cinematic NSFW, 29-year-old woman, short bob haircut, brown eyes, tongue out with cum from one man, medium breasts, standing in shower, water droplets, steamy atmosphere, sharp focus",
            "cumshot on tongue 8":
                "hyperrealistic, 23-year-old woman, platinum blonde, blue eyes, tongue out with cum from one man, large breasts, lying on bed, warm bedroom light, wet lips, high detail",
            "cumshot on tongue 9":
                "RAW 8K, 31-year-old woman, long chestnut hair, tan skin, tongue out with cum from one man, small breasts, sitting in car, night lighting, intimate setting, realistic pores",
            "cumshot on tongue 10":
                "photorealistic, 27-year-old woman, curly black hair, medium breasts, tongue out with cum from one man, kneeling on balcony, city skyline at dusk, soft glow, ultra-sharp",
        },
    },
    dildo: {
        label: "Dildo",
        prompts: {
            "dildo 1":
                "seductive atmosphere, confident woman, medium bouncing breasts, enlarged nipples, using fully inserted dildo vaginally, legs spread wide, dynamic low-angle shot, passionate intensity, realistic textures, soft lighting",
            "dildo 2":
                "photorealistic 8K, 25-year-old woman, long blonde hair, pale skin, small breasts, using dildo vaginally, sitting on bed, legs apart, warm bedroom light, high detail, sensual pose",
            "dildo 3":
                "cinematic 4K, 30-year-old woman, wavy brown hair, tan skin, large breasts, using dildo vaginally, lying on couch, legs spread, soft living room glow, realistic skin, intimate vibe",
            "dildo 4":
                "amateur-style photo, 22-year-old woman, short black hair, freckles, medium breasts, using dildo vaginally, kneeling on floor, natural daylight, casual setting, sharp focus",
            "dildo 5":
                "hyperrealistic, 28-year-old woman, curly red hair, fair skin, small breasts, using dildo vaginally, standing in shower, wet skin, steamy background, soft lighting, high detail",
            "dildo 6":
                "RAW 4K, 33-year-old woman, long dark hair, curvy figure, large breasts, using dildo vaginally, lying on rug, legs apart, warm fireplace light, realistic textures, seductive gaze",
            "dildo 7":
                "cinematic NSFW, 26-year-old woman, platinum blonde ponytail, medium breasts, using dildo vaginally, sitting on chair, legs spread, dim kitchen light, high detail, intimate atmosphere",
            "dildo 8":
                "photorealistic 8K, 29-year-old woman, short bob haircut, tan skin, small breasts, using dildo vaginally, lying on beach towel, legs apart, ocean waves, bright sunlight, sharp textures",
            "dildo 9":
                "high-quality photo, 24-year-old woman, long chestnut hair, pale skin, medium breasts, using dildo vaginally, kneeling on balcony, city skyline at night, soft glow, realistic detail",
            "dildo 10":
                "ultra-sharp 4K, 31-year-old woman, curly black hair, large breasts, using dildo vaginally, sitting in bathtub, bubbly water, candlelight, legs spread, sensual pose, high detail",
        },
    },
    "from behind": {
        label: "From Behind",
        prompts: {
            "from behind 1":
                "photorealistic, woman in dimly lit room, 30-year-old, slim body, lying on stomach, light brown long-sleeved top, short blue skirt pulled up, revealing ass and pussy, long brown hair, centered composition, dim lighting, shadows, uncensored, detailed skin, no panties, pussy juice, all fours, close-up vagina view",
            "from behind 2":
                "18-year-old Goth e-girl, blonde ponytail, fair skin, petite frame, small saggy breasts, erect nipples, bubble butt, blemishes, freckles, arm tattoo, winged eyeliner, eye contact, rear-view, spreading ass, realistic webcam style, film grain, soft dynamic lighting, dark blurred background",
            "from behind 3":
                "photorealistic 8K, topless brunette, long braided hair, shiny skin, black tights, close-up of round big butt, dynamic motion shot, dramatic angle, soft diffused lighting, vagina in focus, dark moody background, cinematic, rich colors, sharp details, mystical romantic vibe",
            "from behind 4":
                "anime-style masterpiece, ultra-high resolution, 30-year-old blonde, long straight hair, blue eyes, black eyeshadow, pale skin, athletic body, huge hips, thick thighs, round ass, perfect breasts, hard nipples, oiled shiny skin, all fours, ass up, spreading ass, revealing pussy, horny expression, sharp contours, bright colors, blurred castle background, uncensored",
            "from behind 5":
                "amateur voyeur photo, luxury apartment lounge, daytime, candid nudity, 30-year-old brunette, messy long hair, white crop top, fingering pussy, visible ass, shaved pubic hair, film grain, JPEG quality, casual distracted vibe",
            "from behind 6":
                "busty secretary, leaning over desk, spreading butt, wet pussy with dripping creampie from one man, photorealistic, high detail, warm lighting, office setting",
            "from behind 7":
                "masterpiece side-profile, 22-year-old Latina supermodel, tan skin, freckles, medium saggy breasts, tiny puffy nipples, open shirt, low panties, pajama bottoms, lying on bed, spreading ass cheeks, dripping creampie from one man, sensual expression, photorealistic, soft indoor lighting",
            "from behind 8":
                "amateur raw photo, dim bedroom, warm night lamp, cute blonde, lying on stomach, black shirt, perfect ass, thick thighs, creampie from one man, cum dripping from pussy, realistic textures, casual vibe",
            "from behind 9":
                "cinematic 4K, 27-year-old woman, long wavy red hair, pale skin, medium breasts, kneeling on rug, ass up, pussy visible, warm fireplace glow, realistic shadows, high detail, intimate setting",
            "from behind 10":
                "photorealistic 8K, 24-year-old woman, short black hair, tan skin, small breasts, lying on beach towel, ass raised, pussy visible, ocean waves in background, bright sunlight, sharp textures",
        },
    },
    "kneeling blowjob": {
        label: "Kneeling Blowjob",
        prompts: {
            "kneeling blowjob 1":
                "30-year-old woman, blonde ponytail, fair skin, medium breasts, bubble butt, blemishes, freckles, kneeling in dimly lit bedroom, messy deepthroat blowjob on one man, drool dripping, realistic webcam style, film grain, soft dynamic lighting, NSFW",
            "kneeling blowjob 2":
                "photorealistic NSFW, 19-year-old woman, messy wet hair, glistening skin, blowjob on one man’s large penis, top-down POV, intense gaze, athletic pose, rain setting, saliva dripping, ripped Supergirl cosplay, ominous jungle, Nikon F4, 50mm f1.2, Fujichrome Velvia 50, bokeh, edgy rock vibe",
            "kneeling blowjob 3":
                "side-view blowjob, beautiful woman, one standing man, perfect lighting, small breasts, deepthroat, creampie, tan lines, photorealistic, high detail, cinematic composition",
            "kneeling blowjob 4":
                "realistic, cinematic, 8K RAW photo, woman kneeling, blowjob on one man, deepthroat, cum on face, runny makeup, hand on head, wet penis, soft lighting, film grain, Fujifilm XT3, high-quality textures, POV",
            "kneeling blowjob 5":
                "photorealistic NSFW, 30-year-old Japanese MILF, messy black wet hair, licking one man’s large veiny black penis, side POV, freckles, acne, wrinkles, detailed skin, dark basement, flash photography, cum on tongue and face, amateur interracial style",
            "kneeling blowjob 6":
                "blowjob, fellatio, young beautiful woman, oiled skin, light reflections, performing on one man, high detail, realistic textures, soft lighting",
            "kneeling blowjob 7":
                "medium-quality ultrasharp photo, long-haired brunette, brown eyes, kneeling, fellatio on one man’s uncensored penis, cum in mouth and on face, freckles, POV from above, realistic, high detail, aesthetic erotic style",
            "kneeling blowjob 8":
                "high-quality explicit photo, 21-year-old Danish girl, curvy slim figure, wavy chestnut hair, sleepy sad expression, kneeling nude, deep blowjob on one man, excessive cum on face and hair, hair grab by one man, side-view, natural daylight, low contrast, gritty lomography, cozy messy bedroom",
            "kneeling blowjob 9":
                "cinematic 4K, 25-year-old woman, short blonde hair, tan skin, medium breasts, kneeling on beach, blowjob on one man, wet hair, ocean waves, sunset lighting, realistic textures, intimate POV",
            "kneeling blowjob 10":
                "RAW 8K photo, 28-year-old woman, long curly red hair, pale skin, small breasts, kneeling in shower, blowjob on one man, water dripping, steamy atmosphere, soft lighting, high detail",
        },
    },
    "kneeling tongue out": {
        label: "Kneeling Tongue Out",
        prompts: {
            "kneeling tongue out 1":
                "beautiful 35-year-old woman, kneeling, eyes closed, long hair, tongue out, anticipation, POV, realistic teeth, detailed skin, goosebumps, cinematic bedroom, photorealistic, fisheye lens, black casual outfit with bra and panties, medium breasts, natural white light",
            "kneeling tongue out 2":
                "photorealistic 8K, 23-year-old woman, short black hair, tan skin, small breasts, kneeling on floor, tongue out, seductive gaze, dim living room, warm lamp glow, high detail, intimate vibe",
            "kneeling tongue out 3":
                "cinematic 4K, 29-year-old woman, long blonde hair, pale skin, medium breasts, kneeling in bathroom, tongue out, wet hair, steamy mirror background, soft lighting, realistic textures",
            "kneeling tongue out 4":
                "amateur-style photo, 21-year-old woman, curly red hair, freckles, large breasts, kneeling on bed, tongue out, natural daylight, casual setting, sharp focus, sensual pose",
            "kneeling tongue out 5":
                "hyperrealistic, 27-year-old woman, wavy brown hair, fair skin, small breasts, kneeling outdoors, tongue out, sunset glow, grassy field, high detail, expressive look",
            "kneeling tongue out 6":
                "RAW 4K, 32-year-old woman, long dark hair, curvy figure, medium breasts, kneeling in kitchen, tongue out, morning light, apron only, realistic shadows, intimate atmosphere",
            "kneeling tongue out 7":
                "cinematic NSFW, 25-year-old woman, platinum blonde ponytail, tan skin, large breasts, kneeling on balcony, tongue out, city skyline at dusk, soft glow, high detail",
            "kneeling tongue out 8":
                "photorealistic 8K, 30-year-old woman, short bob haircut, pale skin, small breasts, kneeling on beach, tongue out, ocean waves, bright sunlight, wet hair, sharp textures",
            "kneeling tongue out 9":
                "high-quality photo, 26-year-old woman, long chestnut hair, medium breasts, kneeling in car, tongue out, night streetlights, foggy windows, intimate vibe, realistic detail",
            "kneeling tongue out 10":
                "ultra-sharp 4K, 28-year-old woman, curly black hair, large breasts, kneeling in shower, tongue out, water droplets, steamy atmosphere, soft lighting, high detail",
        },
    },
    penetration: {
        label: "Penetration",
        prompts: {
            "penetration 1":
                "cinematic 4K, gorgeous thicc woman, freckles, sexy figure, squatting cowgirl position on one man, vaginal penetration, close-up POV below, motion blur, moaning, uncensored, puffy nipples, sharp focus, moody vignette, grainy detail",
            "penetration 2":
                "photorealistic 8K, 25-year-old woman, long blonde hair, pale skin, medium breasts, missionary position with one man, vaginal penetration, lying on bed, warm bedroom light, realistic sweat, high detail",
            "penetration 3":
                "RAW 4K photo, 30-year-old woman, short black hair, tan skin, small breasts, doggy-style with one man, vaginal penetration, on floor, dim living room, soft glow, realistic textures",
            "penetration 4":
                "cinematic NSFW, 22-year-old woman, curly red hair, fair skin, large breasts, reverse cowgirl on one man, vaginal penetration, sitting on couch, natural daylight, dynamic angle, sharp focus",
            "penetration 5":
                "hyperrealistic, 28-year-old woman, wavy brown hair, medium breasts, standing sex with one man, vaginal penetration, against wall, wet skin, steamy bathroom, soft lighting, high detail",
            "penetration 6":
                "amateur-style photo, 33-year-old woman, long dark hair, curvy figure, small breasts, missionary with one man, vaginal penetration, on rug, warm fireplace light, realistic shadows, intimate vibe",
            "penetration 7":
                "photorealistic 8K, 26-year-old woman, platinum blonde ponytail, tan skin, medium breasts, cowgirl on one man, vaginal penetration, on chair, dim kitchen light, high detail, sensual motion",
            "penetration 8":
                "high-quality 4K, 29-year-old woman, short bob haircut, pale skin, large breasts, doggy-style with one man, vaginal penetration, on beach towel, ocean waves, sunset lighting, sharp textures",
            "penetration 9":
                "cinematic 4K, 24-year-old woman, long chestnut hair, fair skin, small breasts, standing sex with one man, vaginal penetration, on balcony, city skyline at night, soft glow, realistic detail",
            "penetration 10":
                "RAW 8K, 31-year-old woman, curly black hair, large breasts, missionary with one man, vaginal penetration, in bathtub, bubbly water, candlelight, high detail, intimate atmosphere",
        },
    },
    "pov blowjob": {
        label: "POV Blowjob",
        prompts: {
            "pov blowjob 1":
                "cinematic 4K, 30-year-old Korean woman, long dark hair, delicate features, POV blowjob on one man, detailed lips, saliva, cum on face and dripping, professional bokeh, high detail, realistic textures",
            "pov blowjob 2":
                "high-quality 8K cinematic, 30-year-old woman, POV blowjob on one man, cum on face, medium breasts, visible nipples, exposed pussy, shot from above, sharp focus, realistic lighting",
            "pov blowjob 3":
                "photorealistic 35mm film, 30-year-old Korean woman, long wet hair, deepthroating one man’s cock, drool and cum dripping, small tits, lingerie and nude, passionate expression, cinematic bokeh, film grain, ultra-sharp",
            "pov blowjob 4":
                "RAW 4K photo, 25-year-old woman, short blonde hair, tan skin, POV blowjob on one man, wet lips, cum on face, medium breasts, kneeling on floor, dim bedroom light, realistic textures",
            "pov blowjob 5":
                "cinematic NSFW, 22-year-old woman, curly red hair, pale skin, POV blowjob on one man, saliva dripping, large breasts, sitting on couch, natural daylight, high detail, intimate vibe",
            "pov blowjob 6":
                "hyperrealistic, 28-year-old woman, wavy brown hair, fair skin, POV blowjob on one man, cum on tongue, small breasts, kneeling outdoors, sunset glow, grassy field, sharp focus",
            "pov blowjob 7":
                "amateur-style 8K, 33-year-old woman, long dark hair, curvy figure, POV blowjob on one man, drool on chin, medium breasts, in bathroom, wet hair, soft lighting, realistic detail",
            "pov blowjob 8":
                "photorealistic 4K, 26-year-old woman, platinum blonde ponytail, tan skin, POV blowjob on one man, cum on face, large breasts, kneeling on beach, ocean waves, bright sunlight, high detail",
            "pov blowjob 9":
                "high-quality photo, 29-year-old woman, short bob haircut, pale skin, POV blowjob on one man, wet penis, small breasts, in car, night streetlights, foggy windows, sharp textures",
            "pov blowjob 10":
                "ultra-sharp 8K, 31-year-old woman, curly black hair, medium breasts, POV blowjob on one man, cum dripping, kneeling on balcony, city skyline at dusk, soft glow, realistic pores",
        },
    },
    "spreading legs": {
        label: "Spreading Legs",
        prompts: {
            "spreading legs 1":
                "solo woman, long brown hair, large breasts, brown eyes, nude, lying on back, legs spread, pussy visible, indoors, night, wet pussy, detailed skin, uncensored, cinematic bedroom, moonlit background",
            "spreading legs 2":
                "solo woman, long blonde hair, blue eyes, medium breasts, short-sleeve blue shirt, bottomless, lying on back, legs spread, masturbating, realistic, uncensored, bedroom, close-up shot",
            "spreading legs 3":
                "seductive brunette, yellow taxi backseat, New York, flashing medium breasts and pubic hair, provocative pose, soft-focus lens, cinematic haze, glossy lips, smoldering gaze",
            "spreading legs 4":
                "skinny curvy woman, medium breasts, pink nipples, black hair, ripped sheer tights, wet pussy, bondage with leather straps, shy orgasmic expression, Dutch angle, cold soft lighting, comic book style, disco club, shiny skin",
            "spreading legs 5":
                "gorgeous young woman, transparent nightgown, lifting gown, revealing pussy and ass, POV angle, seductive blush, expressive gaze, photorealistic, soft lighting",
            "spreading legs 6":
                "seductive woman, wavy light brown hair, huge natural breasts, light red nipples, shaved pussy spread, nude, night, flash photography, chiaroscuro lighting, high contrast, detailed face, 4K NSFW",
            "spreading legs 7":
                "30-year-old woman, wavy light brown hair, black lingerie, garter belt, huge natural breasts, shaved pussy spread with cum dripping from one man, elegant heels, night, flash photography, chiaroscuro, 4K NSFW",
            "spreading legs 8":
                "sexy 30-year-old blonde, short streaked hair, red dress, black thigh-high stockings, splayed thighs, hairy pussy, upskirt view, sharp focus, raunchy pose, perfect figure, high-quality photo",
            "spreading legs 9":
                "hyperrealistic, skinny goth girl, black hair with red highlights, green eyes, huge saggy breasts, fishnet stockings, squatting or lying back, spreading pussy, detailed labia, sweaty steamy look, soft lighting, vivid textures",
            "spreading legs 10":
                "cinematic 4K, goth girl, black hair with blue highlights, red eyes, lying back, legs spread, fingering pussy, perky saggy breasts, dark nipples, pubic stubble, moody vignette, soft lighting, Kodak 35mm, emotional romantic vibe",
            "spreading legs 11":
                "nude woman, long brown hair, lying on bed, legs spread, wet pussy with semen dripping from one man, satisfied expression, harsh flash photography, realistic textures, high detail",
        },
    },
    "shower tease": {
        label: "Shower Tease",
        prompts: {
            "shower tease 1":
                "photorealistic 8K, 25-year-old woman, wet black hair, medium breasts with erect nipples, glistening skin, standing in steamy shower, legs slightly apart, water droplets on body, seductive gaze, soft lighting, high detail, misty background",
            "shower tease 2":
                "cinematic 4K, 30-year-old woman, long blonde hair, pale skin, small breasts, standing in shower, legs apart, wet skin, soap suds, warm lighting, realistic textures, sensual pose",
            "shower tease 3":
                "RAW photo, 22-year-old woman, curly red hair, tan skin, large breasts, sitting in shower, legs spread, water streaming, steamy atmosphere, soft glow, high detail",
            "shower tease 4":
                "hyperrealistic, 28-year-old woman, short bob haircut, fair skin, medium breasts, leaning against shower wall, legs apart, wet hair, misty background, soft lighting, sharp focus",
            "shower tease 5":
                "amateur-style 8K, 33-year-old woman, wavy brown hair, curvy figure, small breasts, standing in shower, legs slightly apart, water droplets, natural light, casual vibe, realistic detail",
            "shower tease 6":
                "cinematic NSFW, 26-year-old woman, platinum blonde ponytail, tan skin, large breasts, sitting on shower floor, legs spread, wet skin, steamy air, warm glow, high detail",
            "shower tease 7":
                "photorealistic 4K, 29-year-old woman, long dark hair, pale skin, medium breasts, standing in shower, legs apart, soap on body, misty background, soft lighting, seductive look",
            "shower tease 8":
                "high-quality photo, 24-year-old woman, short black hair, fair skin, small breasts, leaning forward in shower, legs spread, water dripping, steamy atmosphere, sharp textures",
            "shower tease 9":
                "ultra-sharp 8K, 31-year-old woman, curly chestnut hair, tan skin, large breasts, standing in shower, legs apart, wet skin, soft lighting, misty backdrop, high detail",
            "shower tease 10":
                "RAW 4K, 27-year-old woman, long red hair, pale skin, medium breasts, sitting in shower, legs spread, water flowing, steamy environment, warm light, realistic pores",
        },
    },
    "missionary passion": {
        label: "Missionary Passion",
        prompts: {
            "missionary passion 1":
                "cinematic 4K, 28-year-old woman, long red hair, pale skin, large breasts, lying on back on silk sheets, legs spread, vaginal sex with one man, intense expression, sweat on skin, warm bedroom lighting, shallow depth of field, realistic textures",
            "missionary passion 2":
                "photorealistic 8K, 25-year-old woman, blonde hair, tan skin, medium breasts, lying on bed, vaginal sex with one man, legs spread, moaning, soft lighting, high detail, intimate vibe",
            "missionary passion 3":
                "RAW photo, 30-year-old woman, short black hair, fair skin, small breasts, lying on rug, vaginal sex with one man, legs apart, warm fireplace glow, realistic sweat, sharp focus",
            "missionary passion 4":
                "hyperrealistic, 22-year-old woman, wavy brown hair, pale skin, large breasts, lying on couch, vaginal sex with one man, legs spread, natural daylight, sensual expression, high detail",
            "missionary passion 5":
                "cinematic NSFW, 33-year-old woman, long dark hair, curvy figure, medium breasts, lying on floor, vaginal sex with one man, legs apart, dim living room, soft glow, realistic textures",
            "missionary passion 6":
                "amateur-style 8K, 26-year-old woman, platinum blonde ponytail, tan skin, small breasts, lying on bed, vaginal sex with one man, legs spread, morning light, casual vibe, sharp focus",
            "missionary passion 7":
                "photorealistic 4K, 29-year-old woman, short bob haircut, fair skin, large breasts, lying on beach towel, vaginal sex with one man, legs apart, ocean waves, sunset lighting, high detail",
            "missionary passion 8":
                "high-quality photo, 24-year-old woman, curly red hair, pale skin, medium breasts, lying on balcony, vaginal sex with one man, legs spread, city skyline at dusk, soft glow, realistic detail",
            "missionary passion 9":
                "ultra-sharp 8K, 31-year-old woman, long chestnut hair, tan skin, small breasts, lying in bathtub, vaginal sex with one man, legs apart, bubbly water, candlelight, high detail",
            "missionary passion 10":
                "RAW 4K, 27-year-old woman, curly black hair, fair skin, large breasts, lying on kitchen counter, vaginal sex with one man, legs spread, morning light, realistic textures",
        },
    },
    "topless beach": {
        label: "Topless Beach",
        prompts: {
            "topless beach 1":
                "hyperrealistic, 22-year-old woman, blonde bob haircut, tan skin, small perky breasts, standing on sandy beach, ocean waves in background, sunglasses on head, wet hair, subtle smile, bright sunlight, detailed skin pores, uncensored",
            "topless beach 2":
                "photorealistic 8K, 28-year-old woman, long dark hair, pale skin, medium breasts, walking on beach, waves crashing, wet skin, soft breeze, sunny day, high detail, natural pose",
            "topless beach 3":
                "cinematic 4K, 25-year-old woman, wavy brown hair, tan skin, large breasts, lying on beach towel, ocean in background, sunglasses, glistening skin, bright sunlight, realistic textures",
            "topless beach 4":
                "RAW photo, 30-year-old woman, short black hair, fair skin, small breasts, standing in shallow water, waves around legs, wet hair, sunny afternoon, sharp focus, detailed pores",
            "topless beach 5":
                "amateur-style 8K, 33-year-old woman, curly red hair, pale skin, medium breasts, sitting on sand, ocean horizon, natural light, casual vibe, high detail, subtle tan lines",
            "topless beach 6":
                "cinematic NSFW, 26-year-old woman, platinum blonde ponytail, tan skin, large breasts, kneeling on beach, waves in distance, wet skin, sunset glow, realistic shadows, sharp textures",
            "topless beach 7":
                "photorealistic 4K, 29-year-old woman, long chestnut hair, fair skin, small breasts, standing on rocky shore, ocean spray, bright sunlight, natural pose, high detail",
            "topless beach 8":
                "high-quality photo, 24-year-old woman, short bob haircut, tan skin, medium breasts, lying on beach chair, waves nearby, sunglasses on head, sunny day, realistic skin, sharp focus",
            "topless beach 9":
                "ultra-sharp 8K, 31-year-old woman, curly black hair, pale skin, large breasts, walking along shoreline, ocean waves, wet hair, soft breeze, bright sunlight, high detail",
            "topless beach 10":
                "RAW 4K, 27-year-old woman, long red hair, tan skin, small breasts, sitting on beach towel, waves in background, natural light, subtle smile, realistic textures",
        },
    },
    "kitchen seduction": {
        label: "Kitchen Seduction",
        prompts: {
            "kitchen seduction 1":
                "amateur-style photo, 35-year-old woman, brunette with messy bun, medium breasts, wearing only apron, leaning against kitchen counter, legs apart, pussy visible, warm morning light, candid vibe, realistic shadows, high detail",
            "kitchen seduction 2":
                "photorealistic 8K, 25-year-old woman, long blonde hair, tan skin, small breasts, standing in kitchen, apron only, legs spread, pussy visible, soft sunlight, high detail, seductive pose",
            "kitchen seduction 3":
                "cinematic 4K, 30-year-old woman, wavy brown hair, pale skin, large breasts, sitting on kitchen counter, apron lifted, pussy visible, warm lighting, realistic textures, intimate vibe",
            "kitchen seduction 4":
                "RAW photo, 22-year-old woman, short black hair, fair skin, medium breasts, leaning over kitchen table, apron only, legs apart, pussy visible, natural daylight, sharp focus",
            "kitchen seduction 5":
                "hyperrealistic, 28-year-old woman, curly red hair, tan skin, small breasts, standing by stove, apron only, legs spread, pussy visible, warm glow, high detail, sensual look",
            "kitchen seduction 6":
                "cinematic NSFW, 33-year-old woman, long dark hair, curvy figure, large breasts, sitting on kitchen floor, apron lifted, pussy visible, soft morning light, realistic shadows",
            "kitchen seduction 7":
                "photorealistic 4K, 26-year-old woman, platinum blonde ponytail, pale skin, medium breasts, leaning against fridge, apron only, legs apart, pussy visible, natural light, high detail",
            "kitchen seduction 8":
                "high-quality photo, 29-year-old woman, short bob haircut, tan skin, small breasts, standing by sink, apron only, legs spread, pussy visible, warm sunlight, sharp textures",
            "kitchen seduction 9":
                "ultra-sharp 8K, 31-year-old woman, curly chestnut hair, fair skin, large breasts, sitting on counter, apron lifted, pussy visible, morning light, realistic pores",
            "kitchen seduction 10":
                "RAW 4K, 27-year-old woman, long red hair, pale skin, medium breasts, leaning over island, apron only, legs apart, pussy visible, soft glow, high detail",
        },
    },
    "reverse cowgirl": {
        label: "Reverse Cowgirl",
        prompts: {
            "reverse cowgirl 1":
                "photorealistic NSFW, 27-year-old woman, curly black hair, athletic build, medium breasts, riding one man in reverse cowgirl position, facing away, pussy penetration, dim bedroom, soft glow from bedside lamp, dynamic angle, wet skin",
            "reverse cowgirl 2":
                "cinematic 4K, 25-year-old woman, long blonde hair, tan skin, small breasts, reverse cowgirl on one man, vaginal penetration, on bed, warm lighting, realistic sweat, high detail",
            "reverse cowgirl 3":
                "RAW photo, 30-year-old woman, short black hair, pale skin, large breasts, reverse cowgirl on one man, vaginal penetration, on couch, dim living room, soft glow, sharp focus",
            "reverse cowgirl 4":
                "hyperrealistic, 22-year-old woman, wavy brown hair, fair skin, medium breasts, reverse cowgirl on one man, vaginal penetration, on floor, natural daylight, dynamic pose, high detail",
            "reverse cowgirl 5":
                "cinematic NSFW, 33-year-old woman, long dark hair, curvy figure, small breasts, reverse cowgirl on one man, vaginal penetration, on rug, warm fireplace light, realistic textures",
            "reverse cowgirl 6":
                "amateur-style 8K, 26-year-old woman, platinum blonde ponytail, tan skin, large breasts, reverse cowgirl on one man, vaginal penetration, on chair, dim kitchen light, sharp focus",
            "reverse cowgirl 7":
                "photorealistic 4K, 29-year-old woman, short bob haircut, pale skin, medium breasts, reverse cowgirl on one man, vaginal penetration, on beach towel, ocean waves, sunset lighting, high detail",
            "reverse cowgirl 8":
                "high-quality photo, 24-year-old woman, curly red hair, fair skin, small breasts, reverse cowgirl on one man, vaginal penetration, on balcony, city skyline at dusk, soft glow, realistic detail",
            "reverse cowgirl 9":
                "ultra-sharp 8K, 31-year-old woman, long chestnut hair, tan skin, large breasts, reverse cowgirl on one man, vaginal penetration, in bathtub, bubbly water, candlelight, high detail",
            "reverse cowgirl 10":
                "RAW 4K, 28-year-old woman, curly black hair, pale skin, medium breasts, reverse cowgirl on one man, vaginal penetration, on kitchen counter, morning light, realistic textures",
        },
    },
    "bathtub solo": {
        label: "Bathtub Solo",
        prompts: {
            "bathtub solo 1":
                "cinematic 8K, 30-year-old woman, long platinum hair, huge natural breasts, sitting in bubbly bathtub, legs spread, fingering pussy, steamy atmosphere, candlelight, reflective water, seductive pose, ultra-sharp details",
            "bathtub solo 2":
                "photorealistic 4K, 25-year-old woman, wavy brown hair, tan skin, medium breasts, lying in bathtub, legs apart, masturbating, warm water, soft lighting, realistic textures, intimate vibe",
            "bathtub solo 3":
                "RAW photo, 28-year-old woman, short black hair, pale skin, small breasts, sitting in bathtub, legs spread, fingering pussy, bubbly water, dim glow, high detail",
            "bathtub solo 4":
                "hyperrealistic, 22-year-old woman, curly red hair, fair skin, large breasts, leaning back in bathtub, legs apart, masturbating, steamy air, candlelight, sharp focus",
            "bathtub solo 5":
                "cinematic NSFW, 33-year-old woman, long dark hair, curvy figure, medium breasts, sitting in bathtub, legs spread, fingering pussy, warm water, soft lighting, realistic shadows",
            "bathtub solo 6":
                "amateur-style 8K, 26-year-old woman, platinum blonde ponytail, tan skin, small breasts, lying in bathtub, legs apart, masturbating, bubbly water, natural light, high detail",
            "bathtub solo 7":
                "photorealistic 4K, 29-year-old woman, short bob haircut, pale skin, large breasts, sitting in bathtub, legs spread, fingering pussy, steamy atmosphere, warm glow, realistic textures",
            "bathtub solo 8":
                "high-quality photo, 24-year-old woman, long chestnut hair, fair skin, medium breasts, leaning back in bathtub, legs apart, masturbating, candlelight, sharp focus",
            "bathtub solo 9":
                "ultra-sharp 8K, 31-year-old woman, curly black hair, tan skin, small breasts, sitting in bathtub, legs spread, fingering pussy, bubbly water, soft lighting, high detail",
            "bathtub solo 10":
                "RAW 4K, 27-year-old woman, long red hair, pale skin, large breasts, lying in bathtub, legs apart, masturbating, steamy air, warm glow, realistic pores",
        },
    },
    "standing quickie": {
        label: "Standing Quickie",
        prompts: {
            "standing quickie 1":
                "raw 4K photo, 24-year-old woman, short brown hair, slim figure, small breasts, standing against wall, vaginal sex with one man, skirt lifted, panties pulled aside, dimly lit hallway, urgent expression, film grain, realistic textures",
            "standing quickie 2":
                "photorealistic 8K, 30-year-old woman, long blonde hair, tan skin, medium breasts, standing in bathroom, vaginal sex with one man, dress lifted, wet skin, steamy mirror, soft lighting, high detail",
            "standing quickie 3":
                "cinematic 4K, 25-year-old woman, wavy brown hair, pale skin, large breasts, standing in kitchen, vaginal sex with one man, apron lifted, morning light, realistic sweat, sharp focus",
            "standing quickie 4":
                "hyperrealistic, 28-year-old woman, short black hair, fair skin, small breasts, standing in closet, vaginal sex with one man, skirt pulled up, dim light, intimate vibe, high detail",
            "standing quickie 5":
                "cinematic NSFW, 33-year-old woman, long dark hair, curvy figure, medium breasts, standing in hallway, vaginal sex with one man, pants down, soft glow, realistic textures",
            "standing quickie 6":
                "amateur-style 8K, 26-year-old woman, platinum blonde ponytail, tan skin, large breasts, standing in garage, vaginal sex with one man, skirt lifted, dim lighting, casual vibe, sharp focus",
            "standing quickie 7":
                "photorealistic 4K, 29-year-old woman, curly red hair, pale skin, small breasts, standing on balcony, vaginal sex with one man, dress lifted, city skyline at dusk, soft glow, high detail",
            "standing quickie 8":
                "high-quality photo, 22-year-old woman, short bob haircut, fair skin, medium breasts, standing in shower, vaginal sex with one man, wet skin, steamy air, soft lighting, realistic detail",
            "standing quickie 9":
                "ultra-sharp 8K, 31-year-old woman, long chestnut hair, tan skin, large breasts, standing in bedroom, vaginal sex with one man, skirt pulled up, warm lamp light, high detail",
            "standing quickie 10":
                "RAW 4K, 27-year-old woman, curly black hair, pale skin, small breasts, standing in elevator, vaginal sex with one man, dress lifted, dim light, urgent pose, realistic textures",
        },
    },
    "mirror selfie": {
        label: "Mirror Selfie",
        prompts: {
            "mirror selfie 1":
                "amateur POV, 20-year-old woman, pink hair, petite frame, medium breasts with pierced nipples, nude in bathroom, legs apart, pussy visible in mirror, phone in hand, soft fluorescent lighting, wet tiles, casual vibe, high detail",
            "mirror selfie 2":
                "photorealistic 8K, 25-year-old woman, long blonde hair, tan skin, small breasts, nude in bedroom, legs spread, pussy visible in mirror, phone in hand, warm lamp light, realistic textures",
            "mirror selfie 3":
                "cinematic 4K, 30-year-old woman, wavy brown hair, pale skin, large breasts, nude in bathroom, legs apart, pussy visible in mirror, phone in hand, steamy air, soft lighting, high detail",
            "mirror selfie 4":
                "RAW photo, 22-year-old woman, short black hair, fair skin, medium breasts, nude in closet, legs spread, pussy visible in mirror, phone in hand, dim light, casual vibe, sharp focus",
            "mirror selfie 5":
                "hyperrealistic, 28-year-old woman, curly red hair, tan skin, small breasts, nude in bedroom, legs apart, pussy visible in mirror, phone in hand, natural daylight, high detail",
            "mirror selfie 6":
                "cinematic NSFW, 33-year-old woman, long dark hair, curvy figure, large breasts, nude in bathroom, legs spread, pussy visible in mirror, phone in hand, soft glow, realistic shadows",
            "mirror selfie 7":
                "photorealistic 4K, 26-year-old woman, platinum blonde ponytail, pale skin, medium breasts, nude in hallway, legs apart, pussy visible in mirror, phone in hand, warm lighting, high detail",
            "mirror selfie 8":
                "high-quality photo, 29-year-old woman, short bob haircut, tan skin, small breasts, nude in bedroom, legs spread, pussy visible in mirror, phone in hand, soft lamp light, sharp textures",
            "mirror selfie 9":
                "ultra-sharp 8K, 31-year-old woman, long chestnut hair, fair skin, large breasts, nude in bathroom, legs apart, pussy visible in mirror, phone in hand, steamy air, high detail",
            "mirror selfie 10":
                "RAW 4K, 27-year-old woman, curly black hair, pale skin, medium breasts, nude in dressing room, legs spread, pussy visible in mirror, phone in hand, soft lighting, realistic pores",
        },
    },
    "car backseat": {
        label: "Car Backseat",
        prompts: {
            "car backseat 1":
                "photorealistic NSFW, 29-year-old woman, dark blonde hair, curvy body, large breasts, sitting in car backseat, legs spread, vaginal creampie from one man, cum dripping, foggy windows, night streetlights, intimate atmosphere, sharp focus",
            "car backseat 2":
                "cinematic 4K, 25-year-old woman, long black hair, tan skin, medium breasts, lying in car backseat, vaginal sex with one man, legs apart, foggy windows, soft glow, realistic sweat, high detail",
            "car backseat 3":
                "RAW photo, 30-year-old woman, short blonde hair, pale skin, small breasts, sitting in car backseat, vaginal creampie from one man, cum dripping, night lighting, intimate vibe, sharp focus",
            "car backseat 4":
                "hyperrealistic, 22-year-old woman, wavy brown hair, fair skin, large breasts, lying in car backseat, vaginal sex with one man, legs spread, foggy windows, streetlights, high detail",
            "car backseat 5":
                "cinematic NSFW, 33-year-old woman, long dark hair, curvy figure, medium breasts, sitting in car backseat, vaginal creampie from one man, cum dripping, dim interior, soft glow, realistic textures",
            "car backseat 6":
                "amateur-style 8K, 26-year-old woman, platinum blonde ponytail, tan skin, small breasts, lying in car backseat, vaginal sex with one man, legs apart, foggy windows, night light, high detail",
            "car backseat 7":
                "photorealistic 4K, 28-year-old woman, curly red hair, pale skin, large breasts, sitting in car backseat, vaginal creampie from one man, cum dripping, soft streetlight glow, sharp focus",
            "car backseat 8":
                "high-quality photo, 24-year-old woman, short bob haircut, fair skin, medium breasts, lying in car backseat, vaginal sex with one man, legs spread, foggy windows, night setting, realistic detail",
            "car backseat 9":
                "ultra-sharp 8K, 31-year-old woman, long chestnut hair, tan skin, small breasts, sitting in car backseat, vaginal creampie from one man, cum dripping, dim interior, high detail",
            "car backseat 10":
                "RAW 4K, 27-year-old woman, curly black hair, pale skin, large breasts, lying in car backseat, vaginal sex with one man, legs apart, foggy windows, soft glow, realistic textures",
        },
    },
    "balcony tease": {
        label: "Balcony Tease",
        prompts: {
            "balcony tease 1":
                "high-quality 8K, 26-year-old woman, long wavy chestnut hair, tan skin, medium breasts, standing nude on balcony, city skyline at dusk, legs slightly apart, pussy visible, gentle breeze, warm sunset glow, cinematic composition",
            "balcony tease 2":
                "photorealistic 4K, 30-year-old woman, long blonde hair, pale skin, small breasts, standing nude on balcony, city lights at night, legs apart, pussy visible, soft glow, realistic textures",
            "balcony tease 3":
                "cinematic 4K, 25-year-old woman, wavy brown hair, tan skin, large breasts, leaning on balcony railing, legs spread, pussy visible, dusk skyline, warm lighting, high detail",
            "balcony tease 4":
                "RAW photo, 22-year-old woman, short black hair, fair skin, medium breasts, standing nude on balcony, city skyline, legs apart, pussy visible, soft breeze, sharp focus",
            "balcony tease 5":
                "hyperrealistic, 28-year-old woman, curly red hair, pale skin, small breasts, sitting on balcony edge, legs spread, pussy visible, night city lights, soft glow, high detail",
            "balcony tease 6":
                "cinematic NSFW, 33-year-old woman, long dark hair, curvy figure, large breasts, standing nude on balcony, city skyline at dusk, legs apart, pussy visible, warm sunset, realistic shadows",
            "balcony tease 7":
                "photorealistic 8K, 26-year-old woman, platinum blonde ponytail, tan skin, medium breasts, leaning on balcony, legs spread, pussy visible, night lights, soft glow, high detail",
            "balcony tease 8":
                "high-quality photo, 29-year-old woman, short bob haircut, fair skin, small breasts, standing nude on balcony, city skyline, legs apart, pussy visible, dusk lighting, sharp textures",
            "balcony tease 9":
                "ultra-sharp 8K, 31-year-old woman, long chestnut hair, tan skin, large breasts, sitting on balcony chair, legs spread, pussy visible, night cityscape, soft glow, high detail",
            "balcony tease 10":
                "RAW 4K, 27-year-old woman, curly black hair, pale skin, medium breasts, standing nude on balcony, city lights, legs apart, pussy visible, warm dusk glow, realistic pores",
        },
    },
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
            steps: 7,
            cfg: 1,
            sampler_name: "lcm",
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
            residual_diff_threshold: 0.2,
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
    const status = document.getElementById("status");
    const savedSeed = localStorage.getItem("lastSeed");
    if (savedSeed) document.getElementById("seed").value = savedSeed;

    outputImage.src = "";
    outputImage.style.display = "none";
    imageActions.style.display = "none";
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
        "SDXL-Lightning/leosamsHelloworldXL_hw50EulerALightning.safetensors",
        "SDXL-Lightning/lustifySDXLNSFW_v40DMD2.safetensors",
        "SDXL-Lightning/realismByStableYogi_v5XLLightning.safetensors",
        "SDXL-Lightning/realvisxlV50_v50LightningBakedvae.safetensors",
        "SDXL-Lightning/stoiqoNewrealityFLUXSD35_XLLight10.safetensors",
        "---- SDXL Turbo ----",
        "SDXL-Turbo/wildcardxXLTURBO_wildcardxXLTURBOV10.safetensors",
    ];

    checkpointCache.checkpoints = baseCheckpoints.map((ckpt) => ckpt);
    return checkpointCache.checkpoints;
}

function fetchSamplerOptions() {
    return [
        "euler",
        "euler_ancestral",
        "dpmpp_sde",
        "dpmpp_sde_gpu",
        "dpmpp_2m",
        "dpmpp_2m_sde",
        "dpmpp_2m_sde_gpu",
        "dpmpp_3m_sde",
        "dpmpp_3m_sde_gpu",
        "deis",
        "lcm",
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
            const displayName =
                checkpointNameMapping[option] ||
                option
                    .replace(/^(SDXL\/|SDXL-Lightning\/|SDXL-Turbo\/|Pony\/|Illustrious\/)/, "") // Remove prefix
                    .replace(/\.safetensors$/, ""); // Remove .safetensors
            optionElement.value = option;
            optionElement.textContent = displayName;
            if (option === "SDXL-Lightning/lustifySDXLNSFW_v40DMD2.safetensors") optionElement.selected = true;
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
            if (option === "lcm") optionElement.selected = true;
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

    // Populate preset dropdown dynamically with categories
    const presetSelect = document.getElementById("preset");
    if (presetSelect) {
        // Clear existing options (if any)
        presetSelect.innerHTML = "";

        // Add categories dynamically
        Object.keys(presets).forEach((categoryKey) => {
            const option = document.createElement("option");
            option.value = categoryKey;
            option.textContent = presets[categoryKey].label;
            presetSelect.appendChild(option);
        });

        // Handle preset category selection
        presetSelect.addEventListener("change", () => {
            const selectedCategory = presetSelect.value;
            const promptTextarea = document.getElementById("prompt");
            const subcategoryContainer = document.getElementById("subcategory-container");
            const subcategorySelect = document.getElementById("subcategory");

            // Clear the prompt textarea
            promptTextarea.value = "";

            // If "Tidak Ada" (none) is selected, hide and clear the subcategory dropdown
            if (selectedCategory === "none") {
                subcategoryContainer.style.display = "none";
                subcategorySelect.innerHTML = "";
                return;
            }

            // Show the subcategory dropdown
            subcategoryContainer.style.display = "block";

            // Clear previous subcategory options
            subcategorySelect.innerHTML = "";

            // Populate subcategory dropdown with prompts for the selected category
            const categoryPrompts = presets[selectedCategory].prompts;
            Object.keys(categoryPrompts).forEach((promptKey) => {
                const option = document.createElement("option");
                option.value = promptKey;
                // Capitalize and clean up the prompt name for display (e.g., "balcony tease 1" -> "Balcony Tease 1")
                option.textContent = promptKey.replace(
                    /^\w+\s+\w+\s+(\d+)$/,
                    (match, number) => `${presets[selectedCategory].label} ${number}`
                );
                subcategorySelect.appendChild(option);
            });

            // Automatically select the first subcategory (if available)
            if (subcategorySelect.options.length > 0) {
                subcategorySelect.value = subcategorySelect.options[0].value;
                promptTextarea.value = categoryPrompts[subcategorySelect.value];
            }
        });

        // Handle subcategory selection to update the prompt textarea
        const subcategorySelect = document.getElementById("subcategory");
        if (subcategorySelect) {
            subcategorySelect.addEventListener("change", () => {
                const selectedCategory = presetSelect.value;
                const selectedSubcategory = subcategorySelect.value;
                const promptTextarea = document.getElementById("prompt");

                // Update the prompt textarea with the selected subcategory prompt
                promptTextarea.value = presets[selectedCategory].prompts[selectedSubcategory] || "";
            });
        }
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
    const clipSkipInput = document.getElementById("clip-skip").value;
    const stepsInput = document.getElementById("steps").value;
    const cfgInput = document.getElementById("cfg").value;
    const imageMode = document.getElementById("imageMode").value;
    const seedInput = document.getElementById("seed").value;
    const useDynamicPrompt = document.getElementById("useDynamicPrompt").checked;
    const useDynamicSeed = document.getElementById("useDynamicSeed").checked;
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

    showStatus(status, "<center><b>Membuat gambar...</b></center>");
    error.style.display = "none";
    outputImage.style.display = "none";
    imageActions.style.display = "none";
    button.disabled = true;

    try {
        const steps = parseInt(stepsInput);
        const cfg = parseFloat(cfgInput);
        const clipSkip = parseInt(clipSkipInput);
        if (isNaN(steps) || steps < 1 || steps > 100) throw new Error("Steps harus berupa angka antara 1 dan 100!");
        if (isNaN(cfg) || cfg < 1 || cfg > 30) throw new Error("CFG harus berupa angka antara 1 dan 30!");
        if (isNaN(clipSkip) || clipSkip < -10 || clipSkip > -1)
            throw new Error("CLIP Skip harus berupa angka antara -1 dan -10!");

        const checkpointSelect = document.getElementById("checkpoint");
        const samplerSelect = document.getElementById("sampler");
        const schedulerSelect = document.getElementById("scheduler");
        if (checkpointSelect && samplerSelect && schedulerSelect) {
            workflow["4"]["inputs"]["ckpt_name"] = checkpointSelect.value;
            workflow["178:0"]["inputs"]["text"] = promptInput;
            workflow["171"]["inputs"]["custom_subject"] = promptInput;
            workflow["103"]["inputs"]["text"] = promptNegativeInput;
            workflow["76"]["inputs"]["stop_at_clip_layer"] = clipSkip;
            workflow["105"]["inputs"]["steps"] = steps;
            workflow["105"]["inputs"]["cfg"] = cfg;
            workflow["105"]["inputs"]["sampler_name"] = samplerSelect.value;
            workflow["105"]["inputs"]["scheduler"] = schedulerSelect.value;
            workflow["178:1"]["inputs"]["boolean"] = useDynamicPrompt;
        } else throw new Error("Dropdowns tidak ditemukan!");

        const MAX_SEED = BigInt("18446744073709551615");
        if (useDynamicSeed || !seedInput || isNaN(seedInput) || seedInput === "-1") {
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
                <summary style="color: #fff78e;">Data Pembuatan Gambar</summary>
                <table class="success-table">
                    <tr><td>Positive Prompt:</td><td>${promptInput}</td></tr>
                    <tr><td>Negative Prompt:</td><td>${promptNegativeInput}</td></tr>
                    <tr><td>CLIP Skip:</td><td>${clipSkip}</td></tr>
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
    const useDynamicSeed = document.getElementById("useDynamicSeed").checked;

    if (!lastImageData || !lastImageData.filename) {
        showError(error, "Tidak ada gambar yang dapat dihapus!");
        return;
    }

    showStatus(status, "<center><b>Menghapus gambar...</b></center>");
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

        if (useDynamicSeed) {
            const MAX_SEED = BigInt("18446744073709551615");
            const randomValue =
                BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)) *
                BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
            currentSeedNum = randomValue % (MAX_SEED + BigInt(1));
            workflow["105"]["inputs"]["seed"] = Number(currentSeedNum);
            workflow["171"]["inputs"]["seed"] = Number(currentSeedNum);
            seedInput.value = Number(currentSeedNum);
        }

        outputImage.src = "";
        outputImage.style.display = "none";
        imageActions.style.display = "none";
        lightbox.style.display = "none";
        lastImageData = null;
        showStatus(status, "<center><b>Gambar berhasil dihapus!</b></center>", "success");
    } catch (err) {
        console.error("Delete error:", err);
        showError(error, `Gagal menghapus gambar: ${err.message}`);
    } finally {
        button.disabled = false;
    }
}

function clearImage() {
    const status = document.getElementById("status");
    const outputImage = document.getElementById("outputImage");
    const imageActions = document.getElementById("imageActions");
    const lightbox = document.getElementById("lightbox");
    const seedInput = document.getElementById("seed");
    const useDynamicSeed = document.getElementById("useDynamicSeed").checked;
    const button = document.querySelector(".clear");

    if (!status || !outputImage || !imageActions || !lightbox || !seedInput || !button) {
        console.error("[DEBUG] Missing DOM elements in clearImage:", {
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

    showStatus(status, "<center><b>Membersihkan gambar...</b></center>");
    button.disabled = true;

    try {
        if (useDynamicSeed) {
            const MAX_SEED = BigInt("18446744073709551615");
            const randomValue =
                BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)) *
                BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
            currentSeedNum = randomValue % (MAX_SEED + BigInt(1));
            workflow["105"]["inputs"]["seed"] = Number(currentSeedNum);
            workflow["171"]["inputs"]["seed"] = Number(currentSeedNum);
            seedInput.value = Number(currentSeedNum);
            console.log("[DEBUG] Seed randomized in clearImage:", Number(currentSeedNum));
        }

        outputImage.src = "";
        outputImage.style.display = "none";
        imageActions.style.display = "none";
        lightbox.style.display = "none";
        showStatus(status, `<center><b>Seed baru: ${currentSeedNum}</b></center>`, "success");
    } catch (err) {
        console.error("[DEBUG] Error in clearImage:", err);
        showError(document.getElementById("error"), "Gagal membersihkan gambar!");
    } finally {
        button.disabled = false;
    }
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
