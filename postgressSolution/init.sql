-- Create the FlightLog table
CREATE TABLE FlightLog (
    flight_datum DATE,
    ac_id INT,
    regnr VARCHAR(10),
    fullname VARCHAR(255),
    departure VARCHAR(255),
    via VARCHAR(255),
    arrival VARCHAR(255),
    block_start TIME,
    block_end TIME,
    block_total DECIMAL,
    airborne_start TIME,
    airborne_end TIME,
    airborne_total DECIMAL,
    tach_start DECIMAL,
    tach_end DECIMAL,
    tach_total DECIMAL,
    flights INT,
    distance DECIMAL,
    nature_beskr VARCHAR(255),
    comment VARCHAR(255),
    rowID INT PRIMARY KEY
);
