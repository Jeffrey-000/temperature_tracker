namespace MQTT.Models;

public record TopicStats(
    SensorData mostRecent,
    SensorData[] maxTemp,
    SensorData[] minTemp,
    SensorData[] maxHumidity,
    SensorData[] minHumidity
);

