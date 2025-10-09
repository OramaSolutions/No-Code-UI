import React from 'react';
import { FadeLoader, MoonLoader } from 'react-spinners';

function Loader({item,Visible}) {
    return (
      <>
       {Visible? 
        <div  style={{ marginLeft: item?item:'400px' }}>
           <FadeLoader color={'Green'}  size={100} />          
        </div>:
        <div className="text-align-end" style={{ marginLeft: item?item:'400px' }}>
         <MoonLoader color={'Blue'}  size={50} />
        </div>}
        </>
    );
}

export default Loader;