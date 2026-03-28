import React from 'react';

const FloorSelector = ({ activeFloor, setActiveFloor }) => {
    const floors = [1, 2, 3, 4, 5, 6, 7];

    return (
        <div className="flex flex-wrap gap-3 mb-8">
            {floors.map((f) => (
                <button
                    key={f}
                    onClick={() => setActiveFloor(f)}
                    className={`px-6 py-3 rounded-2xl font-bold transition-all ${
                        activeFloor === f
                            ? 'bg-indigo-600 text-white shadow-lg scale-105'
                            : 'bg-white text-gray-600 hover:bg-indigo-50 border border-gray-100'
                    }`}
                >
                    Floor {f}
                </button>
            ))}
        </div>
    );
};

export default FloorSelector;
