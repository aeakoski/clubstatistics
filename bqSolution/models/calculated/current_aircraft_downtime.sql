WITH last_flights AS (
  SELECT
    regnr,
    MAX(flight_datum) AS last_flight_date
  FROM
    `osfk-it.flight_log.flight`
  GROUP BY
    regnr
)

SELECT
  regnr,
  DATE_DIFF(CURRENT_DATE(), last_flight_date, DAY) AS days_since_last_flight
FROM
  last_flights
  where regnr in ("SE-MLT", "SE-KBT", "SE-MMC", "SE-MMB", "SE-CKB", "SE-KHK", "SE-URG", "SE-TZY", "SE-SKZ", "SE-UUY", "SE-UFA", "SE-TVL")
  and DATE_DIFF(CURRENT_DATE(), last_flight_date, DAY) > 8
ORDER BY
  days_since_last_flight desc;
