import React, { useState } from 'react'
import Sidenav from '../../commonComponent/Sidenav'
import Header from '../../commonComponent/Header'
import { Link } from 'react-router-dom'
import CreateProject from './CreateProject'

const initialState = {
    open: false,
    model: "",
}

function Project({ type }) {
    const [istate, updateIstate] = useState(initialState)
    const { open } = istate;

    const openModal = (type) => {
        updateIstate({ ...istate, open: true, model: type })
    }
    return (
        <div>
            {type == "dashboard" ? "" : <Header />}
            {type == "dashboard" ? "" : <Sidenav />}
            <div className={type == "dashboard" ? "" : "WrapperArea"}>
                <div className={type == "dashboard" ? "" : "WrapperBox"}>
                    {type == "dashboard" ? "" : <div className="NewTitleBox">
                        <h4 className="NewTitle">Select Model</h4>
                    </div>}
                    <div className="row">
                        <div className="col-lg-6">
                            <div className="SelectModelBox">
                                <aside>
                                    <ul>
                                        <li>
                                            <figure>
                                                <img src={require("../../assets/images/model-1.png")} />
                                            </figure>
                                        </li>
                                        <li>
                                            <figure>
                                                <img src={require("../../assets/images/model-1.png")} />
                                            </figure>
                                        </li>
                                        <li>
                                            <figure>
                                                <img src={require("../../assets/images/model-1.png")} />
                                            </figure>
                                        </li>
                                    </ul>
                                </aside>
                                <h5>Object Detection</h5>
                                <p>
                                    Train a model with labeled data for detecting objects within images.
                                </p>
                                <article>
                                    <ul>
                                        <li>
                                            <span>
                                                <img src={require("../../assets/images/right.png")} />
                                            </span>
                                            <label>Use labeled data in YOLO format</label>
                                        </li>
                                        <li>
                                            <span>
                                                <img src={require("../../assets/images/right.png")} />
                                            </span>
                                            <label>Require a minimum of 300 images for training</label>
                                        </li>
                                        <li>
                                            <span>
                                                <img src={require("../../assets/images/right.png")} />
                                            </span>
                                            <label>
                                                Ensure proper labeling of objects without any errors
                                            </label>
                                        </li>
                                    </ul>
                                    <Link
                                        className="StartTraining"
                                        onClick={() => openModal("Object Detection")}
                                    >
                                        Create Project
                                    </Link>
                                </article>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="SelectModelBox">
                                <aside>
                                    <ul>
                                        <li>
                                            <figure>
                                                <img src={require("../../assets/images/model-1.png")} />
                                            </figure>
                                        </li>
                                        <li>
                                            <figure>
                                                <img src={require("../../assets/images/model-1.png")} />
                                            </figure>
                                        </li>
                                        <li>
                                            <figure>
                                                <img src={require("../../assets/images/model-1.png")} />
                                            </figure>
                                        </li>
                                    </ul>
                                </aside>
                                <h5>Defect Detection</h5>
                                <p>Perform defect detection with limited labeling</p>
                                <article>
                                    <ul>
                                        <li>
                                            <span>
                                                <img src={require("../../assets/images/right.png")} />
                                            </span>
                                            <label>
                                                Prepare a dataset organized in four folders: good_train,
                                                bad_train, good_test, and bad_test.
                                            </label>
                                        </li>
                                        <li>
                                            <span>
                                                <img src={require("../../assets/images/right.png")} />
                                            </span>
                                            <label>Each folder should contain 30 images.</label>
                                        </li>
                                        <li>
                                            <span>
                                                <img src={require("../../assets/images/right.png")} />
                                            </span>
                                            <label>
                                                e folder name should be same as project name and the good/bad
                                                should be in lowercase (no spaces).
                                            </label>
                                        </li>
                                    </ul>
                                    <Link
                                        className="StartTraining"
                                        onClick={() => openModal("Defect Detection")}
                                    >
                                        Start Detection
                                    </Link>
                                </article>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="SelectModelBox">
                                <aside>
                                    <ul>
                                        <li>
                                            <figure>
                                                <img src={require("../../assets/images/model-1.png")} />
                                            </figure>
                                        </li>
                                        <li>
                                            <figure>
                                                <img src={require("../../assets/images/model-1.png")} />
                                            </figure>
                                        </li>
                                        <li>
                                            <figure>
                                                <img src={require("../../assets/images/model-1.png")} />
                                            </figure>
                                        </li>
                                    </ul>
                                </aside>
                                <h5>Classification</h5>
                                <p>Perform Classification Tasks</p>
                                <article>
                                    <ul>
                                        <li>
                                            <span>
                                                <img src={require("../../assets/images/right.png")} />
                                            </span>
                                            Train and Visualize Metrics.
                                        </li>
                                        <li>
                                            <span>
                                                <img src={require("../../assets/images/right.png")} />
                                            </span>
                                            Train and Visualize Metrics.
                                        </li>
                                        <li>
                                            <span>
                                                <img src={require("../../assets/images/right.png")} />
                                            </span>
                                            Train and Visualize Metrics.
                                        </li>
                                        <li>
                                            <span>
                                                <img src={require("../../assets/images/right.png")} />
                                            </span>
                                            Evaluate on Saved Images &amp; Camera
                                        </li>
                                    </ul>
                                    <Link className="StartTraining"
                                        onClick={() => openModal("Classification")} >
                                        Start Classification
                                    </Link>
                                </article>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="SelectModelBox">
                                <aside>
                                    <ul>
                                        <li>
                                            <figure>
                                                <img src={require("../../assets/images/model-1.png")} />
                                            </figure>
                                        </li>
                                        <li>
                                            <figure>
                                                <img src={require("../../assets/images/model-1.png")} />
                                            </figure>
                                        </li>
                                        <li>
                                            <figure>
                                                <img src={require("../../assets/images/model-1.png")} />
                                            </figure>
                                        </li>
                                    </ul>
                                </aside>
                                <h5>Text Extraction</h5>
                                <p>Perform defect detection with limited labeling</p>
                                <article>
                                    <ul>
                                        <li>
                                            <span>
                                                <img src={require("../../assets/images/right.png")} />
                                            </span>
                                            Add labelled data containing images of text and corresponding
                                            text labels
                                        </li>
                                        <li>
                                            <span>
                                                <img src={require("../../assets/images/right.png")} />
                                            </span>
                                            Train the Detector and the Recognizer
                                        </li>
                                        <li>
                                            <span>
                                                <img src={require("../../assets/images/right.png")} />
                                            </span>
                                            Test on Images with options to alter settings
                                        </li>
                                    </ul>
                                    <a className="StartTraining">
                                        Start Text Extraction
                                    </a>
                                </article>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <CreateProject
                istate={istate}
                setIstate={updateIstate}
            />
        </div>
    )
}

export default Project
