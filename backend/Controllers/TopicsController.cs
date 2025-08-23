using Microsoft.AspNetCore.Mvc;

using MQTT.Database;
using MQTT.Models;

namespace MQTT.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TopicsController : ControllerBase {
    private readonly PostgresService _db;

    public TopicsController(PostgresService db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<string>>> Get() {
        var topics = await _db.GetTopicsAsync();

        if (topics == null || !topics.Any()) {
            return NotFound(new {
                message = "No topics found."
            });
        }
        return Ok(topics);
    }


    [HttpGet("{topic}/metadata")]
    public async Task<ActionResult<TopicMetaDataDto>> GetTopicMetadata(string topic) {
        try {
            var metaData = await _db.GetTopicMetaDataAsync(topic);
            return Ok(metaData);
        } catch (ArgumentException e) {
            Console.WriteLine(e);
            return NotFound(new {
                message = e.Message
            });
        }
    }

}
