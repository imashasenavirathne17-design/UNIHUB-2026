import React from 'react';
import { Box } from 'lucide-react';

const TIME_SLOTS = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
];

const RoomGrid = ({ rooms, bookings, onRoomClick, selectedDate }) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const currentHour = new Date().getHours();
    
    const isPastDate = selectedDate < todayStr;
    const isFutureDate = selectedDate > todayStr;
    const isToday = selectedDate === todayStr;

    const getBookingForSlot = (roomId, slot) => {
        return bookings.find(b => {
            if (b.roomId._id !== roomId) return false;
            const slotHour = parseInt(slot.split(':')[0]);
            const startHour = parseInt(b.startTime.split(':')[0]);
            const endHour = parseInt(b.endTime.split(':')[0]);
            return slotHour >= startHour && slotHour < endHour;
        });
    };

    return (
        <div className="bg-white rounded-[40px] p-10 shadow-soft border border-gray-100 overflow-x-auto">
            {/* Legend and Time Header */}
            <div className="flex flex-wrap items-center gap-8 mb-10 ml-0 md:ml-48">
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-md bg-indigo-500 shadow-sm"></div>
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest text-[9px]">Available</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-md bg-gray-100 shadow-sm"></div>
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest text-[9px]">Booked / Past</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-md bg-amber-300 shadow-sm"></div>
                    <span className="text-sm font-bold text-amber-400 uppercase tracking-widest text-[9px]">Maintenance</span>
                </div>
            </div>

            {/* Timeline Header */}
            <div className="flex mb-8 border-b border-gray-50 pb-6 min-w-[800px]">
                <div className="w-48 flex-shrink-0"></div>
                <div className="flex-1 flex justify-between px-2">
                    {TIME_SLOTS.map(time => (
                        <div key={time} className="text-[11px] font-black text-gray-300 w-12 text-center tracking-tighter">
                            {time}
                        </div>
                    ))}
                </div>
            </div>

            {/* Room Rows */}
            <div className="space-y-10 min-w-[800px]">
                {rooms.map((room) => (
                    <div key={room._id} className="flex items-center group">
                        {/* Room Info Section */}
                        <div className="w-48 flex-shrink-0 pr-6">
                            <h3 className="font-black text-gray-800 text-lg leading-tight group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                                {room.name}
                                {room.status === 'maintenance' && <span className="text-[10px] font-black bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full border border-amber-200">🔒</span>}
                            </h3>
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full mt-1 ${room.status === 'maintenance' ? 'bg-amber-50' : 'bg-indigo-50'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${room.status === 'maintenance' ? 'bg-amber-400' : 'bg-indigo-400'}`}></span>
                                <span className={`text-[10px] font-black uppercase tracking-wider ${room.status === 'maintenance' ? 'text-amber-500' : 'text-indigo-400'}`}>
                                    {room.status === 'maintenance' ? 'Maintenance' : room.type === 'lab' ? 'Laboratory' : 'Lecture Hall'}
                                </span>
                            </div>
                        </div>

                        {/* Slots Section */}
                        <div className="flex-1 flex justify-between gap-3 px-2">
                            {TIME_SLOTS.map(slot => {
                                const booking = getBookingForSlot(room._id, slot);
                                const isBooked = !!booking;
                                const slotHour = parseInt(slot.split(':')[0]);
                                
                                // Determine if the slot is in the past (physically)
                                const isSlotInPast = isPastDate || (isToday && slotHour < currentHour);
                                
                                return (
                                    <button
                                        key={slot}
                                        onClick={() => !isBooked && !isSlotInPast && room.status !== 'maintenance' && onRoomClick(room, slot)}
                                        disabled={isBooked || isSlotInPast || room.status === 'maintenance'}
                                        className={`relative w-full h-14 rounded-xl transition-all duration-300 ${
                                            room.status === 'maintenance'
                                                ? 'bg-amber-100 cursor-not-allowed border border-amber-200'
                                                : isBooked || isSlotInPast
                                                    ? 'bg-gray-50 cursor-not-allowed border border-gray-100/50'
                                                    : 'bg-indigo-500 hover:bg-indigo-600 shadow-sm hover:shadow-indigo-200/50 hover:-translate-y-0.5'
                                        }`}
                                        title={room.status === 'maintenance' ? 'Room under maintenance' : isBooked ? `Booked by ${booking?.lecturerName}` : isSlotInPast ? 'Past Slot' : `Available at ${slot}`}
                                    >
                                        {room.status === 'maintenance' && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-amber-400 text-sm">🔒</span>
                                            </div>
                                        )}
                                        {isBooked && room.status !== 'maintenance' && (
                                            <div className="absolute inset-x-0 bottom-1 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RoomGrid;
