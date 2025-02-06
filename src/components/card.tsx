"use client";
import React from "react";
//import "../styles/card.css";
import "../app/globals.css";
import { WhiskeyData } from "@/components/search";


interface CardProps {
    data: WhiskeyData;
    onClick?: () => void;
}

const Card: React.FC<CardProps> = ({data, onClick}) => {
    //console.log(data); // Log the received data
    return (
        <div className="card cursor-pointer flex flex-col justify-between" onClick={onClick}>
            <h3>{data.name}</h3>
            <div className="flex flex-row gap-4 justify-between">
                <p><b>Similarity:</b> {(100 * (data.similarity_score ?? 0)).toFixed(1)}%</p>
                <p><b>Price:</b> ${data.price}</p>
                <p><b>Rating:</b> {data.rating}/100</p>
            </div>
        </div>
    );
};

export default Card;