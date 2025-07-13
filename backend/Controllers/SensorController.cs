using Microsoft.AspNetCore.Mvc;
using MQTT.Database;
using MQTT.Models;

namespace MqttToPostgresApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SensorController : ControllerBase {
    private readonly PostgresService _db;

    public SensorController(PostgresService db) => _db = db;

    [HttpGet]
    public async Task<IEnumerable<SensorData>> Get([FromQuery] int limit = 10) =>
        await _db.GetRecentAsync(limit);
}
