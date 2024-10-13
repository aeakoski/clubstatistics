WITH 
  logs AS (
    SELECT
      regnr,
      DATE_TRUNC(flight_datum, YEAR) AS year_start,
      flight_datum,
      airborne_total,
    FROM
      `osfk-it.flight_log.flight`
    WHERE regnr IN (
      'SE-TZY', 'SE-URG', 'SE-TVL', 'SE-UUY', 'SE-UFA', 'SE-SKZ', -- Gliders
      'SE-MLT', 'SE-MMB', 'SE-MMC', 'SE-KBT', -- Motor
      'SE-KHK', 'SE-CKB' -- Tow
    )  
  ),

  dates_array AS (
  SELECT 
    regnr,
    GENERATE_DATE_ARRAY(MIN(year_start), MAX(year_start)) AS all_dates
  FROM logs
  group by regnr
  ),

  dates AS (
    SELECT date,
    regnr
    FROM dates_array,
    UNNEST(all_dates) AS date
  ),

  all_logs AS (
    select * except(airborne_total, flight_datum, year_start, regnr),
    coalesce(logs.airborne_total, 0) AS airborne_total,
    dates.regnr
    
    from dates
    left join logs
    ON logs.flight_datum = dates.date AND logs.regnr = dates.regnr
  ),

  daily_accumulation AS (
    SELECT
      regnr,
      DATE_TRUNC(date, YEAR) AS year_start,
      date,
      airborne_total,
      SUM(airborne_total) OVER (PARTITION BY regnr, DATE_TRUNC(date, YEAR) ORDER BY date) AS accumulated_duration
    FROM
      all_logs
  )

select distinct 
  regnr,
  date,
  accumulated_duration
from daily_accumulation
order by regnr, date