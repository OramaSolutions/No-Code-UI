import logo from './logo.svg';
import './App.css';
import React from 'react';
import { HashRouter, Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux'
import store from "../src/reduxToolkit/store.js"
import { ToastContainer, Slide } from 'react-toastify';
import Login from './componet/Auth/Login.js';
import Forgot from './componet/Auth/Forgot.js';
import ResetPassword from './componet/Auth/ResetPassword.js';
import LoginVerification from './componet/Auth/LoginVerification.js';
import Dashboard from './componet/Dashboard/Dashboard.js';
import MyAccout from './componet/Account/MyAccout.js';
import ChangePassword from './componet/Account/ChangePassword.js';
import Support from './componet/Support/Support.js';
import Project from './componet/Project/Project.js';
import ProjectTraining from './componet/ObjectDetection/Training.tsx';
import ProjectManagement from './componet/OpenProject.js/ProjectManagement.js';
import ClassificationTraining from './componet/Classification/ClassificationTraining.js';
import DefectTraining from './componet/DefectDetection/DefectTraining.js';
import BLEDeviceConnector from './componet/Bluetooth.jsx';

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <React.Fragment>
          <ToastContainer
            transition={Slide}
          />
          <BrowserRouter  >
            <Routes>
              <Route path='/' element={<Login />} />
              <Route path='/login-forgot' element={<Forgot />} />
              <Route path='/userResetPassword' element={<ResetPassword />} />
              <Route path='/loginVerification' element={<LoginVerification />} />
              <Route path='/loginSuccess' element={<LoginVerification />} />

              <Route path='/dashboard' element={<Dashboard />} />

              <Route path='/project' element={<Project />} />

              {/* training routes */}
              <Route path='/training' element={<ProjectTraining />} />
              <Route path='/classification-training' element={<ClassificationTraining />} />
              <Route path='/detection-training' element={<DefectTraining />} />
              {/* ------ */}
              
              <Route path='/project-management' element={<ProjectManagement />} />
              <Route path='/my-account' element={<MyAccout />} />
              <Route path='/change-password' element={<ChangePassword />} />

              <Route path='/support' element={<Support />} />
              <Route path='/bluetooth-connector' element={<BLEDeviceConnector />} />

              {/* Redirect to dashboard if no match */}

            </Routes>
          </BrowserRouter>
        </React.Fragment>
      </div>
    </Provider>
  );
}

export default App;

