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
const augmentationsConfig = [
    {
        key: "rotation",
        label: "Rotation",
        tooltip: "Rotate the image by degrees. Helpful if object orientation keeps changing",
        controls: [
            { stateKey: "rotate_limit", title: "Degree", min: 0, max: 45, step: 1 },
            { stateKey: "rotate_prob", title: "Probability", min: 0, max: 1, step: 0.1 },
        ],
        preview: (s) => ({ transform: s.rotation ? `rotate(${s.rotate_limit}deg)` : "" }),
        toPayload: (s) => ({
            rotate_limit: s.rotate_limit,
            rotate_prob: s.rotate_prob,
        }),
    },
    {
        key: "crop",
        label: "Crop",
        tooltip: "Zoom the image; apply if object distance keeps changing",
        controls: [
            { stateKey: "cropProb", title: "Probability", min: 0, max: 1, step: 0.1 },
            // you can re-enable X/Y/ratio sliders here if needed
        ],
        preview: (s) =>
            s.crop
                ? { width: s.cropX, height: s.cropY, objectFit: "cover", objectPosition: "center", overflow: "hidden" }
                : {},
        toPayload: (s) => ({ crop: { p: s.cropProb /* add coords/ratios if needed */ } }),
    },
    {
        key: "verticalFlip",
        label: "Vertical Flip",
        tooltip: "Mirrors the image on vertical axis",
        controls: [{ stateKey: "vertical_flip_prob", title: "Probability", min: 0, max: 1, step: 0.1 }],
        preview: (s) => ({ transform: s.verticalFlip ? "scaleY(-1)" : "" }),
        toPayload: (s) => ({ vertical_flip_prob: s.vertical_flip_prob }),
    },
    {
        key: "horizontalFlip",
        label: "Horizontal Flip",
        tooltip: "Mirrors the image on horizontal axis",
        controls: [{ stateKey: "horizontal_flip_prob", title: "Probability", min: 0, max: 1, step: 0.1 }],
        preview: (s) => ({ transform: s.horizontalFlip ? "scaleX(-1)" : "" }),
        toPayload: (s) => ({ horizontal_flip_prob: s.horizontal_flip_prob }),
    },
    {
        key: "brightness",
        label: "Brightness",
        tooltip: "Brighten/darken image; helpful if lighting changes",
        controls: [
            { stateKey: "brightness_limit", title: "Value", min: 0, max: 10, step: 0.1 },
            { stateKey: "brightness_prob", title: "Probability", min: 0, max: 1, step: 0.1 },
        ],
        preview: (s) => (s.brightness ? { filter: `brightness(${s.brightness_limit * 20}%)` } : {}),
        toPayload: (s) => ({ brightness_limit: [0, s.brightness_limit], brightness_prob: s.brightness_prob }),
    },
    {
        key: "contrast",
        label: "Contrast",
        tooltip: "Increase contrast when lighting varies",
        controls: [
            { stateKey: "contrast_limit", title: "Value", min: 0, max: 10, step: 0.1 },
            { stateKey: "contrast_prob", title: "Probability", min: 0, max: 1, step: 0.1 },
        ],
        preview: (s) => (s.contrast ? { filter: `contrast(${s.contrast_limit * 20}%)` } : {}),
        toPayload: (s) => ({ contrast_limit: [0, s.contrast_limit], contrast_prob: s.contrast_prob }),
    },
    {
        key: "stauration",
        label: "Saturation",
        tooltip: "Change saturation; helpful if color changes",
        controls: [
            { stateKey: "hue_saturation_limit", title: "Value", min: 0, max: 10, step: 0.1 },
            { stateKey: "hue_saturation_prob", title: "Probability", min: 0, max: 1, step: 0.1 },
        ],
        preview: (s) => (s.stauration ? { filter: `saturate(${s.hue_saturation_limit})` } : {}),
        toPayload: (s) => ({
            hue_saturation_limit: [0, s.hue_saturation_limit],
            hue_saturation_prob: s.hue_saturation_prob,
        }),
    },
    {
        key: "noise",
        label: "Noise",
        tooltip: "Add noise; useful for outdoor/noisy scenes",
        controls: [
            { stateKey: "gauss_noise_var_limit", title: "Pixel", min: 0, max: 5, step: 0.1 },
            { stateKey: "gauss_noise_prob", title: "Probability", min: 0, max: 1, step: 0.1 },
        ],
        preview: (s) =>
            s.noise ? { filter: `contrast(${s.gauss_noise_var_limit}) brightness(${1 / s.gauss_noise_var_limit})` } : {},
        toPayload: (s) => ({
            gauss_noise_var_limit: [0, s.gauss_noise_var_limit],
            gauss_noise_prob: s.gauss_noise_prob,
        }),
    },
    {
        key: "blur",
        label: "Blur",
        tooltip: "Blur the image for motion/high speed",
        controls: [
            { stateKey: "blur_limit", title: "Pixel", min: 0, max: 5, step: 1 },
            { stateKey: "blur_prob", title: "Probability", min: 0, max: 1, step: 0.1 },
        ],
        preview: (s) => (s.blur ? { filter: `blur(${s.blur_limit}px)` } : {}),
        toPayload: (s) => ({
            // if backend expects array for limit, change to [0, s.blur_limit]
            blur_limit: s.blur_limit,
            blur_prob: s.blur_prob,
        }),
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
                    updateIstate((prev) => ({
                        ...prev,
                        rotation: augData?.rotate_limit ? true : false,
                        crop: augData?.crop?.xmax ? true : false,
                        verticalFlip: augData?.vertical_flip_prob ? true : false,
                        horizontalFlip: augData?.horizontal_flip_prob ? true : false,
                        brightness: augData?.brightness_limit?.[1] ? true : false,
                        contrast: augData?.contrast_limit?.[1] ? true : false,
                        stauration: augData?.hue_saturation_limit?.[1] ? true : false,
                        noise: augData?.gauss_noise_var_limit?.[1] ? true : false,
                        blur: augData?.blur_limit?.[1] ? true : false,
                        rotate_limit: augData?.rotate_limit || 0,
                        rotate_prob: augData?.rotate_prob || 0,
                        vertical_flip_prob: augData?.vertical_flip_prob || 0,
                        horizontal_flip_prob: augData?.horizontal_flip_prob || 0,
                        brightness_limit: augData?.brightness_limit?.[1] || 5,
                        brightness_prob: augData?.brightness_prob || 0,
                        contrast_limit: augData?.contrast_limit?.[1] || 5,
                        contrast_prob: augData?.contrast_prob || 0,
                        hue_saturation_limit: augData?.hue_saturation_limit?.[1] || 5,
                        hue_saturation_prob: augData?.hue_saturation_prob || 0,
                        gauss_noise_var_limit: augData?.gauss_noise_var_limit?.[1] || 0,
                        gauss_noise_prob: augData?.gauss_noise_prob || 0,
                        blur_limit: augData?.blur_limit?.[1] || 0,
                        blur_prob: augData?.blur_prob || 0,
                        cropX: augData?.crop?.xmax || 0,
                        cropY: augData?.crop?.ymax || 0,
                        num_of_images_to_be_generated: augData?.num_of_images_to_be_generated || "1",
                        cropProb: augData?.crop?.p || 0,
                        isDirty: true,
                    }))
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
                const response = await fetch(`${url}/return_sample_for_aug?${params.toString()}`);
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

    const buildAugPayload = (state) => {
        const merged = augmentationsConfig.reduce((acc, aug) => {
            return { ...acc, ...aug.toPayload(state) };
        }, {});
        return { augmentations: merged };
    };

    const checkHandler = (e) => {
        const { name, checked, value } = e.target;
        if (name == "num_of_images_to_be_generated") {
            updateIstate({ ...iState, [name]: value, isDirty: false })
        } else {
            updateIstate({ ...iState, [name]: checked, isDirty: false })
        }
    }

    const inputHandler = (value, name) => {
        updateIstate({ ...iState, [name]: value, isDirty: false })
    }

    const saveHandler = async () => {
        if (isDirty || hasChangedSteps?.augumented == false) {
            window.localStorage.setItem("AgumentedSize", (DatasetSize?.Size) * num_of_images_to_be_generated)
            onApply()
            return;
        }
        if (!num_of_images_to_be_generated) {
            toast.error("Please Selelct The no. of Images to be generated", commomObj)
        }
        else {
            try {
                abortControllerReff.current = new AbortController();
                updateIstate({ ...iState, openModal: true })
                // const augmentations = {
                //     augmentations: {
                //         rotate_limit,
                //         rotate_prob,
                //         vertical_flip_prob,
                //         horizontal_flip_prob,
                //         brightness_limit: [0, brightness_limit],
                //         brightness_prob,
                //         contrast_limit: [0, contrast_limit],
                //         contrast_prob,
                //         hue_saturation_limit: [0, hue_saturation_limit],
                //         hue_saturation_prob,
                //         gauss_noise_var_limit: [0, gauss_noise_var_limit],
                //         gauss_noise_prob,
                //         // blur_limit: [0, blur_limit],
                //         blur_prob,

                //         crop: {
                //             p: cropProb,
                //             // xmin: 0,
                //             // ymin: 0,
                //             // xmax: cropX,
                //             // ymax: cropY,
                //             // cropXratio: iState.cropXratio,
                //             // cropYratio: iState.cropYratio,
                //         }

                //     }
                // }

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
