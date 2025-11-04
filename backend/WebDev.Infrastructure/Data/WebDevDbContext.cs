using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using WebDev.Core.Models;

namespace WebDev.Infrastructure.Data
{
    public class WebDevDbContext : IdentityDbContext<IdentityUser>
    {
        public WebDevDbContext(DbContextOptions<WebDevDbContext> options)
            : base(options)
        {
        }

        public DbSet<ParkingLot> ParkingLots { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<Session> Sessions { get; set; }
        public DbSet<Vehicle> Vehicles { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<ParkingLot>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Location).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Address).IsRequired().HasMaxLength(500);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.Latitude).IsRequired().HasColumnType("float");
                entity.Property(e => e.Longitude).IsRequired().HasColumnType("float");

                entity.HasMany(e => e.Reservations)
                    .WithOne(r => r.ParkingLot)
                    .HasForeignKey(r => r.ParkingLotId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(e => e.Sessions)
                    .WithOne(s => s.ParkingLot)
                    .HasForeignKey(s => s.ParkingLotId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            builder.Entity<Payment>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.TransactionAmount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Initiator).HasMaxLength(200);
                entity.Property(e => e.Hash).HasMaxLength(256);
                entity.Property(e => e.TransactionMethod).HasMaxLength(50);
                entity.Property(e => e.TransactionIssuer).HasMaxLength(100);
                entity.Property(e => e.TransactionBank).HasMaxLength(100);


                entity.HasOne(p => p.Reservation)
                    .WithOne(r => r.Payment)
                    .HasForeignKey<Payment>(p => p.ReservationId)
                    .OnDelete(DeleteBehavior.Cascade);
                    
                entity.HasOne(p => p.User)
                    .WithMany(u => u.Payments)
                    .HasForeignKey(p => p.Initiator)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            builder.Entity<Reservation>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Status).HasMaxLength(50);
                entity.Property(e => e.Cost).HasColumnType("decimal(18,2)");

                entity.HasOne(r => r.User)
                    .WithMany(u => u.Reservations)
                    .HasForeignKey(r => r.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(r => r.Vehicle)
                    .WithMany()
                    .HasForeignKey(r => r.VehicleId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(r => r.ParkingLot)
                    .WithMany(p => p.Reservations)
                    .HasForeignKey(r => r.ParkingLotId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            builder.Entity<Session>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.PaymentStatus).HasMaxLength(50);
                entity.Property(e => e.Price).HasColumnType("decimal(18,2)");

                entity.HasOne(s => s.User)
                    .WithMany(u => u.Sessions)
                    .HasForeignKey(s => s.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(s => s.ParkingLot)
                    .WithMany(p => p.Sessions)
                    .HasForeignKey(s => s.ParkingLotId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            builder.Entity<Vehicle>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.LicensePlate).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Make).HasMaxLength(100);
                entity.Property(e => e.Model).HasMaxLength(100);
                entity.Property(e => e.Color).HasMaxLength(50);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

                entity.HasOne(v => v.User)
                    .WithMany(u => u.Vehicles)
                    .HasForeignKey(v => v.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.Username).HasMaxLength(100).IsRequired();
                entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
                entity.Property(e => e.Email).HasMaxLength(200).IsRequired();
                entity.Property(e => e.PhoneNumber).HasMaxLength(20);
                entity.Property(e => e.Role).HasMaxLength(50);
                entity.Property(e => e.IsActive).HasDefaultValue(true);

                entity.HasMany(u => u.Vehicles)
                    .WithOne(v => v.User)
                    .HasForeignKey(v => v.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(u => u.Reservations)
                    .WithOne(r => r.User)
                    .HasForeignKey(r => r.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(u => u.Sessions)
                    .WithOne(s => s.User)
                    .HasForeignKey(s => s.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(u => u.Payments)
                    .WithOne(p => p.User)
                    .HasForeignKey(p => p.Initiator)
                    .OnDelete(DeleteBehavior.Restrict);

            });
        }
    }
}