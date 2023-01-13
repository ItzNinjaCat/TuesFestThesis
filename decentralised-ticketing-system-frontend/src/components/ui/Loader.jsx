import React from 'react';
import { Watch } from 'react-loader-spinner';
import '../../style/style.scss';


function Loader() {
    return (
            <div className='d-flex justify-content-center align-items-center h-100 loader-div' >
                <Watch
                height="200"
                width="200"
                radius="48"
                color="#0d6efd"
                ariaLabel="watch-loading"
                wrapperStyle={{}}
                wrapperClassName=""
                visible={true}
                />
            </div>
    );
}

export default Loader;