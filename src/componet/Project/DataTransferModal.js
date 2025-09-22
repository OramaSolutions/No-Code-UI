import React, { useEffect, useState, useRef } from 'react'
import Modal from 'react-bootstrap/Modal';
import { DataTransfer, StopDataTransfer, TrainingbatchApi } from '../../reduxToolkit/Slices/projectSlices';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../../commonComponent/Loader';
import { getUrl } from '../../config/config';
import axios from 'axios';
import { toast } from 'react-toastify';
import { commomObj } from '../../utils';
import TrainingCompleted from './TrainingCompleted';
import Papa from "papaparse";
import { ClassStopDataTransfer } from '../../reduxToolkit/Slices/classificationSlices';



const initialstate = {
    openImage: false,
    trainingImage: "No image",
}

function DataTransferModal({url, data, setData, apiresponse, setResponse, flag, setFlag, onApply, state, userData, task }) {
    const outputRef = useRef(null); 
    const rowsRef = useRef(null);
    const [dots, setDots] = useState('');
    const dispatch = useDispatch()
    const [rows, setRows] = useState([]);
    const [istate, updateIstate] = useState(initialstate)
    const { openImage, trainingImage } = istate;
    const [showButtons, setShowButtons] = useState(false)
    const [showTerminal, setShowTerminal] = useState(false)
    const [status, setStatus] = useState({
        loadingImage: false,
        loadingMatrix: false,
        errorImage: '',
        errorMatrix: ''
    })

    useEffect(() => {
        const blink = () => {
            setDots((prevDots) => (prevDots.length < 3 ? prevDots + '.' : ''));
        };
        const interval = setInterval(blink, 500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        console.log('data', data)
        console.log('flag', flag)
    }, [data])

    const handleclose = () => {
        console.log('ran handle close')
        setData({ ...data, opentrainModal: false })
        setResponse("")
        setFlag(false)
    }
    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [apiresponse]);

    useEffect(() => {

        const fetchdata = async () => {
            try {
                let apiendpoint = task === "classification" ? "val_matrix_cls" : "val_matrix";
                const response = await fetch(`${url}${apiendpoint}?username=${userData?.activeUser?.userName}&task=${task}&project=${state?.name}&version=${state?.version}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder('utf-8');
                let buffer = '';

                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    let lines = buffer.split('\n');

                    // Hold back the last partial line for the next chunk
                    buffer = lines.pop();

                    for (let line of lines) {
                        if (line.trim() === '') continue;

                        try {
                            const parsed = JSON.parse(line);
                            console.log('parsed data', parsed)
                            if (task === "objectdetection") {
                                const parsedRow = {
                                    className: parsed.class_name || "Class < >",
                                    precision: (parseFloat(parsed.Precision) * 100).toFixed(2),
                                    recall: (parseFloat(parsed.Recall) * 100).toFixed(2),
                                    accuracy: (parseFloat(parsed.F1) * 100).toFixed(2),
                                };
                                setRows(prev => [...prev, parsedRow]);
                            } else if (task === "classification") {
                                const parsedRow = {
                                    epoch: parsed.epoch,
                                    top1: (parseFloat(parsed.top1) * 100).toFixed(2),
                                    top5: (parseFloat(parsed.top5) * 100).toFixed(2),
                                };
                                console.log('parsedRow', parsedRow)
                                setRows(prev => [...prev, parsedRow]);
                            }
                        } catch (err) {
                            console.error("Invalid JSON line in NDJSON stream", err);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching validation matrix:", error);
            }
        };


        if (flag) {
            // fetchdata();
            // fetchImage();
            setShowButtons(true)
        }
    }, [flag])

    // const fetchdata = async () => {
    //     try {
    //         let apiendpoint = task === "classification" ? "val_matrix_cls" : "val_matrix";
    //         const response = await fetch(`${Url2}${apiendpoint}?username=${userData?.activeUser?.userName}&task=${task}&project=${state?.name}&version=${state?.version}`);

    //         if (!response.ok) {
    //             throw new Error(`HTTP error! status: ${response.status}`);
    //         }

    //         const reader = response.body.getReader();
    //         const decoder = new TextDecoder('utf-8');
    //         let buffer = '';

    //         while (true) {
    //             const { value, done } = await reader.read();
    //             if (done) break;

    //             buffer += decoder.decode(value, { stream: true });
    //             let lines = buffer.split('\n');

    //             // Hold back the last partial line for the next chunk
    //             buffer = lines.pop();

    //             for (let line of lines) {
    //                 if (line.trim() === '') continue;

    //                 try {
    //                     const parsed = JSON.parse(line);
    //                     console.log('parsed data', parsed)
    //                     if (task === "objectdetection") {
    //                         const parsedRow = {
    //                             className: parsed.class_name || "Class < >",
    //                             precision: (parseFloat(parsed.Precision) * 100).toFixed(2),
    //                             recall: (parseFloat(parsed.Recall) * 100).toFixed(2),
    //                             accuracy: (parseFloat(parsed.F1) * 100).toFixed(2),
    //                         };
    //                         setRows(prev => [...prev, parsedRow]);
    //                     } else if (task === "classification") {

    //                         const parsedRow = {
    //                             Class: parsed.Class,
    //                             Accuracy: (parseFloat(parsed.Accuracy)),

    //                         };
    //                         console.log('parsedRow', parsedRow)
    //                         setRows(prev => [...prev, parsedRow]);
    //                     }
    //                 } catch (err) {
    //                     console.error("Invalid JSON line in NDJSON stream", err);
    //                 }
    //             }
    //         }
    //     } catch (error) {
    //         console.error("Error fetching validation matrix:", error);
    //     }
    // };

    const fetchData = async () => {
        setStatus(prev => ({ ...prev, loadingMatrix: true, errorMatrix: '' }));
        try {
            let apiendpoint = task === "classification" ? "val_matrix_cls" : "val_matrix";
            const response = await fetch(`${url}${apiendpoint}?username=${userData?.activeUser?.userName}&task=${task}&project=${state?.name}&version=${state?.version}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (task === "classification") {
                if (data.per_class_accuracy && Array.isArray(data.per_class_accuracy)) {
                    const parsedRows = data.per_class_accuracy.map(line => {
                        // Example: "Class: hf | Accuracy: 100.00% | Total: 3 | Correct: 3"
                        const classMatch = line.match(/Class:\s*([^\|]+)/);
                        const accuracyMatch = line.match(/Accuracy:\s*([\d.]+)%/);
                        return {
                            Class: classMatch ? classMatch[1].trim() : '',
                            Accuracy: accuracyMatch ? parseFloat(accuracyMatch[1]) : 0,
                        };
                    });
                    setRows(parsedRows);
                } else {
                    setRows([]);
                }
            } else if (task === "objectdetection") {
                if (data.matrix && typeof data.matrix === 'object') {
                    const parsedRows = Object.entries(data.matrix).map(([className, metrics]) => ({
                        className,
                        precision: metrics.P ? (parseFloat(metrics.P) * 100).toFixed(2) : '',
                        recall: metrics.R ? (parseFloat(metrics.R) * 100).toFixed(2) : '',
                        accuracy: metrics.Acc !== undefined ? (parseFloat(metrics.Acc)).toFixed(2) : '',
                    }));
                    setRows(parsedRows);
                } else {
                    setRows([]);
                }
            } else {
                setRows([]);
            }
            setStatus(prev => ({ ...prev, loadingMatrix: false }));
        } catch (error) {
            setStatus(prev => ({ ...prev, loadingMatrix: false, errorMatrix: error.message || 'Error fetching validation matrix, try again after a few seconds' }));
            console.error("Error parsing validation matrix:", error);
        }
    }

    // Move fetchImage outside useEffect so it can be called from button
    const fetchImage = async () => {
        setStatus(prev => ({ ...prev, loadingImage: true, errorImage: '' }));
        try {
            const payload = {
                username: userData?.activeUser?.userName,
                version: state?.version,
                project: state?.name,
                task: task,
            }
            const response = await dispatch(TrainingbatchApi({
                payload, url
            }))
            if (response?.payload?.image_base64 || response?.payload?.image) {
                updateIstate({ ...istate, trainingImage: response?.payload?.image  })
            } else {
                updateIstate({ ...istate, trainingImage: "No image" })
            }
            setStatus(prev => ({ ...prev, loadingImage: false }));
        } catch (error) {
            setStatus(prev => ({ ...prev, loadingImage: false, errorImage: error.message || 'Error fetching image, try again after a few seconds.' }));
        }
    }

    useEffect(() => {
        if (rowsRef.current) {
            rowsRef.current.scrollTop = rowsRef.current.scrollHeight;
        }
    }, [rows]);

    const stopHandler = async () => {
        try {
            const formData = new FormData();
            formData.append("username", userData?.activeUser?.userName);
            formData.append("version", state?.version);
            formData.append("project", state?.name);
            formData.append("task", task);
            const res = task == "objectdetection" ? await dispatch(StopDataTransfer({ payload: formData, url })) :
                await dispatch(ClassStopDataTransfer({ payload: formData, url }))
            console.log(res, "response of StopDataTransfer")
            if (res?.payload?.status === 200) {
                handleclose()
                updateIstate(initialstate)
                toast.success(res?.payload?.data, commomObj)
                onApply();
            }
        } catch (err) {
            console.log(err, "error")
        }
    }

    const openImageModal = (base64Image) => {
        const newWindow = window.open();
        if (newWindow) {
            newWindow.document.write(`
                <img src="data:image/png;base64,${base64Image}" style="max-width:100%; height:auto;" alt="Training Image" />
            `);
            newWindow.document.title = "Training Image";
        }
    };

    const handleProceed = () => {
        console.log('ran handle proceeed')
        setData({ ...data, opentraincomplete: false, opentrainModal: false });
        setResponse("");
        setFlag(false);
        onApply();
    };

    return (
        <>
            <Modal
                show={data.opentrainModal}
                className="ModalBox LargeModal"
            >
                <Modal.Body>

                    <div className="relative pb-0">
                        <div className="ProjectAlreadyArea">
                            <h5>{!data.opentraincomplete ? 'Training in progress' : 'Training Complete'}</h5>
                            {!data.opentraincomplete && <Loader
                                Visible={true}
                            />}
                            {!data.opentraincomplete ? <h6>Please be patient, it may take some time</h6> : null}
                            <button className='mb-4 bg-black px-3 py-1 text-white rounded' onClick={() => { setShowTerminal(!showTerminal) }}>{showTerminal ? 'Hide Terminal ↓' : 'Show Terminal ↓'} </button>
                            {showTerminal && <div className='BlackCodeArea' ref={outputRef} style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                <pre style={{ textAlign: "left", lineHeight: 1.6, color: "white", whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{apiresponse ? apiresponse : `Loading${dots}`}</pre>
                            </div>}
                        </div>
                        <div className="row pb-8">
                            <div className="col-lg-6 mt-4">
                                <div className='DataPreviewAugmentLeftNew'><h6>Training Batches</h6></div>
                                <div
                                    className="DataPreviewAugmentLeft"
                                    style={{ borderRight: "1px solid #000", minHeight: '258px', maxHeight: '220px' }}
                                >

                                    <ul>
                                        {trainingImage ? trainingImage == "No image" ? (
                                            <div className='flex flex-col '>
                                                <p>Waiting...</p>
                                                {
                                                    showButtons && <>
                                                        <button className="w-fit bg-blue-500 px-4 py-2 rounded-md text-white" onClick={fetchImage} style={{ marginTop: '10px' }}>Fetch Image</button>
                                                        {status.loadingImage && <div className="text-blue-500 mt-2">Loading image...</div>}
                                                        {status.errorImage && <div className="text-red-500 mt-2">{status.errorImage}</div>}
                                                    </>
                                                }
                                            </div>
                                        ) :
                                            <figure>
                                                <img src={`data:image/png;base64,${trainingImage}`} width={400} height={150} onClick={() => openImageModal(trainingImage)} />
                                            </figure> : <Loader item="200px" />}
                                    </ul>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="ValidationTableNew">
                                    <div className='flex justify-between items-center my-4'>
                                        <h6>Validation Matrix</h6>
                                        {showButtons && <>
                                            <button className="w-fit bg-blue-500 px-4 py-2 rounded-md text-white" onClick={fetchData} style={{ marginTop: '10px' }}>Fetch Data</button>
                                            {status.loadingMatrix && <div className="text-blue-500 mt-2">Loading validation matrix...</div>}
                                            {status.errorMatrix && <div className="text-red-500 mt-2">{status.errorMatrix}</div>}
                                        </>
                                        }

                                    </div>
                                    <table>
                                        <thead>
                                            {task == "classification" ?
                                                <tr>
                                                    <th />
                                                    <th >
                                                        Class
                                                    </th>
                                                    <th >
                                                        Accuracy (%)
                                                    </th>
                                                    {/* <th style={{ minWidth: '92px' }}>
                                                        Top 5
                                                        (%)
                                                    </th> */}
                                                </tr> :
                                                <tr>
                                                    <th style={{ minWidth: '92px' }} />
                                                    <th style={{ minWidth: '92px' }}>
                                                        Precision
                                                        (%)
                                                    </th>
                                                    <th style={{ minWidth: '92px' }}>
                                                        Recall
                                                        (%)
                                                    </th>
                                                    <th style={{ minWidth: '92px' }}>
                                                        Accuracy
                                                        (%)
                                                    </th>
                                                </tr>
                                            }
                                        </thead>
                                    </table>
                                </div>
                                <div className="ValidationTable" ref={rowsRef} >
                                    <table>
                                        <tbody>
                                            {rows?.length > 0 ? rows.map((row, index) => {
                                                if (task === 'classification') {
                                                    return (
                                                        <tr key={index}>
                                                            <td>{row.Class}</td>
                                                            <td>{row.Accuracy}%</td>
                                                        </tr>
                                                    );
                                                } else if (task === 'objectdetection') {
                                                    return (
                                                        <tr key={index}>
                                                            <td style={{ minWidth: '92px' }}>{row.className}</td>
                                                            <td style={{ minWidth: '92px' }}>{row.precision}</td>
                                                            <td style={{ minWidth: '92px' }}>{row.recall}</td>
                                                            <td style={{ minWidth: '92px' }}>{row.accuracy}</td>
                                                        </tr>
                                                    );
                                                } else {
                                                    return null;
                                                }
                                            }) : (
                                                <tr>
                                                    <td colSpan={task === 'objectdetection' ? 4 : 2} className='text-center'>
                                                        <Loader />
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            {!data.opentraincomplete && <div className="col-lg-4 mx-auto mt-3">
                                <a className="Button" role='button' onClick={stopHandler}>
                                    Stop
                                </a>
                            </div>}
                        </div>
                        {data.opentraincomplete &&
                            <div className="text-center  mt-4 absolute bottom-0 flex justify-between items-center w-full">
                                <div className=" flex gap-5 flex-row justify-center items-center">
                                    <span className="b"><i className="fa fa-check" aria-hidden="true"></i></span>
                                    <h4 className='mt-2'>Training has been completed....proceed further</h4>

                                </div>

                                <br />
                                <button className="bg-green-500 rounded-md w-fit text-white text-xl px-3 py-1" onClick={handleProceed}>Proceed Further</button>
                            </div>
                        }
                    </div>


                </Modal.Body>
            </Modal>
            {/* <TrainingCompleted
                onApply={onApply}
                data={data}
                setData={setData}
            /> */}
        </>
    )
}

export default DataTransferModal
