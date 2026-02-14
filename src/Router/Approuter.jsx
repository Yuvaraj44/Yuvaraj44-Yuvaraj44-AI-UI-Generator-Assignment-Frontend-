import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Main from '../Main/Main'
import Home from '../Components/Home/Home'

function Approuter() {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route element={<Main />}>
                        <Route path='/' element={<Home />}/>
                    </Route>
                </Routes>
            </BrowserRouter>
        </>
    )
}

export default Approuter

