using Npgsql;
using MQTT.Models;

namespace MQTT.Database;

public class PostgresService {
    private readonly string _connectionString = SECRETS.SECRETS.POSTGRES_URL;
    private const int _defaultDBLimit = 10 * 60 * 24;
    private List<string> _existingTopics;
    public PostgresService() {
        _existingTopics = new List<string>();
        using var conn = new NpgsqlConnection(_connectionString);
        conn.Open();

        using var createTable_cmd = new NpgsqlCommand(@"
            CREATE TABLE IF NOT EXISTS temperature_humidity_data (
                id SERIAL PRIMARY KEY,
                temperature DOUBLE PRECISION,
                humidity DOUBLE PRECISION,
                time BIGINT,
                topic TEXT
            );", conn);
        createTable_cmd.ExecuteNonQuery();

        using var existingTopics_cmd = new NpgsqlCommand(@"
                            SELECT DISTINCT topic
                            FROM temperature_humidity_data
                            ;", conn);

        using var reader = existingTopics_cmd.ExecuteReader();

        while (reader.Read()) {
            if (!reader.IsDBNull(0)) {
                _existingTopics.Add(reader.GetString(0));
            }
        }
    }


    public async Task SaveSensorDataAsync(string topic, SensorData data) {
        if (topic is null || data.isInvalidSensorData()) {
            return;
        }
        if (!_existingTopics.Contains(topic)) {
            _existingTopics.Add(topic);
        }

        await using var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync();

        var cmd = new NpgsqlCommand($@"
            INSERT INTO temperature_humidity_data (temperature, humidity, time, topic)
            VALUES (@temp, @hum, @time, @topic);", conn);
        cmd.Parameters.AddWithValue("@temp", data.temperature);
        cmd.Parameters.AddWithValue("@hum", data.humidity);
        cmd.Parameters.AddWithValue("@time", data.time);
        cmd.Parameters.AddWithValue("@topic", topic);
        await cmd.ExecuteNonQueryAsync();
    }

    public async Task<List<SensorData>> GetSensorDataAsync(string topic, int? limit, long? start, long? stop) {
        var results = new List<SensorData>();
        await using var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync();

        string sql;
        if (limit is not null || (start is null && stop is null)) {
            sql = $@"SELECT temperature, humidity, time FROM temperature_humidity_data
                                    WHERE 1=1 
                                    AND topic = @topic
                                    AND (time >= @start OR @start IS NULL)
                                    AND (time <= @stop OR @stop IS NULL)
                                    ORDER BY time
                                    LIMIT @limit
                                    ;";
        } else {
            sql = $@"SELECT temperature, humidity, time FROM temperature_humidity_data
                                    WHERE 1=1 
                                    AND topic = @topic
                                    AND (time >= @start OR @start IS NULL)
                                    AND (time <= @stop OR @stop IS NULL)
                                    ORDER BY time
                                    ;";
        }
        using var cmd = new NpgsqlCommand(sql, conn);
        if (limit is not null || (start is null && stop is null)) {
            limit = limit ?? _defaultDBLimit;
            cmd.Parameters.AddWithValue("@limit", limit);
        }

        cmd.Parameters.AddWithValue("@start", (object?)start ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@stop", (object?)stop ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@topic", topic);

        await using var reader = await cmd.ExecuteReaderAsync();

        while (await reader.ReadAsync()) {
            results.Add(new SensorData(
              reader.GetDouble(0),
            reader.GetDouble(1),
              reader.GetInt64(2)
            ));
        }

        return results;
    }

    public async Task<TopicMetaDataDto> GetTopicMetaDataAsync(string topic) {
        if (!_existingTopics.Contains(topic)) {
            throw new ArgumentException($"Topic {topic} does not exist");
        }
        await using var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync();

        using var cmd = new NpgsqlCommand($@"SELECT MIN(time), MAX(time) FROM temperature_humidity_data
                                            WHERE topic = @topic
                                    ;", conn);
        cmd.Parameters.AddWithValue("@topic", topic);
        await using var reader = await cmd.ExecuteReaderAsync();
        long min = 0;
        long max = 0;
        if (await reader.ReadAsync()) {
            if (!reader.IsDBNull(0)) {
                min = reader.GetInt64(0);

            }
            if (!reader.IsDBNull(1)) {
                max = reader.GetInt64(1);
            }
        }

        return new TopicMetaDataDto(min, max);
    }

    public async Task<List<string>> GetTopicsAsync() {

        var tableNames = new List<string>();

        await using var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync();

        using var cmd = new NpgsqlCommand(@"
                            SELECT DISTINCT topic
                            FROM temperature_humidity_data
                            ;", conn);

        await using var reader = await cmd.ExecuteReaderAsync();

        while (await reader.ReadAsync()) {
            if (!reader.IsDBNull(0)) {
                tableNames.Add(reader.GetString(0));
            }
        }

        return tableNames;

    }

    public async Task<string> GetStatistics(string topic, long? start, long? stop) {
        if (!_existingTopics.Contains(topic)) {
            throw new ArgumentException($"Topic {topic} does not exist");
        }
        await using var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync();
        using var cmd = new NpgsqlCommand(DBHelperClass._magic_chatGPT_one_pass_topic_stats_sql_str, conn);
        cmd.Parameters.AddWithValue("@topic", topic);
        cmd.Parameters.AddWithValue("@start", (object?)start ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@stop", (object?)stop ?? DBNull.Value);

        var jason = (await cmd.ExecuteScalarAsync())?.ToString();

        if (string.IsNullOrEmpty(jason)) {
            throw new NullReferenceException("DB did not return a valid json.");
        }

        return jason;
    }


}
