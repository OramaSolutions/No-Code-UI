import React,{useState} from 'react'
import { userLogin } from '../../reduxToolkit/Slices/authSlices';
import { commomObj } from '../../utils';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import HelpSupport from './HelpCenter';

const initialState = {
    email: "",
    password: "",
    loading: false,
    errors: {},
    modal:false,
}


const Login = () => {
    const [show, setShow] = useState(initialState)
    const { email, password, loading, errors,modal } = show;
    console.log(show, 'showwwww')
    const dispatch = useDispatch()
    const navigate = useNavigate();
//=========================================input handler=====================================================
    const inputHandler = (e) => {
        const { name, value } = e.target;
        setShow({ ...show, [name]: value })
    }
    //===================================handle submit=================================================================
    const handleSubmit = async (e) => {        
        e.preventDefault()
        let formValid = handleValidation()
        if (formValid) {
            try {              
                const data = {userName: email.trim(), password: password.trim() };
                const res = await dispatch(userLogin(data))
                console.log(res, "ressssssss")
                if (res?.payload?.code === 200) {
                    if(!res?.payload?.is_login){
                        setShow({...show,modal:true})
                    }else{
                        navigate('/dashboard');
                        toast.success(res.payload.message, commomObj)
                        setShow({ ...show, email: "", password: "", loading: false })
                    }
                }
                else {
                    toast.error(res?.payload?.message, commomObj)
                    setShow({ ...show, loading: false })
                }
            }
            catch (err) {
                toast.error(err?.payload?.message, commomObj)
                console.log("erttttrdesfg", err)
            }
        }

    };
    //==================================validation========================================================================
    const handleValidation = () => {
        let error = {}
        let formValid = true;
        if (!email.trim()) {
            error.emailIdError = "*Email cannot be empty*"
            formValid = false
        }
        if (!password.trim()) {
            error.PasswordError = "*Password cannot be empty*"
            formValid = false
        }

        setShow({
            ...show,
            errors: error,
        });
        return formValid
    }
    const onSubmit=()=>{
        setShow({...show,modal:false})
        navigate('/dashboard');
        toast.success("Login Successfully", commomObj)  
    }
    return (
        <div>
            <div className="LoginArea">
                <div className="LoginBox">
                    <figure>                       
                        <img src={require("../../assets/images/Logo-Inner.png")} />
                    </figure>
                    <form onSubmit={handleSubmit}>
                        <h3>
                            Login into account
                        </h3>
                        <p>
                            Use your credentials to access your account.
                        </p>
                        <div className="form-group">
                            <input
                                className="form-control"
                                placeholder="Enter Your Email Address"
                                type="text"
                                name='email'
                                value={email}
                               onChange={inputHandler}
                            />
                           <span style={{color:'red'}} >{errors.emailIdError}</span>
                        </div>
                        <div className="form-group">
                            <input
                                className="form-control"
                                placeholder="Enter Password"
                                type="password"
                                name='password'
                                value={password}
                                onChange={inputHandler}
                            />
                             <span style={{color:'red'}} >{errors.PasswordError}</span>
                        </div>
                        <div className="form-group">
                            <div className="Checkboxs">
                                <span>
                                </span>
                                <Link to="/login-forgot">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>
                        <button
                            className="Button"
                           disabled={loading}
                        >
                            Login
                        </button>
                    </form>
                </div>
            </div>
            <HelpSupport
            show={show}
            setShow={setShow}
            onSubmit={onSubmit}
            help={""}
            />

        </div>
    )
}

export default Login
