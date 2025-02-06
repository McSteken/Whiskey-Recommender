import React from "react";
import Card from "@/components/card";
import Loading from "@/components/loading/loading";

interface WhiskeyData {
    name: string;
    price: string;
    rating: string;
}

interface ResultsProps {
    recommendations: WhiskeyData[];
    onCardClick: (whiskey: WhiskeyData) => void;
}

const Results: React.FC<ResultsProps> = ({ recommendations, onCardClick }) => {
    return (
        <div className="container flex flex-col items-center mt-20 pt-10">
            <h2 className="text-3xl font-bold mb-10">Recommendations based on selected whiskey:</h2>

            <div className="results-container">
                <ul className="flex flex-wrap justify-center gap-4 ">
                    {recommendations.map((whiskey, index) => (
                        <li key={index} className="relative transform transition-transform hover:scale-105">
                            <div className="absolute top-0 left-0 bg-gray-800 text-white rounded-full w-8 h-8 flex items-center justify-center z-10">
                                {index + 1}
                            </div>
                            <Card data={whiskey} onClick={() => onCardClick(whiskey)} />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Results;