import React from 'react'
import Header from '../Core/Header'
import Footer from '../Core/Footer'
import { Outlet } from 'react-router-dom'

function Main() {
    return (
        <>
            {/* <Header /> */}
            <div>
                <Outlet />
            </div>
            {/* <Footer /> */}
        </>
    )
}

export default Main