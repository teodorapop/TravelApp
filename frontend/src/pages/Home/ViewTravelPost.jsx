import React from "react";
import {MdDeleteOutline, MdClose, MdUpdate} from "react-icons/md";
import {GrMapLocation} from "react-icons/gr";
import moment from "moment";

const ViewTravelStory = ({postInfo, onClose, onEditClick, onDeleteClick}) => {
    return (
        <div className="relative">
            <div className="flex items-center justify-end">
                <div>
                    <div className="flex items-center gap-3 bg-cyan-50/50 p-2 rounded-lg">
                        <button className="btn-small" onClick={onEditClick}>
                            <MdUpdate className="text-lg" /> UPDATE POST
                        </button>

                        <button className="btn-small btn-delete" onClick={onDeleteClick}>
                            <MdDeleteOutline className="text-lg" /> Delete
                        </button>

                        <button className="" onClick={onClose}>
                            <MdClose className="text-xl text-slate-400" />
                        </button>
                    </div>
                </div>
            </div>

            <div>
                <div className="flex-1 flex flex-col gap-2 py-4">
                    <h1 className="text-2xl text-slate-950">
                        {postInfo && postInfo.title}
                    </h1>

                    <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-slate-500">
                            {postInfo && moment(postInfo.visitedDate).format('Do MMM YYYY')}
                        </span>
                        <div
                            className="flex items-center gap-2 text-[13px] text-cyan-600 bg-cyan-200 rounded px-2 py-1">
                            <GrMapLocation className="text-sm"/>
                            {postInfo &&
                                postInfo.visitedLocation.map((item, index) =>
                                    postInfo.visitedLocation.length === index + 1
                                        ? `${item}`
                                        : `${item},`)}
                        </div>
                    </div>

                </div>
                <img
                    src={postInfo && postInfo.imageUrl}
                    alt="selected image"
                    className="w-full h-[300px] object-cover rounded-lg"
                />

                <div className="mt-4">
                    <p className="text-sm text-slate-950 leading-6 text-justify whitespace-pre-line">{postInfo.description}</p>
                </div>
            </div>
        </div>
    );
};

export default ViewTravelStory;
