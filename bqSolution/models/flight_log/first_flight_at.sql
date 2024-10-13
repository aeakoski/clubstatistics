WITH flights_with_student_status AS (
  SELECT 
    fullname,
    flight_datum,
    nature_beskr,
    CASE 
      WHEN LOWER(nature_beskr) LIKE '%skol%' THEN TRUE
      ELSE FALSE
    END AS is_student,
    CASE 
      WHEN LOWER(nature_beskr) LIKE '%segel%' THEN "segel"
      ELSE "motor"
    END AS is_segel
  FROM `osfk-it.flight_log.flight`
)
SELECT 
  fullname AS fullname_alias,
  EXTRACT(YEAR FROM flight_datum) AS year,
  MIN(flight_datum) AS first_flight_at,
  MAX(is_student) AS is_student,
  MAX(is_segel) AS is_segel
FROM flights_with_student_status
GROUP BY fullname_alias, year
ORDER BY fullname_alias, year;