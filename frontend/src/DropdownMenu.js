import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./datepicker.css";

const DropdownMenu = ({ range, setRange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Day");
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Format Date as yyyymmdd
  const formatDateToYYYYMMDD = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  
    // Check if the selected date is today
    const today = new Date();
    const isToday =
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();
  
    if (isToday) {
      setRange("day"); // Set range to "day" if the selected date is today
    } else {
      setRange(formatDateToYYYYMMDD(date)); // Otherwise, set range to the formatted date
    }
  };

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000);
    handleDateChange(newDate);
    setSelectedOption("Day");
  };

  const handleNextDay = () => {
    const today = new Date();
    const newDate = new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000);
  
    // Prevent going past today
    if (newDate <= today) {
      handleDateChange(newDate);
    }
    setSelectedOption("Day");
  };

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    switch (option) {
      case "Day":
        setRange("day");
        setSelectedDate(new Date());
        break;
      case "Last Week":
        setRange("7");
        break;
      case "Last Month":
        setRange("30");
        break; 
      default:
        console.error("Invalid option selected");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "25px", alignItems: "center" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0px" }}>
          {/* Previous Button */}
          <button
            onClick={handlePreviousDay}
            style={{
              background: "#333",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              padding: "5px 10px",
            }}
          >
            &lt;
          </button>

          {/* DatePicker */}
          <DatePicker
            selected={selectedDate}
            onChange={(date) => handleDateChange(date)}
            dateFormat="dd.MM.yyyy"
            className="custom-date-input"
            popperPlacement="bottom"
            maxDate={new Date()} // Restrict to today and earlier
          />

          {/* Next Button */}
          <button
            onClick={handleNextDay}
            style={{
              background: "#333",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              padding: "5px 10px",
            }}
          >
            &gt;
          </button>
        </div>
      </div>

      <div style={{ position: "relative", width: "90px" }}>
        {/* Dropdown Button */}
        <button
          onClick={toggleDropdown}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "120%",
            padding: "10px",
            cursor: "pointer",
            background: "#333",
            color: "#fff",
            fontWeight: "bold",
            borderRadius: "5px",
            border: "0px solid #626262",
          }}
        >
          <div>{selectedOption}</div>
          <div>▼</div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <ul
            style={{
              position: "absolute",
              top: "100%",
              left: "0",
              width: "120%",
              background: "#333",
              color: "#fff",
              fontWeight: "bold",
              borderRadius: "5px",
              listStyle: "none",
              padding: "0",
              margin: "0",
              zIndex: "10",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            {["Day", "Last Week", "Last Month"].map((option, index) => (
              <li
                key={index}
                onClick={() => handleOptionClick(option)}
                style={{
                  padding: "10px",
                  cursor: "pointer",
                  borderBottom: index !== 2 ? "1px solid #444" : "none",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#444")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
              >
                {option}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DropdownMenu;
