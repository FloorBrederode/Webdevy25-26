using System.IO;
using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using WebDev.API.Configuration;
using WebDev.Core.Interfaces;
using WebDev.Infrastructure.Data;
using WebDev.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

ConfigureConfiguration(builder.Configuration, builder.Environment);
ConfigureServices(builder.Services, builder.Configuration, builder.Environment);

var app = builder.Build();

ConfigureMiddleware(app);

app.Run();

static void ConfigureConfiguration(ConfigurationManager configuration, IHostEnvironment environment)
{
    if (environment.IsDevelopment())
    {
        configuration
            .AddEnvironmentVariables()
            .AddJsonFile("appsettings.Development.json", optional: true);
    }
}

static void ConfigureServices(IServiceCollection services, ConfigurationManager configuration, IHostEnvironment environment)
{
    services.Configure<JwtOptions>(configuration.GetSection("Jwt"));
    services.Configure<SmtpOptions>(configuration.GetSection("Smtp"));
    services.Configure<FrontendOptions>(configuration.GetSection("Frontend"));

    var connectionString = ResolveConnectionString(configuration, environment);
    services.AddDbContext<WebDevDbContext>(options => options.UseSqlite(connectionString));

    services.AddScoped<IUserService, UserService>();
    services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
    services.AddScoped<IRoomAvailabilityService, RoomAvailabilityService>();
    services.AddSingleton<IPasswordResetStore, InMemoryPasswordResetStore>();
    services.AddScoped<IEmailSender, SmtpEmailSender>();
    services.AddScoped(typeof(IRepository<>), typeof(Repository<>));


    ConfigureAuthentication(services, configuration);

    services.AddAuthorization();
    services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
            });

    // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
    services.AddOpenApi();
}

static string ResolveConnectionString(ConfigurationManager configuration, IHostEnvironment environment)
{
    var configuredConnection = configuration.GetConnectionString("DefaultConnection");
    if (!string.IsNullOrWhiteSpace(configuredConnection))
    {
        return configuredConnection.Replace(
            "{ContentRoot}",
            environment.ContentRootPath,
            StringComparison.OrdinalIgnoreCase);
    }

    var databasePath = Path.GetFullPath(Path.Combine(environment.ContentRootPath, "..", "Database", "database.db"));
    return $"Data Source={databasePath}";
}

static void ConfigureAuthentication(IServiceCollection services, ConfigurationManager configuration)
{
    services
        .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            var jwtOptions = configuration.GetSection("Jwt").Get<JwtOptions>()
                ?? throw new InvalidOperationException("Jwt options are not configured.");

            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = jwtOptions.Issuer,
                ValidateAudience = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Key)),
                ValidateLifetime = true
            };
        });
}

static void ConfigureMiddleware(WebApplication app)
{
    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
    }

    app.UseHttpsRedirection();
    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();
}
