namespace WebDev.Core.Models
{
    public class Discount
    {
        // Mogelijke fields, was nog geen data of gebruik
        public int Id { get; set; }
        public string Code { get; set; }
        public decimal Percentage { get; set; }
        public DateTime ExpiryDate { get; set; }
    }
}