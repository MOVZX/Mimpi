// NSFW Presets
const SFWPresets = {
    none: { label: "Tidak Ada", prompts: {} },
    "bedroom elegance": {
        label: "Bedroom Elegance",
        prompts: generatePrompts("bedroom", [
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "silk emerald-green blouse and high-waisted black trousers",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "cozy cream sweater and navy-blue jeans",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "flowing lavender dress with lace trim",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "chic white blouse and tailored gray skirt",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "knitted mustard sweater and dark denim shorts",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "fitted burgundy blazer and black slacks",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "casual striped T-shirt and beige capris",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "pastel pink cardigan and floral-print skirt",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "satin navy-blue jumpsuit",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "vintage-style polka-dot dress",
            },
        ]),
    },
    "kitchen grace": {
        label: "Kitchen Grace",
        prompts: generatePrompts("kitchen", [
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "crisp white chef's apron over a red blouse and denim jeans",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "casual olive-green hoodie and black leggings",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "classic trench coat over a knee-length navy dress",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "sleeveless peach blouse and linen pants",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "stylish coral wrap dress",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "bohemian-patterned maxi dress",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "relaxed-fit plaid shirt and cargo pants",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "fitted leather jacket and dark jeans",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "bold geometric-print dress",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "sleek black turtleneck and charcoal-gray trousers",
            },
        ]),
    },
    "living room serenity": {
        label: "Living Room Serenity",
        prompts: generatePrompts("living room", [
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "pastel yellow sundress",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "loose-fitting mint-green top and white shorts",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "fitted navy-blue jumpsuit",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "floral-print dress",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "casual denim jacket and black leggings",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "sporty tank top and yoga pants",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "flowy teal blouse and khaki pants",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "cozy oversized sweater and jeans",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "chic black midi dress",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "comfortable loungewear set",
            },
        ]),
    },
    "gaming room vibe": {
        label: "Gaming Room Vibe",
        prompts: generatePrompts("gaming room", [
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "graphic tee and ripped jeans",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "sporty hoodie and joggers",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "sleek black jumpsuit",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "casual striped shirt and denim shorts",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "retro-style bomber jacket and black leggings",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "fitted athletic top and sweatpants",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "cozy knit sweater and leggings",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "casual flannel shirt and jeans",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "trendy crop top and high-waisted pants",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "stylish leather jacket and dark jeans",
            },
        ]),
    },
    "streaming room glow": {
        label: "Streaming Room Glow",
        prompts: generatePrompts("streaming room", [
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "casual hoodie and joggers",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "chic blouse and tailored pants",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "stylish dress and heels",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "casual sweater and jeans",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "cozy loungewear set",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "sporty tank top and shorts",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "casual tunic and leggings",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "relaxed-fit sweater and jeans",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "trendy outfit",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "professional blazer and skirt",
            },
        ]),
    },
};

// Fungsi untuk memilih warna rambut secara acak
function randomHairColours() {
    return hairColours[Math.floor(Math.random() * hairColours.length)];
}

// Fungsi untuk memilih gaya rambut secara acak
function randomHairStyles() {
    return hairStyles[Math.floor(Math.random() * hairStyles.length)];
}

// Fungsi untuk memilih kata sifat rambut secara acak
function randomHairAdjective() {
    return hairAdjectives[Math.floor(Math.random() * hairAdjectives.length)];
}

// Fungsi untuk menghasilkan usia acak (25-38)
function randomAge() {
    return (Math.random() * 13) | 25;
}

// Fungsi untuk menghasilkan prompt berdasarkan ruangan dan profil
function generatePrompts(room, profiles) {
    return profiles.reduce((prompts, profile, index) => {
        prompts[
            index + 1
        ] = `1girl, solo, ${profile.age}-year-old woman, ${profile.hairAdjective} ${profile.hairstyle} ${profile.haircolour} hair, stunningly beautiful, wearing ${profile.attire}, dynamic pose, ${room}, intricate details, realistic skin textures, skin pores, high resolution, best quality, real human aesthetic, hyperrealistic 8K, sfw`;

        return prompts;
    }, {});
}
