import React, { useEffect, useState } from 'react'
import Loader from '../../commonComponent/Loader'
import Modal from 'react-bootstrap/Modal';
import { Url2 } from '../../config/config';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function InferResultModal({ onOpen, output, setOutput, state, userData, selectedFile, setSelectedFile }) {
    const navigate=useNavigate();
    const [imageData, setImageData] = useState("")
    const [loading, setLoading] = useState(null);
  
    useEffect(() => {
        if (onOpen && selectedFile) {
            const fetchImageData = async () => {
                if (onOpen && selectedFile) {
                    try {
                        setLoading(true);
                        const timestamp = new Date().getTime();                      
                        const url = `${Url2}infer_yolov8?username=${userData?.activeUser?.name}&task=object_detection&project=${state?.name}&version=${state?.version}&timestamp=${timestamp}`;                       
                        const response = await axios.get(url);                                       
                        setImageData(url);
                        setLoading(false);
                    } catch (error) {
                        console.error("Error fetching image data", error);
                        setLoading(null);
                    }
                }
            };

            fetchImageData();
        }
    }, [onOpen, selectedFile]);

    const closeHandler = () => {
        setOutput((prev) => ({ ...prev, onOpen: !onOpen}))
        setSelectedFile(null)
        setImageData("")
        setLoading(null)
    }
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
                                        <img src={imageData} height={550} />
                                    </figure>
                                    : <Loader
                                    className="text-align-end"
                                    item={"440px"} 
                                    style={{
                                        textAlign: "justify !important"
                                    }}
                                    />}
                                <div className="col-lg-5 mx-auto">
                                    <div className="TwoButtons">
                                        <a role="button" className="OutlineBtn" onClick={() => closeHandler()}>
                                            Continue
                                        </a>
                                        <a role='button' className="FillBtn" onClick={()=>navigate("")}>
                                            Remark
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </>
                    </div>
                </Modal.Body>
            </Modal>

        </>

    )
}

export default InferResultModal
