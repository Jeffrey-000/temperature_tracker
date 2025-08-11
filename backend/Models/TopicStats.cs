namespace MQTT.Models;

public record TopicStats(
    SensorData Current,
    Max Max,
    Min Min
);

public record Max(
    SensorData Temperature,
    SensorData Humidity
);

public record Min(
    SensorData Temperature,
    SensorData Humidity
);



// public class TopicStats {
//     public required SensorData current { get; set; }
//     public required Max max { get; set; }
//     public required Min min { get; set; }

// }

// public class Max {
//     public required SensorData temperature { get; set; }
//     public required SensorData humidity { get; set; }
// }
// public class Min {
//     public required SensorData temperature { get; set; }
//     public required SensorData humidity { get; set; }
// }