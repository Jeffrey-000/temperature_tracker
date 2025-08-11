using Microsoft.AspNetCore.Diagnostics;

using MQTT.Database;


int PORT = 11696;
Console.WriteLine($"Starting server: {DateTime.Now:f}\n");


var builder = WebApplication.CreateBuilder(args);
builder.WebHost.ConfigureKestrel(options => {
    options.ListenAnyIP(PORT);
});
builder.Services.AddSingleton<PostgresService>();
builder.Services.AddHostedService<MqttListenerService>();
builder.Services.AddControllers();

var app = builder.Build();
var logger = app.Services.GetRequiredService<ILogger<Program>>();
app.MapControllers();

app.UseExceptionHandler(errorApp => { //global exveption handler
    errorApp.Run(async context => {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";

        var errorFeature = context.Features.Get<IExceptionHandlerFeature>();
        if (errorFeature != null) {
            var exception = errorFeature.Error;
            logger.LogError(exception, "Unhandled exception occurred.");

            var err = new {
                message = "An internal server error occurred."
            };
            await context.Response.WriteAsJsonAsync(err);
        }
    });
});


app.Run();

