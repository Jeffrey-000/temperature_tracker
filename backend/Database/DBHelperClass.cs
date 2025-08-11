using MQTT.Models;

public static class DBHelperClass {
    private static readonly long _rejectTimePeriod = 60 * 60 * 24; //~24 hrs
    public static string formatTopicForDB(this string s) {
        return s.Replace("/", "_");
    }

    public static bool isValidSensorData(this SensorData data) {
        return data.temperature == 0.0 ||
            data.temperature == 32.0 ||
            data.humidity == 0 ||
            data.time < DateTimeOffset.UtcNow.ToUnixTimeSeconds() - _rejectTimePeriod;
    }
}