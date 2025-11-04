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
    public WebDevDbContext(DbContextOptions<WebDevDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<Event> Events => Set<Event>();
    public DbSet<Team> Teams => Set<Team>();
    public DbSet<Booking> Bookings => Set<Booking>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).HasMaxLength(200).IsRequired();
            entity.Property(e => e.FirstName).HasMaxLength(100).IsRequired();
            entity.Property(e => e.LastName).HasMaxLength(100).IsRequired();
            entity.Property(e => e.JobTitle).HasMaxLength(150);
            entity.Property(e => e.Role).HasMaxLength(50);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        builder.Entity<Room>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(150).IsRequired();
            entity.Property(e => e.OpeningTimes).HasMaxLength(200);
            entity.Property(e => e.Capacity).IsRequired();
        });

        builder.Entity<Event>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Location).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Organizer).HasMaxLength(150);

            var guidListConverter = new ValueConverter<List<Guid>, string>(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                v => string.IsNullOrWhiteSpace(v)
                    ? new List<Guid>()
                    : JsonSerializer.Deserialize<List<Guid>>(v, (JsonSerializerOptions?)null) ?? new List<Guid>());

            var guidListComparer = new ValueComparer<List<Guid>>(
                (l1, l2) =>
                    (l1 ?? new List<Guid>()).SequenceEqual(l2 ?? new List<Guid>()),
                l => (l ?? new List<Guid>()).Aggregate(0, (hash, guid) => HashCode.Combine(hash, guid.GetHashCode())),
                l => (l ?? new List<Guid>()).ToList());

            entity.Property(e => e.Attendees)
                .HasColumnType("nvarchar(max)")
                .HasConversion(guidListConverter);

            entity.Property(e => e.Attendees).Metadata.SetValueComparer(guidListComparer);
        });

        builder.Entity<Team>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(150).IsRequired();
            entity.Property(e => e.Members).IsRequired();
        });

        builder.Entity<Booking>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Location).HasMaxLength(200).IsRequired();

            var bookingGuidListConverter = new ValueConverter<List<Guid>, string>(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                v => string.IsNullOrWhiteSpace(v)
                    ? new List<Guid>()
                    : JsonSerializer.Deserialize<List<Guid>>(v, (JsonSerializerOptions?)null) ?? new List<Guid>());

            var bookingGuidListComparer = new ValueComparer<List<Guid>>(
                (l1, l2) =>
                    (l1 ?? new List<Guid>()).SequenceEqual(l2 ?? new List<Guid>()),
                l => (l ?? new List<Guid>()).Aggregate(0, (hash, guid) => HashCode.Combine(hash, guid.GetHashCode())),
                l => (l ?? new List<Guid>()).ToList());

            entity.Property(e => e.Attendees)
                .HasColumnType("nvarchar(max)")
                .HasConversion(bookingGuidListConverter);

            entity.Property(e => e.Attendees).Metadata.SetValueComparer(bookingGuidListComparer);
        });
    }
}
