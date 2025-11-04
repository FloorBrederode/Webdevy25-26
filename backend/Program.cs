using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using WebDev.API.Configuration;
using WebDev.Core.Interfaces;
using WebDev.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

ConfigureConfiguration(builder.Configuration, builder.Environment);
ConfigureServices(builder.Services, builder.Configuration);

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

static void ConfigureServices(IServiceCollection services, ConfigurationManager configuration)
{
    services.Configure<JwtOptions>(configuration.GetSection("Jwt"));

    services.AddSingleton<IUserService, UserService>();
    services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();

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
