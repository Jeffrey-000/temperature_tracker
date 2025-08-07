using MQTT;
using MQTT.Database;
DotNetEnv.Env.Load();

int PORT = 11696;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.ConfigureKestrel(options => {
    options.ListenAnyIP(PORT);
});
builder.Services.AddSingleton<PostgresService>();
builder.Services.AddHostedService<MqttListenerService>();
builder.Services.AddControllers();
builder.Services.AddCors(options => {
    options.AddPolicy("AllowFrontend", policy => {
        policy.WithOrigins("http://next").AllowAnyHeader().AllowAnyMethod();
    });
});
var app = builder.Build();
app.UseCors("AllowFrontend");
app.MapControllers();

app.Run();

