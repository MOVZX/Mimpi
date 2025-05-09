// NSFW Presets
const SFWPresets = {
    none: { label: "Tidak Ada", prompts: {} },
    "balcony breeze": {
        label: "Balcony Breeze",
        prompts: generatePrompts("balcony", [
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "flowy white sundress with wide-brimmed hat",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "casual denim jacket and pastel pink skirt",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "light blue blouse and khaki shorts",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "cozy cream cardigan and dark jeans",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "striped linen shirt and beige trousers",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "floral maxi dress with sandals",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "sleeveless coral top and white capris",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "relaxed-fit teal hoodie and gray leggings",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "chic black blazer and tailored skirt",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "vintage-style polka-dot blouse and jeans",
            },
        ]),
    },
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
    "cafe charm": {
        label: "Cafe Charm",
        prompts: generatePrompts("cafe", [
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "cozy beige sweater and plaid scarf",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "chic black turtleneck and high-waisted jeans",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "flowy olive-green dress with ankle boots",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "denim jacket and mustard-yellow skirt",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "white blouse and tailored khaki trousers",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "soft pink cardigan and gray leggings",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "striped shirt and dark denim overalls",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "leather jacket and black skinny jeans",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "bohemian floral top and wide-leg pants",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "navy blazer and cream midi skirt",
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
    "garden glow": {
        label: "Garden Glow",
        prompts: generatePrompts("garden", [
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "flowy floral sundress and straw hat",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "light linen blouse and olive-green shorts",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "pastel blue dress with sandals",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "casual white tee and denim overalls",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "soft yellow cardigan and khaki pants",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "bohemian patterned skirt and cream top",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "relaxed-fit green hoodie and jeans",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "sleeveless peach blouse and white shorts",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "chic navy jumpsuit with belt",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "vintage-style polka-dot dress and sneakers",
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
    "library calm": {
        label: "Library Calm",
        prompts: generatePrompts("library", [
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "cozy gray sweater and dark slacks",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "chic white blouse and pencil skirt",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "soft lavender cardigan and beige trousers",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "tailored navy blazer and khaki pants",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "flowy cream dress with subtle embroidery",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "casual denim shirt and black leggings",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "sleek black turtleneck and plaid skirt",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "relaxed-fit green hoodie and jeans",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "vintage-style blouse and high-waisted shorts",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "elegant burgundy dress with scarf",
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
    "office poise": {
        label: "Office Poise",
        prompts: generatePrompts("office", [
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "tailored black blazer and white blouse",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "sleek navy suit with pencil skirt",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "crisp white shirt and gray trousers",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "chic burgundy dress with belt",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "professional olive-green blazer and black pants",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "elegant cream blouse and tailored skirt",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "modern charcoal-gray suit with tie",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "sophisticated teal dress and blazer",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "classic black sheath dress",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "smart-casual plaid blazer and jeans",
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
    "studio creativity": {
        label: "Studio Creativity",
        prompts: generatePrompts("art studio", [
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "paint-splattered overalls and white tee",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "flowy bohemian blouse and denim shorts",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "casual gray hoodie and black jeans",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "vibrant orange tunic and leggings",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "cozy knit sweater and khaki pants",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "striped apron over a teal dress",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "relaxed-fit plaid shirt and jeans",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "chic black smock and trousers",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "bright yellow top and denim skirt",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "vintage-style jumpsuit with scarf",
            },
        ]),
    },
    // New Categories
    "beachside bliss": {
        label: "Beachside Bliss",
        prompts: generatePrompts("beach", [
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "flowy sundress with wide-brimmed hat",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "casual bikini and beach shorts",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "light blue swimsuit with sunglasses",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "cozy cover-up and wide-leg pants",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "striped t-shirt and cargo shorts",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "floral maxi dress with flip-flops",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "sleeveless top and shorts",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "relaxed-fit hoodie and swim trunks",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "chic bikini top and bottom",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "vintage-style swimsuit with a scarf",
            },
        ]),
    },
    "cityscape charm": {
        label: "Cityscape Charm",
        prompts: generatePrompts("city", [
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "flowy dress with a wide-brimmed hat",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "casual jacket and skirt",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "light blue blouse with jeans",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "cozy sweater and leggings",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "striped shirt and wide-leg pants",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "floral maxi dress with sandals",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "sleeveless top and shorts",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "relaxed-fit hoodie and jeans",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "chic blouse and pencil skirt",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "vintage-style outfit with a scarf",
            },
        ]),
    },
    "mountain retreat": {
        label: "Mountain Retreat",
        prompts: generatePrompts("mountain", [
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "flowy parka with wide-brimmed hat",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "casual jacket and hiking shorts",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "light blue sweater with jeans",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "cozy hoodie and hiking pants",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "striped shirt with wide-leg pants",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "floral maxi dress with hiking boots",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "sleeveless top and shorts",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "relaxed-fit hoodie and hiking boots",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "chic blouse and tailored skirt",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "vintage-style outfit with a scarf",
            },
        ]),
    },
    "desert oasis": {
        label: "Desert Oasis",
        prompts: generatePrompts("desert", [
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "flowy dress with a wide-brimmed hat",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "casual jacket and skirt",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "light blue blouse with jeans",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "cozy sweater and leggings",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "striped shirt and wide-leg pants",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "floral maxi dress with sandals",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "sleeveless top and shorts",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "relaxed-fit hoodie and jeans",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "chic blouse and pencil skirt",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "vintage-style outfit with a scarf",
            },
        ]),
    },
    "volcano view": {
        label: "Volcano View",
        prompts: generatePrompts("volcano", [
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "flowy parka with wide-brimmed hat",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "casual jacket and hiking shorts",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "light blue sweater with jeans",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "cozy hoodie and hiking pants",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "striped shirt with wide-leg pants",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "floral maxi dress with hiking boots",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "sleeveless top and shorts",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "relaxed-fit hoodie and hiking boots",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "chic blouse and tailored skirt",
            },
            {
                hairstyle: randomHairStyles(),
                haircolour: randomHairColours(),
                hairAdjective: randomHairAdjective(),
                age: randomAge(),
                attire: "vintage-style outfit with a scarf",
            },
        ]),
    },
};

/**
 * Fungsi untuk memilih warna rambut secara acak.
 *
 * @description Fungsi ini mengembalikan warna rambut secara acak dari daftar warna rambut.
 * @returns {string} Warna rambut yang dipilih secara acak.
 */
function randomHairColours() {
    return hairColours[Math.floor(Math.random() * hairColours.length)];
}

/**
 * Fungsi untuk memilih gaya rambut secara acak.
 *
 * @description Fungsi ini mengembalikan gaya rambut secara acak dari daftar gaya rambut.
 * @returns {string} Gaya rambut yang dipilih secara acak.
 */
function randomHairStyles() {
    return hairStyles[Math.floor(Math.random() * hairStyles.length)];
}

/**
 * Fungsi untuk memilih kata sifat rambut secara acak.
 *
 * @description Fungsi ini mengembalikan kata sifat rambut secara acak dari daftar kata sifat rambut.
 * @returns {string} Kata sifat rambut yang dipilih secara acak.
 */
function randomHairAdjective() {
    return hairAdjectives[Math.floor(Math.random() * hairAdjectives.length)];
}

/**
 * Fungsi untuk menghasilkan usia acak (25-38).
 *
 * @description Fungsi ini mengembalikan usia acak antara 25 dan 38.
 * @returns {number} Usia yang dihasilkan secara acak.
 */
function randomAge() {
    return (Math.random() * 13) | 25;
}

/**
 * Fungsi untuk menghasilkan prompt berdasarkan ruangan dan profil.
 *
 * @description Fungsi ini mengembalikan prompt yang dihasilkan berdasarkan ruangan dan profil.
 * @param {string} room Ruangan yang digunakan sebagai latar belakang.
 * @param {object[]} profiles Daftar profil yang digunakan untuk menghasilkan prompt.
 * @returns {object} Prompt yang dihasilkan berdasarkan ruangan dan profil.
 */
function generatePrompts(room, profiles) {
    return profiles.reduce((prompts, profile, index) => {
        prompts[
            index + 1
        ] = `1girl, solo, stunningly beautiful ${profile.age}-year-old woman, ${profile.hairAdjective} ${profile.hairstyle} ${profile.haircolour} hair, stunningly beautiful, wearing ${profile.attire}, dynamic pose, ${room}, intricate details, sfw`;

        return prompts;
    }, {});
}
