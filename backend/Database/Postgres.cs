using Npgsql;
using MQTT.Models;

namespace MQTT.Database;

public class PostgresService {
    private readonly string _connectionString = Environment.GetEnvironmentVariable("POSTGRES_URL");
    public PostgresService() {
        using var conn = new NpgsqlConnection(_connectionString);
        conn.Open();
        using var cmd = new NpgsqlCommand(@"
            CREATE TABLE IF NOT EXISTS sensor_readings (
                id SERIAL PRIMARY KEY,
                temperature DOUBLE PRECISION,
                humidity DOUBLE PRECISION,
                time BIGINT
            );", conn);
        cmd.ExecuteNonQuery();
    }

    public async Task SaveSensorDataAsync(SensorData data) {
        await using var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync();

        var cmd = new NpgsqlCommand(@"
            INSERT INTO sensor_readings (temperature, humidity, time)
            VALUES (@temp, @hum, @time);", conn);

        cmd.Parameters.AddWithValue("temp", data.temperature);
        cmd.Parameters.AddWithValue("hum", data.humidity);
        cmd.Parameters.AddWithValue("time", data.time);

        await cmd.ExecuteNonQueryAsync();
    }

    public async Task<List<SensorData>> GetRecentAsync(int? limit, long? start, long? stop) {
        var results = new List<SensorData>();

        await using var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync();

        using var cmd = new NpgsqlCommand(@"SELECT temperature, humidity, time FROM sensor_readings 
                                    WHERE 1=1 
                                    AND (time >= @start OR @start IS NULL)
                                    AND (time <= @stop OR @stop IS NULL)
                                    ORDER BY time DESC 
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

    public async Task<long> GetOldestEntry() {
        await using var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync();

        using var cmd = new NpgsqlCommand(@"SELECT min(time) FROM sensor_readings
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
}
