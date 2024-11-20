WITH flight_dates AS (
    SELECT
        DISTINCT 
        fullname AS pilot_name,
        DATE(flight_datum) AS flight_date
    FROM
        `osfk-it.flight_log.flight`
),
date_differences AS (
    SELECT
        pilot_name,
        flight_date,
        LAG(flight_date) OVER (PARTITION BY pilot_name ORDER BY flight_date) AS previous_flight_date
    FROM
        flight_dates
),
daily_differences AS (
    SELECT
        pilot_name,
        EXTRACT(YEAR FROM flight_date) AS year,
        EXTRACT(MONTH FROM flight_date) AS month,
        DATE_DIFF(flight_date, previous_flight_date, DAY) AS days_since_last_flight
    FROM
        date_differences
    WHERE
        previous_flight_date IS NOT NULL
),

first_flight AS (
  SELECT DISTINCT
    pilot_name, 
    year
  FROM daily_differences
  QUALIFY ROW_NUMBER() OVER (PARTITION BY pilot_name ORDER BY year) = 1
),

daily_diff_filtered AS (
  SELECT dd.* FROM daily_differences AS dd
  INNER JOIN first_flight AS ff ON dd.pilot_name = ff.pilot_name AND dd.year != ff.year  
),

average_days_since_last_flight AS (
  SELECT year, month, AVG(days_since_last_flight) AS avg_days_since_last_flight 
  FROM daily_diff_filtered
  GROUP BY year, month
)

SELECT
    *
FROM
    average_days_since_last_flight
ORDER BY
    year, month;
