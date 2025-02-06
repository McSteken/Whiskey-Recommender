import React from 'react';
import { WhiskeyData } from '@/components/search';



interface InfoProps {
    whiskey: WhiskeyData;
    onClose: () => void;
}

const Info: React.FC<InfoProps> = ({ whiskey, onClose }) => {

    const [showPreprocessed, setShowPreprocessed] = React.useState(false);

    const togglePreprocessed = () => {
        setShowPreprocessed(!showPreprocessed);
    }


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="info p-8 rounded shadow-lg max-w-lg w-full relative" onClick={(e) => e.stopPropagation()}>
                <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={onClose}>
                    &times;
                </button>
                <h2 className="text-2xl font-bold mb-4">{whiskey.name}</h2>
                <div className="flex flex-row gap-4 justify-between">
                    <p><b>Similarity:</b> {(100 * (whiskey.similarity_score ?? 0)).toFixed(1)}%</p>
                    <p><b>Price:</b> ${whiskey.price}</p>
                    <p><b>Rating:</b> {whiskey.rating}/100</p>
                </div>
                <br />
                <div className="flex flex-row gap-4 justify-between">
                    <p><b>Category:</b> {whiskey.category}</p>
                </div>
                <br />

                <p><b>Description:</b></p>
                {whiskey.description}

                <div className="flex items-center mt-4 cursor-pointer" onClick={togglePreprocessed}>
                    <p><b>Keywords:</b></p>
                    <svg
                        className={`ml-2 w-6 h-6 transition-transform ${showPreprocessed ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </div>
                {showPreprocessed && (
                    <p className="mt-2">{whiskey.preprocessed_description}</p>
                )}
                

            </div>
        </div>
    );
};

export default Info;