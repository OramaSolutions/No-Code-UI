import React,{useState} from 'react'
import { Link, NavLink } from 'react-router-dom'
import HelpSupport from '../componet/Auth/HelpCenter'

const initialState = {
    modal:false,
}

const Sidenav = () => {
    const [show, setShow] = useState(initialState)
    const {modal } = show;

const openHelpModal=()=>{
    setShow({...show,modal:true})
}
    return (
        <div>
            <div className="SidenavBar">
                <div className="Logo">                  
                    <img src={require("../assets/images/Logo-Inner.png")}/>
                </div>
                <ul>
                    <li>
                        <NavLink to="/dashboard">
                            <span>
                                <img src={require("../assets/images/sidenav-1.png")}/>
                            </span>
                            {' '}Dashboard
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            data-target="#NewProject"
                            data-toggle="modal"
                            to="/project"
                        >
                            <span>
                                <img src={require("../assets/images/sidenav-2.png")} />
                            </span>
                            {' '}New Project
                        </NavLink>
                        {' '}
                    </li>
                    <li>
                        <NavLink
                            data-target="#OpenProject"
                            data-toggle="modal"
                            to="/project-management"
                        >
                            <span>
                                <img src={require("../assets/images/sidenav-3.png")} />
                            </span>
                            {' '}Open Project
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/support">
                            <span>
                                <img src={require("../assets/images/sidenav-4.png")} />
                            </span>
                            {' '}Support
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/my-account">
                            <span>
                                <img src={require("../assets/images/sidenav-5.png")}/>
                            </span>
                            {' '}My Account
                        </NavLink>
                    </li>
                </ul>
                <div className="SidenavFooter">
                    <h5>
                        Help Center
                    </h5>
                    <p>
                        Having Trouble in Learning. <br/> Please contact us for more questions.
                    </p>
                    <button className='Button' onClick={openHelpModal}>
                        Go To Help Center
                    </button>
                    <div className="Overlay">
                        <img src={require("../assets/images/question.png")} />
                    </div>
                </div>
            </div>
            <HelpSupport
             show={show}
             setShow={setShow}
             help={"help"}
            />

        </div>
    )
}

export default Sidenav
