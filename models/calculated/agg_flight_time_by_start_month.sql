WITH first_flight AS (
  SELECT 
    *,
    CASE 
      WHEN EXTRACT(MONTH FROM first_flight_at) = 1 THEN 'Januari'
      WHEN EXTRACT(MONTH FROM first_flight_at) = 2 THEN 'Februari'
      WHEN EXTRACT(MONTH FROM first_flight_at) = 3 THEN 'Mars'
      WHEN EXTRACT(MONTH FROM first_flight_at) = 4 THEN 'April'
      WHEN EXTRACT(MONTH FROM first_flight_at) = 5 THEN 'Maj'
      WHEN EXTRACT(MONTH FROM first_flight_at) = 6 THEN 'Juni'
      WHEN EXTRACT(MONTH FROM first_flight_at) = 7 THEN 'Juli'
      WHEN EXTRACT(MONTH FROM first_flight_at) = 8 THEN 'Augusti'
      WHEN EXTRACT(MONTH FROM first_flight_at) = 9 THEN 'September'
      WHEN EXTRACT(MONTH FROM first_flight_at) = 10 THEN 'Oktober'
      WHEN EXTRACT(MONTH FROM first_flight_at) = 11 THEN 'November'
      WHEN EXTRACT(MONTH FROM first_flight_at) = 12 THEN 'December'
    END AS month_name,
    EXTRACT(MONTH FROM first_flight_at) AS month_number
  FROM `osfk-it.flight_log.first_flight_at`
),

flight_time AS (
  SELECT 
    fullname,
    EXTRACT(YEAR FROM flight_datum) AS year,
    ROUND(SUM(airborne_total), 0) AS yearly_flight_time
  FROM `osfk-it.flight_log.flight`
  GROUP BY fullname, year
)

SELECT 
  ff.year,
  ft.yearly_flight_time,
  ff.month_name AS month,
  month_number,
  ff.is_segel
FROM first_flight AS ff
LEFT JOIN flight_time AS ft 
  ON ff.year = ft.year AND ff.fullname_alias = ft.fullname;
