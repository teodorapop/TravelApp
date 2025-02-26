import React from 'react';
import LOGO from "../assets/images/logo.svg";
import ProfileInfo from "./Cards/ProfileInfo.jsx";
import {useNavigate} from "react-router-dom";
import SearchBar from "./Input/SearchBar.jsx";

const Navbar = ({userInfo, searchQuery, setSearchQuery, onSearchPost, handleClearSearch}) => {

    const isToken = localStorage.getItem("token");
    const navigate = useNavigate();

    const onLogout = () => {
        localStorage.clear();
        navigate("/login");
    }

    const handleSearch = () => {
        if (searchQuery) {
            console.log("Searching for:", searchQuery); // Verifică dacă se apelează
            onSearchPost(searchQuery);
        }
    };


    const onClearSearch = () => {
        handleClearSearch();
        setSearchQuery("");
    }

    return (
        <div className="bg-white flex items-center justify-between px-6 py-2 drop-shadow sticky top-0 z-10">
            <img src={LOGO} alt="logo" className="h-14"/>
            <img src={"../../assets/images/TravelJourney.png"} alt="another logo" className="h-14"/>

            {isToken && (
                <>
                    <SearchBar
                        value={searchQuery}
                        onChange={({target}) => {
                            setSearchQuery(target.value);
                        }}
                        handleSearch={handleSearch}
                        onClearSearch={onClearSearch}
                        />
                <ProfileInfo userInfo={userInfo} onLogout={onLogout}/>{" "}
            </>
            )}
        </div>
    )
}

export default Navbar;
