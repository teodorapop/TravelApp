import React from "react";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'react-day-picker/style.css';
import './index.css'
import App from './App.jsx'
import {disableReactDevTools} from "@fvilers/disable-react-devtools";

if(process.env.NODE_ENV === "production"){
    disableReactDevTools();
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>,
)
