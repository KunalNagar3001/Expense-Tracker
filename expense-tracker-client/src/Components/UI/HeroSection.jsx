import { DollarSign } from "lucide-react"
import React from "react"
import '../Auth/login.css'
import './HeroSection.css'

const Herosection = () => {
    return (
        <div className="HeroSection-Container" >
            <div className="HeroSection-Card">
                <div className="login-logo-wrapper">
                    <div className="login-logo-bg">
                        <DollarSign className="login-logo" />
                    </div>
                </div>
                <h1 className="HeroSection-title">Expenzo</h1>

            </div>
            <div className="HeroSection-phrase">
                <p>TRACK SMART. SPEND WISE. SAVE MORE</p>
            </div>

            <div className="HeroSection-content">

                <p>Expenzo is your personal expense companion — built to help you track daily spending, analyze trends, and make smarter financial decisions. From quick entries to monthly insights, manage your money with ease and clarity.</p>

            </div>
        </div>
    )
}

export default Herosection;