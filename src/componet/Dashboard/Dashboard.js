import React, { useEffect } from 'react'
import Sidenav from '../../commonComponent/Sidenav'
import Header from '../../commonComponent/Header'
import Project from '../Project/Project'
import { dashboardList } from '../../reduxToolkit/Slices/dashboardSlices'
import { useDispatch, useSelector } from 'react-redux'
import Loader from '../../commonComponent/Loader'
import { useNavigate } from 'react-router-dom'
import CalendarComponent from './Calender'

const Dashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { dashboardData, loader } = useSelector((state) => state.dashboard)
    // console.log(dashboardData, "dashboardData")
    
    //===================================useEffect==========================================================
    useEffect(() => {
        dispatch(dashboardList())
    }, [])
    const navigateHandler = (projectName, versionNumber, projectId,model) => {
        const redirect=model=="objectdetection"?"/training":model=="Classification"?"/classification-training":"/detection-training"
        navigate(redirect, { state: { name: projectName, version: versionNumber, projectId: projectId } })
    }
    return (
        <div>
            <Sidenav />
            <Header />
            <div className="NewWrapperArea">
                <div className="NewWrapperBox">
                    <Project type={"dashboard"} />
                </div>
                <div className="AllProjectBox">
                    <div className="CalendarBox">
                        <CalendarComponent/>
                    </div>
                    {!loader ?
                        dashboardData?.result?.length > 0 ? (
                            dashboardData?.result?.map((item, i) => {
                                return (
                                    <div className="SmallProjectBox" onClick={() => navigateHandler(item?.name, item?.versionNumber, item?._id,item?.model)}>
                                        <h2>{item?.name}</h2>
                                        <p>Version {item?.versionNumber}</p>
                                        <h3>{item?.model}</h3>
                                    </div>
                                );
                            })
                        ) : (
                            <tr>
                                <td >
                                    <p style={{marginLeft:"50px",marginTop:"110px"}}><b>No Latest Project Found</b></p>
                                </td>
                            </tr>
                        ) : <Loader></Loader>}
                </div>
            </div>


        </div>
    )
}

export default Dashboard
