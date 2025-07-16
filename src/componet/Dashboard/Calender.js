import React, { useState, useEffect } from "react";

const CalendarComponent = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
 
  const generateDaysForCurrentWeek = () => {
    const days = [];
    const today = currentDate.getDate();
    const currentDayOfWeek = currentDate.getDay(); 
    
  
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(today - currentDayOfWeek);

   
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      
      days.push({
        day: day.getDate(),
        isToday: day.toDateString() === currentDate.toDateString(),
        dayOfWeek: day.getDay(), 
      });
    }

    return days;
  };

  const days = generateDaysForCurrentWeek();

  return (
    <div>
      <div className="calendar-header">
        <div className="month-year">
          {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}
        </div>
      </div>
     
      <div className="calendar-weekdays">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
          <div key={index} className="calendar-weekday">
            {day}
          </div>
        ))}
      </div>     
      <div className="calendar-days-row">
        {days.map((day, index) => (
          <div
            key={index}
            className={`calendar-day ${day.isToday ? "highlighted" : ""}`}
          >
            {day.day}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarComponent;
