using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

using MQTT.Database;
using MQTT.Models;

namespace MQTT.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DataController : ControllerBase {
    private readonly PostgresService _db;

    public DataController(PostgresService db) => _db = db;

    [HttpGet("{topic}")]
    public async Task<ActionResult<IEnumerable<SensorData>>> GetData(string topic,
                                                    [FromQuery] int? limit = null,
                                                    [FromQuery] int? start = null,
                                                    [FromQuery] int? stop = null) {

        var data = await _db.GetSensorDataAsync(topic, limit, start, stop);
        return Ok(data);

    }




    [HttpGet("{topic}/statistics")]
    public async Task<ActionResult<TopicStats>> GetStats(string topic,
                                        [FromQuery] long? start = null, [FromQuery] long? end = null) {
        try {
            var result = await _db.GetStatistics(topic, start, end);
            return Ok(result);
        } catch (ArgumentException e) {
            Console.WriteLine(e);
            return NotFound(new {
                message = e.Message
            });
        } catch (NullReferenceException e) {
            return NotFound(new {
                message = e.Message
            });
        }


    }
}
