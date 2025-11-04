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

        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

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