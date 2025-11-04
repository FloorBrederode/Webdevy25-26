namespace WebDev.Core.Models
{
    public class Payment
    {
        public int Id { get; set; }

        public decimal Amount { get; set; }

        public Guid Initiator { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime CompletedAt { get; set; }

        public string Hash { get; set; }

        public decimal TransactionAmount { get; set; }  

        public DateTime TransactionDate { get; set; }

        public string TransactionMethod { get; set; }

        public string TransactionIssuer { get; set; }

        public string TransactionBank { get; set; }


        public int? ReservationId { get; set; }
        public Reservation Reservation { get; set; }

        public User User { get; set; }
    }
}