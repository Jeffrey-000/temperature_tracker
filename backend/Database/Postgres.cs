using Npgsql;
using MQTT.Models;

namespace MQTT.Database;

public class PostgresService {
    private readonly string _connectionString = SECRETS.SECRETS.POSTGRES_URL;
    private readonly long _rejectTimePeriod = 60 * 60 * 24; //24hrs

    private static readonly string TABLE_TEMPLATE = @"
            CREATE TABLE IF NOT EXISTS @topic (
                id SERIAL PRIMARY KEY,
                temperature DOUBLE PRECISION,
                humidity DOUBLE PRECISION,
                time BIGINT
            );";
    public PostgresService() {
        // using var conn = new NpgsqlConnection(_connectionString);
        // conn.Open();
        // using var cmd = new NpgsqlCommand(@"
        //     CREATE TABLE IF NOT EXISTS sensor_readings (
        //         id SERIAL PRIMARY KEY,
        //         temperature DOUBLE PRECISION,
        //         humidity DOUBLE PRECISION,
        //         time BIGINT
        //     );", conn);
        // cmd.ExecuteNonQuery();
    }

    public async Task SaveSensorDataAsync(string topic, SensorData data) {
        if (topic is null) return;
        if (data.temperature == 0.0 ||
            data.temperature == 32.0 ||
            data.humidity == 0 ||
            data.time < DateTimeOffset.UtcNow.ToUnixTimeSeconds() - _rejectTimePeriod) {
            return;
        } //avoid inserting bad data into db
        topic = topic.Replace("/", "_");
        await using var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync();
        var tableExistsCmd = new NpgsqlCommand(TABLE_TEMPLATE.Replace("@topic", topic), conn); //Npg does not allow dynamic table names
        await tableExistsCmd.ExecuteNonQueryAsync();

        var cmd = new NpgsqlCommand($@"
            INSERT INTO {topic} (temperature, humidity, time)
            VALUES (@temp, @hum, @time);", conn);
        cmd.Parameters.AddWithValue("@temp", data.temperature);
        cmd.Parameters.AddWithValue("@hum", data.humidity);
        cmd.Parameters.AddWithValue("@time", data.time);

        await cmd.ExecuteNonQueryAsync();
    }

    public async Task<List<SensorData>> GetRecentAsync(string topic, int? limit, long? start, long? stop) {
        topic = topic.Replace("/", "_");
        var results = new List<SensorData>();

        await using var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync();

        using var cmd = new NpgsqlCommand($@"SELECT temperature, humidity, time FROM {topic}
                                    WHERE 1=1 
                                    AND (time >= @start OR @start IS NULL)
                                    AND (time <= @stop OR @stop IS NULL)
                                    ORDER BY time
                                    ;", conn);

        cmd.Parameters.AddWithValue("@start", (object?)start ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@stop", (object?)stop ?? DBNull.Value);

        var reader = await cmd.ExecuteReaderAsync();

        while (await reader.ReadAsync()) {
            results.Add(new SensorData {
                temperature = reader.GetDouble(0),
                humidity = reader.GetDouble(1),
                time = reader.GetInt64(2)
            });
        }

        return results;
    }

    public async Task<long> GetOldestEntry(string topic) {
        topic = topic.Replace("/", "_");
        await using var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync();

        using var cmd = new NpgsqlCommand($@"SELECT min(time) FROM {topic}
                                    ;", conn);
        var reader = await cmd.ExecuteReaderAsync();
        long results = -1;
        if (await reader.ReadAsync()) {
            if (!reader.IsDBNull(0)) {
                results = reader.GetInt64(0);
            }
        }

        return results;
    }

    public async Task<List<string>> GetTopicList() {

        var tableNames = new List<string>();

        await using var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync();

        using var cmd = new NpgsqlCommand(@"
                                SELECT table_name
                                FROM information_schema.tables
                                WHERE table_schema = 'public'
                                AND table_type = 'BASE TABLE';", conn);

        using var reader = cmd.ExecuteReader();

        while (await reader.ReadAsync()) {
            if (!reader.IsDBNull(0)) {
                tableNames.Add(reader.GetString(0));
            }
        }

        return tableNames;

    }
}
