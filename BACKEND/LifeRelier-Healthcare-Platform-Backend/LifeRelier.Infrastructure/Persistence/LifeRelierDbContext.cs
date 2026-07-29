using LifeRelier.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Text.Json;

namespace LifeRelier.Infrastructure.Persistence;

public class LifeRelierDbContext : DbContext
{
    public LifeRelierDbContext(DbContextOptions<LifeRelierDbContext> options) : base(options)
    {
    }

    public DbSet<Prescription> Prescriptions { get; set; }
    public DbSet<PrescriptionMedicine> PrescriptionMedicines { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Prescription entity mapping
        modelBuilder.Entity<Prescription>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.DoctorName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.HospitalName).HasMaxLength(300);
            entity.Property(e => e.PatientName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Diagnosis).HasMaxLength(500);

            // Serialize List<string> Warnings into a JSON string database column
            entity.Property(e => e.Warnings)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>()
                );
        });

        // Configure PrescriptionMedicine mapping
        modelBuilder.Entity<PrescriptionMedicine>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(250);
            entity.Property(e => e.Strength).HasMaxLength(100);
            entity.Property(e => e.Dosage).HasMaxLength(100);
            entity.Property(e => e.Frequency).HasMaxLength(150);
            entity.Property(e => e.Duration).HasMaxLength(100);

            // Configure relationship 1-to-many
            entity.HasOne(em => em.Prescription)
                .WithMany(e => e.Medicines)
                .HasForeignKey(em => em.PrescriptionId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
