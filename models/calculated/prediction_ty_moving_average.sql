WITH two_years_data AS (
    SELECT
        flight_datum,
        COALESCE(SUM(airborne_total), 0) AS daily_airborne_total
    FROM
        osfk-it.flight_log.flight
    WHERE
        flight_datum >= DATE_SUB(CURRENT_DATE(), INTERVAL 2 YEAR)
    GROUP BY
        flight_datum
),

old_dates AS (
    SELECT 
        flight_datum,
        null AS predicted_accumulated_total
    FROM two_years_data 
),

daily_accumulated AS (
    SELECT
        flight_datum,
        COALESCE(SUM(daily_airborne_total) OVER (
            PARTITION BY EXTRACT(YEAR FROM flight_datum)
            ORDER BY flight_datum
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ), 0) AS accumulated_airborne_total
    FROM
        two_years_data
),

daily_moving_average AS (
    SELECT
        flight_datum,
        AVG(accumulated_airborne_total) OVER (
            PARTITION BY EXTRACT(YEAR FROM flight_datum)
            ORDER BY flight_datum
            ROWS BETWEEN 21 PRECEDING AND CURRENT ROW
        ) AS moving_avg_accumulated_total
    FROM
        daily_accumulated
),
max_old_date AS (
    SELECT
        MAX(flight_datum) AS max_date
    FROM
        old_dates
),

remaining_days AS (
    SELECT
        DATE_ADD(m.max_date, INTERVAL day_number DAY) AS flight_datum
    FROM
        max_old_date m,
        UNNEST(GENERATE_ARRAY(1, DATE_DIFF(LAST_DAY(m.max_date, YEAR), m.max_date, DAY))) AS day_number
),

joined_data AS (
    SELECT
        r.flight_datum,
        d.moving_avg_accumulated_total
    FROM
        remaining_days r
    LEFT JOIN
        daily_moving_average d
    ON
        DATE_SUB(r.flight_datum, INTERVAL 1 YEAR) = d.flight_datum
),

extrapolated_predictions AS (
    SELECT
        flight_datum,
        LAST_VALUE(moving_avg_accumulated_total IGNORE NULLS) OVER (
            ORDER BY flight_datum ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS predicted_accumulated_total
    FROM
        joined_data
),

first_predicted_accumulated_total AS (
    select predicted_accumulated_total from extrapolated_predictions 
    where flight_datum = (select DATE_ADD(max_date, INTERVAL 1 DAY) from max_old_date)
),

latest_accumulated_flight_time AS (
    select accumulated_airborne_total from daily_accumulated 
    where flight_datum = (select * from max_old_date)
)

SELECT
    flight_datum,
    NULL AS accumulated_airborne_total,
    predicted_accumulated_total - (select * from first_predicted_accumulated_total) + (select * from latest_accumulated_flight_time) AS predicted_accumulated_total
FROM
    extrapolated_predictions
UNION ALL 
select 
    flight_datum,
    accumulated_airborne_total,
    NULL AS predicted_accumulated_total
from daily_accumulated
ORDER BY
    flight_datum;