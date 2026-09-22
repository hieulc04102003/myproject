using System;

namespace ProductManagement.Domain.Entities;

public partial class Otp
{
    public Guid Id { get; set; }

    public string PhoneNumber { get; set; } = null!;

    public string OtpCode { get; set; } = null!;

    public bool IsUsed { get; set; } = false;

    public int AttemptsCount { get; set; } = 0;

    public DateTime CreatedAt { get; set; }

    public DateTime LastSentAt { get; set; }

    public DateTime ExpiresAt { get; set; }
}
