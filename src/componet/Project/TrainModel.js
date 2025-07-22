import React, { useState } from 'react'
import Modal from 'react-bootstrap/Modal';
import DataTransferModal from './DataTransferModal';
import { useDispatch, useSelector } from 'react-redux';
import { DataTransfer } from '../../reduxToolkit/Slices/projectSlices';

import DefectTrainModal from '../DefectDetection/DefectTrainModal';
import DefectVisualize from '../DefectDetection/DefectVisualize';
import { getUrl } from '../../config/config';
const initialstate = {
    opentrainModal: false,
    opentraincomplete: false,
    opendefectTraining: false,
    isTrainDataLoaded: false,
    openVisualize: false,
    defectTrainData: {}
}


function TrainModel({ initialData, setState, onApply, userData, state, task, apiPoint }) {
    const [istate, updateIstate] = useState(initialstate)
    const { opentrainModal, opentraincomplete, opendefectTraining, isTrainDataLoaded, openVisualize, defectTrainData } = istate;
    const [output, setOutput] = useState("")
    const [flag, setFlag] = useState(false)
    console.log(task)
    const url = getUrl(task)
    const handleOpen = async () => {
        try {
            updateIstate({ ...istate, opentrainModal: true })
            handleclose();
            const response = await fetch(`${url}${apiPoint}?username=${userData?.activeUser?.name}&task=${task}&project=${state?.name}&version=${state?.version}`, {
                method: 'GET',
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');

            if (response.ok) {
                console.log("fetch called")
                setTimeout(() => {
                    setFlag(prev => !prev);
                    console.log("Timeout: Flag is set to true");
                }, 5000);
            }

            let result;
            while (!(result = await reader.read()).done) {
                const chunk = decoder.decode(result.value, { stream: true });
                setOutput(prevOup => prevOup + chunk)
            }
            // console.log('checked stream complete one closes')
            updateIstate({ ...istate, opentraincomplete: true, opentrainModal: true, })
        } catch (error) {
            console.error('Error fetching stream:', error);
        }
    };

    const handleclose = () => {
        console.log('ran handle close in train modal')
        setState({ ...initialData, openModal: false })
    }
    const handleDefect = () => {
        updateIstate({ ...istate, opendefectTraining: true })
        handleclose();
    }

    return (
        <>
            <Modal
                show={initialData.openModal}
                className="ModalBox"
                onHide={handleclose}
            >
                <Modal.Body>
                    <div className="Category">
                        <a className="CloseModal"
                            onClick={handleclose}
                        >
                            ×
                        </a>
                        <div className="ProjectAlreadyArea">
                            <h5>Train Model</h5>
                            <div className="MachineBox">
                                <figure>
                                    <img src={require("../../assets/images/machine-img.png")} />
                                </figure>
                            </div>
                        </div>
                        <a className="Button FolderPermissionId" onClick={task == "defect-detection" ? handleDefect : handleOpen}>Train Model</a>
                    </div>

                </Modal.Body>
            </Modal>

            <DataTransferModal
                data={istate}
                setData={updateIstate}
                apiresponse={output}
                setResponse={setOutput}
                flag={flag}
                setFlag={setFlag}
                onApply={onApply}
                userData={userData}
                state={state}
                task={task}
            />
            {opendefectTraining && <DefectTrainModal
                data={istate}
                setData={updateIstate}
                onApply={onApply}
                userData={userData}
                state={state}
                task={task}
                model={initialData.model}
            />}
            {openVisualize && <DefectVisualize
                data={istate}
                setData={updateIstate}
                onApply={onApply}
                userData={userData}
                state={state}
                task={task}
                model={initialData.model}
            />}
        </>
    )
}

export default TrainModel
