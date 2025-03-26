const censoredNode = {
    275: {
        inputs: {
            model: "nudenet.onnx",
        },
        class_type: "NudenetModelLoader",
    },
    276: {
        inputs: {
            FEMALE_GENITALIA_COVERED: true,
            FACE_FEMALE: false,
            BUTTOCKS_EXPOSED: true,
            FEMALE_BREAST_EXPOSED: true,
            FEMALE_GENITALIA_EXPOSED: true,
            MALE_BREAST_EXPOSED: false,
            ANUS_EXPOSED: true,
            FEET_EXPOSED: false,
            BELLY_COVERED: false,
            FEET_COVERED: false,
            ARMPITS_COVERED: false,
            ARMPITS_EXPOSED: false,
            FACE_MALE: false,
            BELLY_EXPOSED: false,
            MALE_GENITALIA_EXPOSED: true,
            ANUS_COVERED: false,
            FEMALE_BREAST_COVERED: false,
            BUTTOCKS_COVERED: false,
        },
        class_type: "FilterdLabel",
    },
    277: {
        inputs: {
            censor_method: "pixelate",
            min_score: 0.1,
            blocks: 3,
            block_count_scaling: "fixed",
            overlay_strength: 1,
            nudenet_model: ["275", 0],
            image: ["47", 0],
            filtered_labels: ["276", 0],
        },
        class_type: "ApplyNudenet",
    },
};
