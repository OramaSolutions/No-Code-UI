import React, { useEffect, useState } from 'react'
import Loader from '../../commonComponent/Loader'
import Modal from 'react-bootstrap/Modal';
import { Url2 } from '../../config/config';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


function InferResultModal({ onOpen, output, setOutput, state, userData, selectedFile, setSelectedFile, url, resultImage, onApply, onChange }) {
    const navigate = useNavigate();
    const [imageData, setImageData] = useState("");
    const [loading, setLoading] = useState(null);

    useEffect(() => {
        // If resultImage is provided, use it directly
        if (onOpen && resultImage) {
            setImageData(resultImage);
            setLoading(false);
            return;
        }
        // Fallback to old logic if resultImage is not provided
        if (onOpen && selectedFile && !resultImage) {
            const fetchImageData = async () => {
                try {
                    setLoading(true);
                    const timestamp = new Date().getTime();
                    const inferUrl = `${url}infer_yolov8?username=${userData?.activeUser?.userName}&task=objectdetection&project=${state?.name}&version=${state?.version}&timestamp=${timestamp}`;
                    const response = await axios.get(inferUrl, {
                        responseType: 'blob',
                    });
                    const imageBlob = response.data;
                    const imageUrl = URL.createObjectURL(imageBlob);
                    setImageData(imageUrl);
                    setLoading(false);
                } catch (error) {
                    console.error("Error fetching image data", error);
                    setLoading(null);
                }
            };
            fetchImageData();
        }
    }, [onOpen, selectedFile, resultImage, url, userData, state]);

    const remarkHandler = () => {
        console.log('remarkHandler called');
        onChange()
        onApply()
    }
    const closeHandler = () => {
        setOutput((prev) => ({ ...prev, onOpen: !onOpen }));
        setSelectedFile(null);
        setImageData("");
        setLoading(null);
    };

    return (
        <>
            <Modal
                show={onOpen}
                className="ModalBox ModalWidth75"
            >
                <Modal.Body >
                    <div className="Category" >
                        <>
                            <div className="ProjectAlreadyArea" style={{ height: "auto" }}>
                                <h5>Result Image</h5>
                                {!loading ?
                                    <figure>
                                        {imageData && <img src={imageData} height={550} alt="Inference Result" />}
                                    </figure>
                                    : <Loader
                                        className="text-align-end"
                                        item={"440px"}
                                        style={{
                                            textAlign: "justify !important"
                                        }}
                                    />}
                                <div className="col-lg-5 mx-auto">
                                    <div className="flex gap-2 flex-row justify-between max-w-64">
                                        <a role="button" className="    " onClick={() => closeHandler()}>
                                            Infer More Images
                                        </a>
                                        <a role="button" className="" onClick={remarkHandler}>
                                            Continue & Add Remark
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default InferResultModal
