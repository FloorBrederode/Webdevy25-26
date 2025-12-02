using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using WebDev.Core.Models;

namespace WebDev.Infrastructure.Data;

public class WebDevDbContext : DbContext
{
    private static readonly ValueConverter<UserRole, string> UserRoleConverter = new(
        role => role.ToString().ToLowerInvariant(),
        value => ParseUserRole(value));

    private static readonly ValueConverter<List<int>, string> IntListConverter = new(
        v => JsonSerializer.Serialize(v ?? new List<int>(), (JsonSerializerOptions?)null),
        v => string.IsNullOrWhiteSpace(v)
            ? new List<int>()
            : JsonSerializer.Deserialize<List<int>>(v, (JsonSerializerOptions?)null) ?? new List<int>());

    private static readonly ValueComparer<List<int>> IntListComparer = new(
        (l1, l2) => (l1 ?? new List<int>()).SequenceEqual(l2 ?? new List<int>()),
        l => (l ?? new List<int>()).Aggregate(0, (hash, value) => HashCode.Combine(hash, value)),
        l => (l ?? new List<int>()).ToList());

    public WebDevDbContext(DbContextOptions<WebDevDbContext> options)
        : base(options)
    {
    }

    public DbSet<Company> Companies => Set<Company>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<Event> Events => Set<Event>();
    public DbSet<Team> Teams => Set<Team>();
    public DbSet<Attendee> Attendees => Set<Attendee>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        ConfigureCompany(builder);
        ConfigureUser(builder);
        ConfigureRoom(builder);
        ConfigureTeam(builder);
        ConfigureEvent(builder);
        ConfigureAttendee(builder);
    }

    private static void ConfigureCompany(ModelBuilder builder)
    {
        builder.Entity<Company>(entity =>
        {
            entity.ToTable("company");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name").IsRequired();
            entity.Property(e => e.Address).HasColumnName("address");
        });
    }

    private static void ConfigureUser(ModelBuilder builder)
    {
        builder.Entity<User>(entity =>
        {
            entity.ToTable("user");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name").IsRequired();
            entity.Property(e => e.Email).HasColumnName("email").IsRequired();
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.CompanyId).HasDatabaseName("idx_user_company");
            entity.Property(e => e.PhoneNumber).HasColumnName("phone_number");
            entity.Property(e => e.PasswordHash).HasColumnName("password_hash").IsRequired();
            entity.Property(e => e.JobTitle).HasColumnName("job_title");
            entity.Property(e => e.CompanyId).HasColumnName("company_id");
            entity.Property(e => e.Role)
                .HasColumnName("role")
                .HasConversion(UserRoleConverter)
                .IsRequired();

            entity.HasOne(e => e.Company)
                .WithMany(c => c.Users)
                .HasForeignKey(e => e.CompanyId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }

    private static void ConfigureRoom(ModelBuilder builder)
    {
        builder.Entity<Room>(entity =>
        {
            entity.ToTable("room");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Capacity).HasColumnName("capacity");
            entity.Property(e => e.Location).HasColumnName("location");
            entity.Property(e => e.CompanyId).HasColumnName("company_id").IsRequired();
            entity.HasIndex(e => e.CompanyId).HasDatabaseName("idx_room_company");

            entity.HasOne(e => e.Company)
                .WithMany(c => c.Rooms)
                .HasForeignKey(e => e.CompanyId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }

    private static void ConfigureTeam(ModelBuilder builder)
    {
        builder.Entity<Team>(entity =>
        {
            entity.ToTable("team");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name").IsRequired();
            entity.Property(e => e.LeadId).HasColumnName("lead_id");

            entity.Property(e => e.MemberIds)
                .HasColumnName("member_ids")
                .HasConversion(IntListConverter);

            entity.Property(e => e.MemberIds).Metadata.SetValueComparer(IntListComparer);

            entity.HasOne(e => e.Lead)
                .WithMany()
                .HasForeignKey(e => e.LeadId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }

    private static void ConfigureEvent(ModelBuilder builder)
    {
        builder.Entity<Event>(entity =>
        {
            entity.ToTable("event");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name").IsRequired();
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.StartTime).HasColumnName("start_time").IsRequired();
            entity.Property(e => e.EndTime).HasColumnName("end_time").IsRequired();
            entity.Property(e => e.OrganizerId).HasColumnName("organizer_id");
            entity.HasIndex(e => e.OrganizerId).HasDatabaseName("idx_event_organizer");
            entity.HasIndex(e => e.StartTime).HasDatabaseName("idx_event_start_time");

            entity.Property(e => e.RoomIds)
                .HasColumnName("room_ids")
                .HasConversion(IntListConverter);

            entity.Property(e => e.RoomIds).Metadata.SetValueComparer(IntListComparer);

            entity.HasOne(e => e.Organizer)
                .WithMany()
                .HasForeignKey(e => e.OrganizerId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasMany(e => e.Attendees)
                .WithOne(a => a.Event)
                .HasForeignKey(a => a.EventId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }

    private static void ConfigureAttendee(ModelBuilder builder)
    {
        builder.Entity<Attendee>(entity =>
        {
            entity.ToTable("attendee");
            entity.HasKey(a => a.Id);

            entity.Property(a => a.Id).HasColumnName("attendence_id");
            entity.Property(a => a.EventId).HasColumnName("event_id").IsRequired();
            entity.Property(a => a.UserId).HasColumnName("user_id").IsRequired();

            entity.HasIndex(a => a.EventId).HasDatabaseName("idx_attendee_event");
            entity.HasIndex(a => a.UserId).HasDatabaseName("idx_attendee_user");

            entity.HasOne(a => a.User)
                .WithMany()
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }

    private static UserRole ParseUserRole(string? value) =>
        Enum.TryParse<UserRole>(value, true, out var parsed) ? parsed : UserRole.Staff;
}
