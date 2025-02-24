import React, {useEffect, useState} from "react";
import Navbar from "../../components/Navbar.jsx";
import {useNavigate} from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance.js";
import TravelPostCard from "../../components/Cards/TravelPostCard.jsx";
import {MdAdd} from "react-icons/md";
import Modal from "react-modal";
import AddEditTravelPost from "./AddEditTravelPost.jsx";
import ViewTravelPost from "./ViewTravelPost.jsx";
import EmptyCard from "../../components/Cards/EmptyCard.jsx";
import EmptyImg from "../../assets/images/gallery.svg";
import {DayPicker} from "react-day-picker";
import moment from "moment";
import FilterInfoTitle from "../../components/Cards/FilterInfoTitle.jsx";
import {getEmptyCardMessage} from "../../utils/helper.js";

const Home = () => {

  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [allPosts, setAllPosts] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");

  const [dateRange, setDateRange] = useState({from: null, to: null});
  const [error, setError] = useState("");

  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [openViewModal, setOpenViewModal] = useState({
    isShown: false,
    data: null,
  })

  // Get User Info
  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/get-user");
      if(response.data && response.data.user){
        // Set user info if data exists
        setUserInfo(response.data.user);
      }
    } catch(error){
      console.log("error in frontend at get user method")
      if(error.response.status === 401){
        // Clear storage if unath
        localStorage.clear();
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    getUserInfo();
    getAllTravelPosts();

    return () => {};
  }, []);

   //Get all travel posts
  const getAllTravelPosts = async () => {
    try{
      const response = await axiosInstance.get("/get-all-posts");
      if(response.data && response.data.posts){
        setAllPosts(response.data.posts);
      }
    } catch(error){
      console.log("Please try again", error.response.status);
    }
  }

   // Handle edit posts click
  const handleEdit = (data) =>{
    setOpenAddEditModal({isShown: true, type: "edit", data: data});
  }

  // Handle travel story click
  const handleViewPost = (data) => {
    setOpenViewModal({isShown: true, data})
  }

  // Handle update favourite
  const updateIsFavourite = async (postData) => {
    const postId = postData._id;
    try{
      const response = await axiosInstance.put(
          "/update-is-favourite/" + postId,
          {
            isFavourite: !postData.isFavourite,
          }
      );
      if(response.data && response.data.post){
        if(filterType === "search" && searchQuery) {
          onSearchPost(searchQuery);
        } else if (filterType === "date") {
          filterPostsByDate(dateRange);
        } else {
          await getAllTravelPosts();
        }
      }
    } catch(error){
      console.log("Unexpected error, please try again.", error);
    }
  }

  // Delete post
  const deleteTravelPost = async (data) =>{
    const postId = data._id;
    try{
      const response = await axiosInstance.delete("/delete-post/" + postId);

      if(response.data && !response.data.error){
        setOpenViewModal((prevState) => ({...prevState, isShown: false}));
        getAllTravelPosts();
      }
    } catch(error){
      console.log(error);
      if(
          error.response &&
          error.response.data &&
          error.response.data.message
      ) {
        setError(error.response.data.message);
      } else {
        // Handle unexpected error
        setError("Unexpected error");
      }
    }
  }

  // Search post
  const onSearchPost = async (query) => {
    console.log("Fetching search results for:", query); // Vezi ce caută
    try {
      const response = await axiosInstance.get("/search", {
        params: { query },
      });
      console.log("Search response:", response.data); // Vezi ce returnează serverul

      if (response.data && response.data.stories) {
        setFilterType("search");
        setAllPosts(response.data.stories); // Folosim stories în loc de posts
        console.log("Updated posts:", response.data.stories);
      }

    } catch (error) {
      console.log("Unexpected error", error);
    }
  };

  const handleClearSearch = () =>{
    setFilterType("");
    getAllTravelPosts();
  }

  // Handle Filter Travel Story By Date Range
  const filterPostsByDate = async (day) => {
    console.log("filterPostsByDate received:", day);

    if (!day || typeof day !== "object" || !day.from) {
      console.error("Invalid date range:", day);
      return;
    }

    try {
      const startDate = moment(day.from).valueOf();
      const endDate = day.to ? moment(day.to).valueOf() : startDate; // Dacă `to` nu există, folosește `from`

      const response = await axiosInstance.get("/travel-posts/filter", {
        params: { startDate, endDate },
      });

      console.log("API response:", response.data);

      if (response.data && Array.isArray(response.data)) {
        setFilterType("date");
        setAllPosts(response.data);
      } else {
        console.warn("No stories received", response.data);
      }
    } catch (error) {
      console.error("Error filtering stories by date:", error);
    }
  };


  // Handle Date Range Select
  const handleDayClick = (day) => {
    console.log("handleDayClick received:", day);
    setDateRange(day);
    filterPostsByDate(day);
  }

  const resetFilter = () =>{
    setDateRange({from:null, to: null});
    setFilterType("");
    getAllTravelPosts()
        .then(() => {
          console.log("Posts reloaded successfully");
        })
        .catch((error) => {
          console.error("Failed to reload posts:", error);
        });
  };

  return <>
    <Navbar
        userInfo={userInfo}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchPost={onSearchPost}
        handleClearSearch={handleClearSearch}
    />

    <div className="container mx-auto py-10 px-10">

      <FilterInfoTitle
          filterType={filterType}
          filterDates={dateRange}
          onClear={() => {
            resetFilter();
          }}
      />

      <div className="flex gap-8">
        <div className="flex-1">
          {allPosts.length > 0 ? (
              <div className="grid grid-cols-2 gap-7">
                {allPosts.map((post) => {
                    return(
                        <TravelPostCard
                         key={post._id}
                         imgUrl={post.imageUrl}
                         title={post.title}
                         description={post.description}
                         date={post.visitedDate}
                         visitedLocation={post.visitedLocation}
                         isFavourite={post.isFavourite}
                         onEdit={() => handleEdit(post)}
                         onClick={() => handleViewPost(post)}
                         onFavouriteClick={() => updateIsFavourite(post)}
                        />
                  );
                })}
              </div>
          ):(
        <EmptyCard
            imgSrc={EmptyImg}
            message={getEmptyCardMessage(filterType)}
        />
        )}
      </div>

        <div className="w-[350px]">
          <div className="bg-white border border-slate-200 shadow-lg shadow-slate-200/60 rounded-lg">
            <div className="p-3">
              <DayPicker
                  captionLayout="dropdown-buttons"
                  mode="range"
                  selected={dateRange}
                  onSelect={handleDayClick}
                  pagedNavigation
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Add & Edit travel posts model*/}
    <Modal
    isOpen={openAddEditModal.isShown}
    onRequestClose={() => setOpenAddEditModal({ isShown: false })}
        style={{
        overlay: {
        backgroundColor: "rgba(0,0,0,0.2)",
        zIndex: 999,
        },
        }}
        appElement={document.getElementById("root")}
        className="model-box"
    >
      <AddEditTravelPost
        type={openAddEditModal.type}
        postInfo={openAddEditModal.data}
        onClose={() => {
          setOpenAddEditModal({isShown: false, type:"add", data: null });
        }}
        getAllTravelPosts={getAllTravelPosts}
      />
    </Modal>

    {/* View travel posts model*/}
    <Modal
        isOpen={openViewModal.isShown}
        onRequestClose={() => setOpenAddEditModal({ isShown: false })}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
            zIndex: 999,
          },
        }}
        appElement={document.getElementById("root")}
        className="model-box"
    >
      <ViewTravelPost
        postInfo={openViewModal.data || null}
        onClose={() => {
          setOpenViewModal((prevState) => ({...prevState, isShown: false}));
        }}
        onEditClick={() => {
          setOpenViewModal((prevState) => ({...prevState, isShown: false}));
          handleEdit(openViewModal.data || null);
        }}
        onDeleteClick={() => {
          deleteTravelPost(openViewModal.data || null);
        }}
        />
    </Modal>

    <button
      className="w-16 h-16 flex items-center justify-center rounded-full bg-primary hover:bg-cyan-400 fixed right-10 bottom-10"
      onClick={() => {
        setOpenAddEditModal({isShown: true, type: "add", data: null});
      }}
      >
      <MdAdd className="text-[32px] text-white"/>
    </button>

  </>;
}
export default Home;
