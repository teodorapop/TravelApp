import React, {useState} from 'react';
import {MdAdd, MdClose, MdUpdate} from "react-icons/md";
import DateSelector from "../../components/Input/DateSelector.jsx";
import ImageSelector from "../../components/Input/ImageSelector.jsx";
import TagInput from "../../components/Input/TagInput.jsx";
import axiosInstance from "../../utils/axiosInstance.js";
import moment from "moment";
import uploadImage from "../../utils/uploadImage.js";

const AddEditTravelPost = ({
                               postInfo,
                               type,
                               onClose,
                               getAllTravelPosts,
}) => {

    const [title, setTitle] = useState(postInfo?.title || "");
    const [postImg, setPostImg] = useState(postInfo?.imageUrl || null);
    const [description, setDescription] = useState(postInfo?.description|| "");
    const [visitedDate, setVisitedDate] = useState(postInfo?.visitedDate || []);
    const [visitedLocation, setVisitedLocation] = useState(postInfo?.visitedLocation || []);

    const [error, setError] = useState("");

    // Add New Travel Post
    const addNewTravelPost = async() => {
        try{
            let imageUrl = "";

            // Upload image if present
            if(postImg){
                const imgUploadRes = await uploadImage(postImg);
                // get image URL
                imageUrl = imgUploadRes.imageUrl || "";
            }

            const response = await axiosInstance.post("/add-travel-post", {
                title,
                description,
                imageUrl: imageUrl || "",
                visitedLocation,
                visitedDate: visitedDate
                    ? moment(visitedDate).valueOf()
                    : moment().valueOf(),
            });

            if(response.data && response.data.post){
                // Refresh posts
                getAllTravelPosts();
                // Close modal or form
                onClose();
            }

        } catch(error){
            if(
                error.response &&
                error.response.data &&
                error.response.data.message
            ) {
                setError(error.response.data.message);
            } else {
                setError("An unexpected error occurred.");
            }
        }
        getAllTravelPosts();
        onClose();
    }

    // Update Travel Post
    const updateTravelPost = async () => {
        const postId = postInfo._id;

        try{
            let imageUrl = "";

            let postData ={
                title,
                description,
                imageUrl: postInfo.imageUrl || "",
                visitedLocation,
                visitedDate: visitedDate
                    ? moment(visitedDate).valueOf()
                    : moment().valueOf(),
            }

            if(typeof postImg === "object"){
                // Upload new image
                const imgUploadRes = await uploadImage(postImg);
                imageUrl = imgUploadRes.data.imageUrl || null;

                postData = {
                    ...postData,
                    imageUrl: imageUrl,
                };
            }

            const response = await axiosInstance.put("/edit-post/" + postId, postData);

            if(response.data && response.data.post){
                // Refresh posts
                getAllTravelPosts();
                // Close modal or form
                onClose();
            }

        } catch(error){
            if(
                error.response &&
                error.response.data &&
                error.response.data.message
            ) {
                setError(error.response.data.message);
            } else {
                setError("An unexpected error occurred.");
            }
        }
    }

    const handleAddOrUpdateClick = () => {
        console.log("Input Data:", { title, postImg, description, visitedLocation, visitedDate });

        if (!title) {
            setError("Please enter the title");
            return;
        }

        if (!description) {
            setError("Please enter the story");
            return;
        }

        setError("");

        if (type === "edit") {
            updateTravelPost();
        } else {
            addNewTravelPost();
        }
    };

    // Delete post image and update the post
    const handleDeleteImgPost = async() => {
        // Detecting the image
        const deleteImgRes = await axiosInstance.delete("/delete-image", {
            params: {
                imageUrl: postInfo.imageUrl,
            },
        });

        if (deleteImgRes.data) {
            const postId = postInfo._id;
            const postData = {
                title,
                description,
                visitedLocation,
                visitedDate: moment().valueOf(),
                imageUrl: "",
            };

            // Updating post
            const response = await axiosInstance.put(
                "/edit-post/" + postId,
                postData
            );
            setPostImg(null);
        }
    }

    return (
        <div className="relative">
            <div className="flex items-center justify-between">
                <h5 className="text-xl font-medium text-slate-700">
                    {type === "add" ? "Add Post" : "Update"}
                </h5>

                <div>
                    <div className=" flex items-center gap-3 bg-cyan-50/50 p-2 rounded-l-lg">
                        {type === 'add' ? (<button className="btn-small" onClick={handleAddOrUpdateClick}>
                            <MdAdd className="text-lg" /> ADD POST
                        </button>) : (<>
                            <button className="btn-small" onClick={handleAddOrUpdateClick}>
                            <MdUpdate className="text-lg" /> UPDATE
                            </button>

                        </>
                            )}
                        <button className="" onClick={onClose}>
                            <MdClose className="text-xl text-slate-400" /> Close
                        </button>
                    </div>
                    {error && (<p className="text-red-500 text-xs pt-2 text-right">{error}</p>)}
                </div>
            </div>

            <div>
                <div className="flex-1 flex flex-col gap-2 pt-4">
                    <label className="input-label">TITLE</label>
                    <input
                    type="text"
                    className="text-xl text-slate-950 outline-none"
                    placeholder="A Day at the Great Wall"
                    value={title}
                    onChange={({target}) => setTitle(target.value)}
                    />

                    <div className="my-3">
                        <DateSelector date={visitedDate} setDate={setVisitedDate}/>
                    </div>

                    <ImageSelector
                        image={postImg}
                        setImage={setPostImg}
                        handleDeleteImg={handleDeleteImgPost}
                    />

                    <div className="flex flex-col gap-2 mt-4">
                        <label className="input-label">DESCRIPTION</label>
                        <textarea
                            type="text"
                            className="text-sm text-slate-950 outline-none bg-slate-50 p-2 rounded"
                            placeholder="Your story"
                            rows={10}
                            value={description}
                            onChange={({target}) => setDescription(target.value)}
                        />
                    </div>

                    <div className="pt-3">
                        <label className="input-label">VISITED LOCATIONS</label>
                        <TagInput tags={visitedLocation} setTags={setVisitedLocation}/>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default AddEditTravelPost;
