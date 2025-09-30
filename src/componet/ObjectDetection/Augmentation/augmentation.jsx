import React, { useState, useRef, useEffect } from 'react'

import 'rc-slider/assets/index.css';

import { AugumentedData, ReturnAgumentation } from '../../../reduxToolkit/Slices/projectSlices';
import { useDispatch, useSelector } from "react-redux";
import { toast } from 'react-toastify';
import { commomObj } from '../../../utils';
import ImportAgumentaion from '../ImportAgumentaion';
import { ToggleRow } from './ToggleRow';
import { SliderRow } from './SliderRow';
import { PreviewPair } from './PreviewPair';


const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const augmentationsConfig = [
    {
        key: "rotation",
        label: "Rotation",
        tooltip: "Rotate image. Use probability to control how often it applies.",
        controls: [
            { stateKey: "rotate_limit", title: "Degree", min: -180, max: 180, step: 1 },
            { stateKey: "rotate_prob", title: "Probability", min: 0, max: 1, step: 0.05 },
        ],
        preview: (s) => (s.rotation ? { transform: `rotate(${s.rotate_limit}deg)` } : {}),
        toPayload: (s) => ({
            rotate_limit: clamp(s.rotate_limit, -180, 180),
            rotate_prob: clamp(s.rotate_prob, 0, 1),
        }),
    },
    {
        key: "crop",
        label: "Crop",
        tooltip: "Random crop ratios (.7, .8, .9, .95). Only probability is configurable.",
        controls: [{ stateKey: "cropProb", title: "Probability", min: 0, max: 1, step: 0.05 }],
        preview: (s) => (s.crop ? { objectFit: "cover", objectPosition: "center", overflow: "hidden" } : {}),
        toPayload: (s) => ({ crop: { p: clamp(s.cropProb, 0, 1) } }),
    },
    {
        key: "verticalFlip",
        label: "Vertical Flip",
        tooltip: "Flip vertically.",
        controls: [{ stateKey: "vertical_flip_prob", title: "Probability", min: 0, max: 1, step: 0.05 }],
        preview: (s) => (s.verticalFlip ? { transform: "scaleY(-1)" } : {}),
        toPayload: (s) => ({ vertical_flip_prob: clamp(s.vertical_flip_prob, 0, 1) }),
    },
    {
        key: "horizontalFlip",
        label: "Horizontal Flip",
        tooltip: "Flip horizontally.",
        controls: [{ stateKey: "horizontal_flip_prob", title: "Probability", min: 0, max: 1, step: 0.05 }],
        preview: (s) => (s.horizontalFlip ? { transform: "scaleX(-1)" } : {}),
        toPayload: (s) => ({ horizontal_flip_prob: clamp(s.horizontal_flip_prob, 0, 1) }),
    },
    {
        key: "brightness",
        label: "Brightness",
        tooltip: "Adjust brightness; backend expects 0–1 limit mapped to (-limit, +limit).",
        controls: [
            { stateKey: "brightness_limit", title: "Value (0–1)", min: 0, max: 1, step: 0.05 },
            { stateKey: "brightness_prob", title: "Probability", min: 0, max: 1, step: 0.05 },
        ],
        preview: (s) => {
            if (!s.brightness) return {};
            const lim = clamp(s.brightness_limit, 0, 1);
            // Map 0..1 to CSS brightness multiplier ~ 0.5..1.5 for perceptual similarity
            const factor = 1 + (lim - 0.5); // lim=0 -> 0.5, lim=0.5 -> 1, lim=1 -> 1.5
            return { filter: `brightness(${factor})` };
        },
        toPayload: (s) => ({
            brightness_limit: [0, clamp(s.brightness_limit, 0, 1)],
            brightness_prob: clamp(s.brightness_prob, 0, 1),
        }),
    },
    {
        key: "contrast",
        label: "Contrast",
        tooltip: "Adjust contrast; backend expects 0–1 limit mapped to (-limit, +limit).",
        controls: [
            { stateKey: "contrast_limit", title: "Value (0–1)", min: 0, max: 1, step: 0.05 },
            { stateKey: "contrast_prob", title: "Probability", min: 0, max: 1, step: 0.05 },
        ],
        preview: (s) => {
            if (!s.contrast) return {};
            const lim = clamp(s.contrast_limit, 0, 1);
            // Map 0..1 to CSS contrast multiplier ~ 0.5..1.5
            const factor = 1 + (lim - 0.5);
            return { filter: `contrast(${factor})` };
        },
        toPayload: (s) => ({
            contrast_limit: [0, clamp(s.contrast_limit, 0, 1)],
            contrast_prob: clamp(s.contrast_prob, 0, 1),
        }),
    },
    {
        key: "stauration",
        label: "Saturation",
        tooltip: "Adjust hue/saturation; backend limit 0–80.",
        controls: [
            { stateKey: "hue_saturation_limit", title: "Value (0–80)", min: 0, max: 80, step: 1 },
            { stateKey: "hue_saturation_prob", title: "Probability", min: 0, max: 1, step: 0.05 },
        ],
        preview: (s) => {
            if (!s.stauration) return {};
            const lim = clamp(s.hue_saturation_limit, 0, 80);
            // Map 0..80 to CSS saturate multiplier ~ 0.5..2.0
            const factor = 0.5 + (lim / 80) * 1.5;
            return { filter: `saturate(${factor})` };
        },
        toPayload: (s) => ({
            hue_saturation_limit: [0, clamp(s.hue_saturation_limit, 0, 80)],
            hue_saturation_prob: clamp(s.hue_saturation_prob, 0, 1),
        }),
    },
    {
        key: "noise",
        label: "Noise",
        tooltip: "Gaussian noise variance limit 10–50; prob in [0,1].",
        controls: [
            { stateKey: "gauss_noise_var_limit", title: "Variance (10–50)", min: 10, max: 50, step: 1 },
            { stateKey: "gauss_noise_prob", title: "Probability", min: 0, max: 1, step: 0.05 },
        ],
        preview: (s) => {
            if (!s.noise) return {};
            // CSS cannot add Gaussian noise directly; approximate with subtle grain look via contrast + brightness jitter
            const v = clamp(s.gauss_noise_var_limit, 10, 50);
            const strength = (v - 10) / 40; // 0..1
            const c = 1 + strength * 0.2;
            const b = 1 - strength * 0.1;
            return { filter: `contrast(${c}) brightness(${b})` };
        },
        toPayload: (s) => ({
            gauss_noise_var_limit: [10, clamp(s.gauss_noise_var_limit, 10, 50)],
            gauss_noise_prob: clamp(s.gauss_noise_prob, 0, 1),
        }),
    },
    {
        key: "blur",
        label: "Blur",
        tooltip: "Backend uses fixed kernels (3,5); only probability is configurable.",
        controls: [{ stateKey: "blur_prob", title: "Probability", min: 0, max: 1, step: 0.05 }],
        preview: (s) => {
            if (!s.blur) return {};
            // Visual hint: light blur so preview reflects effect without kernel control
            return { filter: `blur(2px)` };
        },
        toPayload: (s) => ({ blur_prob: clamp(s.blur_prob, 0, 1) }),
    },
];


