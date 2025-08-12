namespace MQTT.Models;

public record TopicStats(
    SensorData current,
    SensorData[] maxTemp,
    SensorData[] minTemp,
    SensorData[] maxHumidity,
    SensorData[] minHumidity
);

