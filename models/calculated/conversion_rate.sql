WITH segel_flights AS (
  SELECT fullname, MIN(flight_datum) AS first_segel_flight
  FROM `osfk-it.flight_log.flight`
  WHERE nature_beskr LIKE "%SEGEL%"
  GROUP BY fullname
),

motor_skolning_flights AS (
  SELECT fullname, MIN(flight_datum) AS first_motor_skolning_flight
  FROM `osfk-it.flight_log.flight`
  WHERE nature_beskr LIKE "%MOTOR%" AND nature_beskr LIKE "%SKOL%"
  GROUP BY fullname
),
converters AS (
  SELECT DISTINCT s.fullname, extract(year from m.first_motor_skolning_flight) as year
  FROM segel_flights s
  inner JOIN motor_skolning_flights m ON s.fullname = m.fullname
  WHERE m.first_motor_skolning_flight > s.first_segel_flight

)

select year, count(fullname) as `new_motor_from_gliding`
from converters
group by year
order by year