const initialState = {
    rotation: false,
    crop: false,
    verticalFlip: false,
    horizontalFlip: false,
    brightness: false,
    contrast: false,
    stauration: false,
    noise: false,
    blur: false,
    rotate_limit: 0,
    rotate_prob: 0,
    vertical_flip_prob: 0,
    horizontal_flip_prob: 0,
    brightness_limit: 5,
    brightness_prob: 0,
    contrast_limit: 5,
    contrast_prob: 0,
    hue_saturation_limit: 5,
    hue_saturation_prob: 0,
    gauss_noise_var_limit: 1,
    gauss_noise_prob: 0,
    blur_limit: 0,
    blur_prob: 0,
    cropX: 0,
    cropY: 0,
    cropXratio: 0.6,
    cropYratio: 0.6,
    num_of_images_to_be_generated: "1",
    cropProb: 0,
    openModal: false,
    onClose: false,
    isDirty: false,
}


function Augumentation({ initial, setIstate, state, userData, onApply, onChange, url }) {
    const { hasChangedSteps } = useSelector((state) => state.steps);
    const DatasetSize = JSON.parse(window.localStorage.getItem("DataSize")) || {}
    const [iState, updateIstate] = useState(initialState)
    const { openModal, onClose, cropProb, cropX, cropY, rotation, crop, verticalFlip, horizontalFlip, brightness, contrast, stauration, noise, blur, rotate_limit, rotate_prob, vertical_flip_prob, horizontal_flip_prob, brightness_limit, brightness_prob, contrast_limit, contrast_prob, hue_saturation_limit, hue_saturation_prob, gauss_noise_var_limit, gauss_noise_prob, blur_limit, blur_prob, num_of_images_to_be_generated, isDirty } = iState
    console.log(iState, "istateeeeee")
    const abortControllerReff = useRef();
    const dispatch = useDispatch()
    const [sampleImageUrl, setSampleImageUrl] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const payload = {
                    username: userData?.activeUser?.userName,
                    version: state?.version,
                    project: state?.name,
                    task: "objectdetection",
                }
                const res = await dispatch(ReturnAgumentation({ payload, url }));
                if (res?.payload?.status === 200) {
                    const augData = res?.payload?.data?.augmentations
                    // updateIstate((prev) => ({
                    //     ...prev,
                    //     rotation: augData?.rotate_limit ? true : false,
                    //     crop: augData?.crop?.xmax ? true : false,
                    //     verticalFlip: augData?.vertical_flip_prob ? true : false,
                    //     horizontalFlip: augData?.horizontal_flip_prob ? true : false,
                    //     brightness: augData?.brightness_limit?.[1] ? true : false,
                    //     contrast: augData?.contrast_limit?.[1] ? true : false,
                    //     stauration: augData?.hue_saturation_limit?.[1] ? true : false,
                    //     noise: augData?.gauss_noise_var_limit?.[1] ? true : false,
                    //     blur: augData?.blur_limit?.[1] ? true : false,
                    //     rotate_limit: augData?.rotate_limit || 0,
                    //     rotate_prob: augData?.rotate_prob || 0,
                    //     vertical_flip_prob: augData?.vertical_flip_prob || 0,
                    //     horizontal_flip_prob: augData?.horizontal_flip_prob || 0,
                    //     brightness_limit: augData?.brightness_limit?.[1] || 5,
                    //     brightness_prob: augData?.brightness_prob || 0,
                    //     contrast_limit: augData?.contrast_limit?.[1] || 5,
                    //     contrast_prob: augData?.contrast_prob || 0,
                    //     hue_saturation_limit: augData?.hue_saturation_limit?.[1] || 5,
                    //     hue_saturation_prob: augData?.hue_saturation_prob || 0,
                    //     gauss_noise_var_limit: augData?.gauss_noise_var_limit?.[1] || 0,
                    //     gauss_noise_prob: augData?.gauss_noise_prob || 0,
                    //     blur_limit: augData?.blur_limit?.[1] || 0,
                    //     blur_prob: augData?.blur_prob || 0,
                    //     cropX: augData?.crop?.xmax || 0,
                    //     cropY: augData?.crop?.ymax || 0,
                    //     num_of_images_to_be_generated: augData?.num_of_images_to_be_generated || "1",
                    //     cropProb: augData?.crop?.p || 0,
                    //     isDirty: true,
                    // }))

                    const asUpper = (v, fallback = 0) => Array.isArray(v) ? (v[1] ?? fallback) : (v ?? fallback);

                    updateIstate((prev) => ({
                        ...prev,
                        rotation: !!augData?.rotate_limit,
                        crop: !!augData?.crop?.p,
                        verticalFlip: !!augData?.vertical_flip_prob,
                        horizontalFlip: !!augData?.horizontal_flip_prob,
                        brightness: asUpper(augData?.brightness_limit, 0) > 0,
                        contrast: asUpper(augData?.contrast_limit, 0) > 0,
                        stauration: asUpper(augData?.hue_saturation_limit, 0) > 0,
                        noise: asUpper(augData?.gauss_noise_var_limit, 10) >= 10,
                        blur: !!augData?.blur_prob,
                        rotate_limit: augData?.rotate_limit ?? 0,
                        rotate_prob: augData?.rotate_prob ?? 0,
                        vertical_flip_prob: augData?.vertical_flip_prob ?? 0,
                        horizontal_flip_prob: augData?.horizontal_flip_prob ?? 0,
                        brightness_limit: clamp(asUpper(augData?.brightness_limit, 0.3), 0, 1),
                        brightness_prob: clamp(augData?.brightness_prob ?? 0, 0, 1),
                        contrast_limit: clamp(asUpper(augData?.contrast_limit, 0.3), 0, 1),
                        contrast_prob: clamp(augData?.contrast_prob ?? 0, 0, 1),
                        hue_saturation_limit: clamp(asUpper(augData?.hue_saturation_limit, 20), 0, 80),
                        hue_saturation_prob: clamp(augData?.hue_saturation_prob ?? 0, 0, 1),
                        gauss_noise_var_limit: clamp(asUpper(augData?.gauss_noise_var_limit, 10), 10, 50),
                        gauss_noise_prob: clamp(augData?.gauss_noise_prob ?? 0, 0, 1),
                        blur_prob: clamp(augData?.blur_prob ?? 0, 0, 1),
                        cropProb: clamp(augData?.crop?.p ?? 0, 0, 1),
                        isDirty: true,
                    }));

                }
            } catch (err) {
                toast.error("Oops! Something went wrong", commomObj)
            }
        }
        fetchData();
    }, [])

    useEffect(() => {
        const fetchSampleImage = async () => {
            try {
                const params = new URLSearchParams({
                    username: userData?.activeUser?.userName,
                    task: "objectdetection",
                    project: state?.name,
                    version: state?.version
                });
                const response = await fetch(`${url}return_sample_for_aug?${params.toString()}`);
                if (response.ok) {
                    const blob = await response.blob();
                    setSampleImageUrl(URL.createObjectURL(blob));
                }
            } catch (err) {
                console.error("Failed to fetch sample image", err);
            }
        };
        fetchSampleImage();
    }, [userData, state]);

    const sanitizePayload = (a) => {
        const out = { ...a };
        if (typeof out.rotate_limit === 'number') out.rotate_limit = clamp(out.rotate_limit, -180, 180);
        if (typeof out.rotate_prob === 'number') out.rotate_prob = clamp(out.rotate_prob, 0, 1);

        if (out.brightness_limit) out.brightness_limit = [0, clamp(out.brightness_limit[1] ?? 0, 0, 1)];
        if (typeof out.brightness_prob === 'number') out.brightness_prob = clamp(out.brightness_prob, 0, 1);

        if (out.contrast_limit) out.contrast_limit = [0, clamp(out.contrast_limit[1] ?? 0, 0, 1)];
        if (typeof out.contrast_prob === 'number') out.contrast_prob = clamp(out.contrast_prob, 0, 1);

        if (out.hue_saturation_limit) out.hue_saturation_limit = [0, clamp(out.hue_saturation_limit[1] ?? 0, 0, 80)];
        if (typeof out.hue_saturation_prob === 'number') out.hue_saturation_prob = clamp(out.hue_saturation_prob, 0, 1);

        if (out.gauss_noise_var_limit) out.gauss_noise_var_limit = [10, clamp(out.gauss_noise_var_limit[1] ?? 10, 10, 50)];
        if (typeof out.gauss_noise_prob === 'number') out.gauss_noise_prob = clamp(out.gauss_noise_prob, 0, 1);

        if (typeof out.blur_prob === 'number') out.blur_prob = clamp(out.blur_prob, 0, 1);

        if (out.crop?.p !== undefined) out.crop.p = clamp(out.crop.p, 0, 1);

        if (typeof out.vertical_flip_prob === 'number') out.vertical_flip_prob = clamp(out.vertical_flip_prob, 0, 1);
        if (typeof out.horizontal_flip_prob === 'number') out.horizontal_flip_prob = clamp(out.horizontal_flip_prob, 0, 1);

        return out;
    };

    const buildAugPayload = (state) => {
        const merged = augmentationsConfig.reduce((acc, aug) => ({ ...acc, ...aug.toPayload(state) }), {});
        return { augmentations: sanitizePayload(merged) };
    };


    const checkHandler = (e) => {
        const { name, checked, value } = e.target;
        updateIstate({ ...iState, [name]: name === "num_of_images_to_be_generated" ? value : checked, isDirty: true })
    }

    const inputHandler = (value, name) => {
        updateIstate({ ...iState, [name]: value, isDirty: true })
    }

    const saveHandler = async () => {
        // console.log('save handler called,isDirty:', isDirty, 'hasChangedSteps:', hasChangedSteps);
        // if (!isDirty || hasChangedSteps?.augumented == false) {
        //     window.localStorage.setItem("AgumentedSize", (DatasetSize?.Size) * num_of_images_to_be_generated)
        //     onApply()
        //     return;
        // }
        if (!num_of_images_to_be_generated) {
            toast.error("Please Selelct The no. of Images to be generated", commomObj)
        }
        else {
            try {
                abortControllerReff.current = new AbortController();
                updateIstate({ ...iState, openModal: true })
              

                const augmentations = buildAugPayload(iState);
                const jsonString = JSON.stringify(augmentations);
                const formData = new FormData();
                formData.append("json_data", jsonString);



                formData.append("username", userData?.activeUser?.userName);
                formData.append("version", state?.version)
                formData.append("project", state?.name);
                formData.append("task", "objectdetection");
                formData.append("json_data", jsonString);
                formData.append("num_of_images_to_be_generated", num_of_images_to_be_generated);

                // for (let pair of formData.entries()) {
                //     console.log(`${pair[0]}:`, pair[1]);
                // }

                const response = await dispatch(AugumentedData({ payload: formData, signal: abortControllerReff.current.signal, url }))
                console.log(response, "augmentations response")
                if (response?.payload?.code === 201) {
                    updateIstate({ ...iState, openModal: false })
                    toast.success(response?.payload?.message, commomObj)
                    window.localStorage.setItem("AgumentedSize", (DatasetSize?.Size) * num_of_images_to_be_generated)
                    onChange();
                    onApply()
                } else {
                    toast.error(response?.payload?.message, commomObj)
                    updateIstate({ ...iState, openModal: true, onClose: true })
                }
            } catch (error) {
                if (error.name === 'AbortError') {
                    updateIstate({ ...iState, openModal: true, onClose: false })
                } else {
                    console.error("Error uploading file:", error);
                    toast.error("Something went Wrong", commomObj)
                    updateIstate({ ...iState, openModal: true, onClose: true })
                }
            }
        }
    }

    const resetHandler = () => {
        updateIstate(initialState)
    }
    const handleCancel = () => {
        if (abortControllerReff?.current) {
            abortControllerReff?.current?.abort();
            console.log('agumentation operation aborted');
        }
    };
    return (
        <>
            <div className="Small-Wrapper">
                <h6 className="Remarks">Add Augmentations</h6>
                <h6>Note-</h6>
                <p>*Apply augmentations to increase dataset size and improve accuracy. Minimum generated images should be around 500 to get decent results.</p>
                <div className="CommonForm">
                    <form>
                        <fieldset disabled="">
                            <div className="form-group">
                                <label>
                                    Size of Data Set{" "}
                                    <span
                                        className="EsclamSpan"
                                        data-toggle="tooltip"
                                        title="Total uploaded images"
                                    >
                                        <img src={require("../../../assets/images/esclamination.png")} />
                                    </span>
                                </label>
                                <input type="text" className="form-control" value={DatasetSize?.Size || 0} disabled={true} />
                            </div>
                        </fieldset>
                        <div className="form-group">
                            <label>
                                Enter the Multiplier for no. of Images to be Generated:{" "}
                                <span
                                    className="EsclamSpan"
                                    data-toggle="tooltip"
                                    title="desired dataset size after augmentation"
                                >
                                    <img src={require("../../../assets/images/esclamination.png")} />
                                </span>
                            </label>
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Enter no. of Images to be Generated"
                                name='num_of_images_to_be_generated'
                                value={num_of_images_to_be_generated}
                                onWheel={(e) => e.target.blur()}
                                onChange={checkHandler}
                            />
                        </div>
                        <h6 className="Remarks">Select the Augmentations</h6>
                        {augmentationsConfig.map((aug) => (
                            <div className="AugmentationsBox" key={aug.key}>
                                <ToggleRow
                                    label={aug.label}
                                    name={aug.key}
                                    checked={iState[aug.key]}
                                    onChange={checkHandler}
                                    tooltip={aug.tooltip}
                                />
                                {aug.controls.map((ctrl) => (
                                    <SliderRow
                                        key={ctrl.stateKey}
                                        title={ctrl.title}
                                        min={ctrl.min}
                                        max={ctrl.max}
                                        step={ctrl.step}
                                        value={iState[ctrl.stateKey]}
                                        onChange={(val) => inputHandler(val, ctrl.stateKey)}
                                    />
                                ))}
                                <PreviewPair src={sampleImageUrl} styleRight={aug.preview(iState)} />
                            </div>
                        ))}

                    </form>
                    <div className="row">
                        <div className="col-lg-7 mx-auto">
                            <div className="TwoButtons">
                                <a className="OutlineBtn" role='button' onClick={handleCancel}>
                                    Cancel
                                </a>
                                <a role="button" onClick={resetHandler} className="ResetBtn">
                                    Reset
                                </a>
                                <a role='button' className="FillBtn" onClick={saveHandler}>
                                    Apply
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <ImportAgumentaion
                    onOpen={openModal}
                    onClose={onClose}
                    istate={iState}
                    setIstate={updateIstate}
                    handleCancel={handleCancel} />

            </div>

        </>
    )
}

export default Augumentation
