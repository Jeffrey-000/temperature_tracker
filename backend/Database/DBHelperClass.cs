using MQTT.Models;

public static class DBHelperClass {
    private static readonly long _rejectTimePeriod = 60 * 5; // 5 mins
    public static string formatTopicForDB(this string s) {
        return s.Replace("/", "_");
    }

    public static bool isInvalidSensorData(this SensorData data) {
        return data.temperature == 0.0 ||
            data.temperature == 32.0 ||
            data.humidity == 0 ||
            data.time < DateTimeOffset.UtcNow.ToUnixTimeSeconds() - _rejectTimePeriod;
    }



    public static readonly string _magic_chatGPT_one_pass_topic_stats_sql_str = @"
    WITH ranked AS (
        SELECT
            temperature,
            humidity,
            time,
            RANK() OVER (ORDER BY time DESC)                    AS r_mostRecent,
            RANK() OVER (ORDER BY temperature DESC, time DESC)  AS r_maxTemp,
            RANK() OVER (ORDER BY temperature ASC,  time DESC)  AS r_minTemp,
            RANK() OVER (ORDER BY humidity DESC,    time DESC)  AS r_maxHumidity,
            RANK() OVER (ORDER BY humidity ASC,     time DESC)  AS r_minHumidity
        FROM temperature_humidity_data
        WHERE 1=1
            AND topic = @topic
            AND (time >= @start OR @start IS NULL)
            AND (time <= @stop OR @stop IS NULL)
    ),
combined AS (
    SELECT 'maxTemp' AS label, temperature, humidity, time
    FROM ranked
    WHERE r_maxTemp = 1

    UNION ALL
    SELECT 'minTemp', temperature, humidity, time
    FROM ranked
    WHERE r_minTemp = 1

    UNION ALL
    SELECT 'maxHumidity', temperature, humidity, time
    FROM ranked
    WHERE r_maxHumidity = 1

    UNION ALL
    SELECT 'minHumidity', temperature, humidity, time
    FROM ranked
    WHERE r_minHumidity = 1
),
aggregated AS (
    SELECT label, jsonb_agg(jsonb_build_object(
        'temperature', temperature,
        'humidity', humidity,
        'time', time
    ) ORDER BY time DESC) AS rows
    FROM combined
    GROUP BY label
),
mostRecent AS (
    SELECT jsonb_build_object(
        'temperature', temperature,
        'humidity', humidity,
        'time', time
    ) AS single_row
    FROM ranked
    WHERE r_mostRecent = 1
    LIMIT 1
)
SELECT jsonb_build_object(
    'mostRecent', (SELECT single_row FROM mostRecent),
    'maxTemp', (SELECT rows FROM aggregated WHERE label = 'maxTemp'),
    'minTemp', (SELECT rows FROM aggregated WHERE label = 'minTemp'),
    'maxHumidity', (SELECT rows FROM aggregated WHERE label = 'maxHumidity'),
    'minHumidity', (SELECT rows FROM aggregated WHERE label = 'minHumidity')
) AS result;

";
}