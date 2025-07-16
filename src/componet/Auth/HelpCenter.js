import React, { useState } from 'react'
import Modal from 'react-bootstrap/Modal'; 
import { Link, useNavigate } from 'react-router-dom';     

function HelpSupport({ show, setShow,onSubmit,help}) {
 const{modal}=show;

 const closeModal=()=>{
    setShow({...show,modal:false})
 }
    return (
        <>
            < Modal
                className="ModalBox"
                show={modal}
            // onHide={handleClose}
            >
                <Modal.Body>
                    <div>
                        {/* <Link className="CloseModal" onClick={handleClose}>
                            ×
                        </Link> */}

                        <div className='LogOutModalArea text-center'>
                            <h3>Contact Us</h3>
                            <span><img src={require("../../assets/images/image 18.png")} /></span>
                            <p>Before proceeding it's recommended to seek <br/> advice from an expert
                            </p>
                                <b>Contact us @ oramasupprot.com</b>
                            <div className='TwoButtons'>
                                <Link className='OutlineBtn' data-dismiss="modal" onClick={closeModal} > Cancel</Link>
                                <a onClick={help?closeModal:()=>onSubmit()} className='FillBtn' >Proceed</a>
                            </div>
                        </div>

                    </div>
                </Modal.Body>
            </Modal>
        </>
    )
}

export default HelpSupport
