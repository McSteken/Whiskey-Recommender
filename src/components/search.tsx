"use client";
import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import Card from "@/components/card";
import Results from "@/components/results";
import Loading from "@/components/loading/loading";
import Info from "@/components/info";
import "../app/globals.css";

export interface WhiskeyData {
    name: string;
    price: string;
    rating: string;
    description?: string;
    category?: string;
    similarity_score?: number;
    preprocessed_description?: string;
}

const Search: React.FC = () => {
    const [data, setData] = useState<WhiskeyData[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [filteredData, setFilteredData] = useState<{ item: WhiskeyData, originalIndex: number }[]>([]);
    const [selectedWhiskey, setSelectedWhiskey] = useState<WhiskeyData | null>(null);
    const [recommendations, setRecommendations] = useState<WhiskeyData[]>([]);
    const [hasSelected, setHasSelected] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [showInfo, setShowInfo] = useState<boolean>(false);
    const [maxPrice, setMaxPrice] = useState<number>(1000); 
    const [infoWhiskey, setInfoWhiskey] = useState<WhiskeyData | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch("/whiskey_data.csv");
            if (!response.body) {
                throw new Error("Response body is null");
            }
            const reader = response.body.getReader();
            const result = await reader.read();
            const decoder = new TextDecoder("utf-8");
            const csv = decoder.decode(result.value);
            const parsedData = Papa.parse(csv, { header: true });
            console.log(parsedData.data); // Log the fetched data

            // Map the parsed data to the desired structure
            const mappedData = parsedData.data.map((item: any) => ({
                name: item.name || "",
                price: item.price || "",
                rating: item.rating || "",
                category: item.category || "",
                similarity_score: item.similarity_score || 0,
                preprocessed_description: item.preprocessed_description || ""
            }));

            setData(mappedData as WhiskeyData[]);
        };

        fetchData();
    }, []);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value;
        setSearchQuery(query);
        if (query.length > 0) {
            const filtered = data
                .map((item, index) => ({ item, originalIndex: index }))
                .filter(({ item }) =>{
                    const words = item.name.toLowerCase().split(" ");
                    return query.split(" ").every(q => words.some(word => word.startsWith(q)));
                });
            setFilteredData(filtered);
        } else {
            setFilteredData([]);
        }
    };

    const handleCardClick = (whiskey: WhiskeyData) => {
        setInfoWhiskey(whiskey);
        setShowInfo(true);
    };

    const closeModal = () => {
        setShowInfo(false);
    };

    const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const price = parseFloat(event.target.value);
        setMaxPrice(price);
    };


    const handleSelect = async (index: number) => {
        const { item, originalIndex } = filteredData[index];
        setSelectedWhiskey(item);
        setSearchQuery(""); // Clear the search bar after selecting
        setFilteredData([]);
        setHasSelected(true); // Set hasSelected to true after selecting a whiskey
        setLoading(true); // Set loading to true before fetching recommendations

        const priceToSend = maxPrice === 10000 ? Infinity : maxPrice;

        // Send the selected whiskey to the API endpoint
        const response = await fetch('http://localhost:5000/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ index: originalIndex, maxPrice: priceToSend }),
        });

        if (!response.ok) {
            console.error('Failed to fetch recommendations');
            setLoading(false); // Set loading to false if fetching fails
            return;
        }

        const recommendations = await response.json();
        setRecommendations(recommendations);
        setLoading(false); // Set loading to false after fetching recommendations
    };

    return (
        <div className="flex flex-col items-center w-full">
            <div className="flex flex-row justify-center w-full">
                <div className={`search-container relative w-full max-w-md transition-all duration-500 ${hasSelected ? 'mt-4' : 'mt-20'}`}>
                    <h2 className="search-title font-bold ">Enter a Whiskey</h2>
                    <input
                        type="text"
                        className="search-bar"
                        placeholder="Search by name"
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                    <div className="mt-4 w-full pl-2 pr-2">
                        <label htmlFor="priceRange" className="max-price block text-sm font-medium">Max Price: ${maxPrice === 10000 ? '10000+' : maxPrice}</label>
                        <input
                            type="range"
                            id="priceRange"
                            min="0"
                            max="10000"
                            step="50"
                            value={maxPrice}
                            onChange={handlePriceChange}
                            className="w-full"
                        />
                    </div>

                    {filteredData.length > 0 && (
                        <ul className="absolute left-0 right-0 z-10 border border-gray-300 rounded bg-white max-h-60 overflow-y-auto top-full mt-1">
                            {filteredData.map(({item}, index) => (
                                <li 
                                    key={index} 
                                    className="p-2 hover:bg-gray-200 cursor-pointer"
                                    onClick={() => handleSelect(index)}
                                >
                                    {item.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>                
                <div className={`flex flex-col items-center results-container mt-4 ${selectedWhiskey ? 'fade-in' : ''}`}>
                    <h2 className="text-2xl font-bold">Selected Whiskey</h2>
                        {selectedWhiskey ? <div className="transform transition-transform hover:scale-105"><Card data={selectedWhiskey}  onClick={() => handleCardClick(selectedWhiskey)}/> </div>: 
                            <div className="bg-gray-500 rounded p-4 w-full max-w-md">
                                <p>Select a whiskey to see details</p>                
                            </div>
                        }
                    </div>
            </div>
            {loading ? <Loading /> : recommendations.length > 0 && <Results recommendations={recommendations} onCardClick={handleCardClick} />}
            {showInfo && infoWhiskey && <Info whiskey={infoWhiskey} onClose={closeModal} />}
        </div>
    );
};

export default Search;