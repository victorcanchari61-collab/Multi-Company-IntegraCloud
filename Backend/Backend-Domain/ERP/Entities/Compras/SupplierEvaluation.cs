using Backend.SharedKernel;

namespace Backend.Domain.ERP.Entities.Compras;

public sealed class SupplierEvaluation : AggregateRoot
{
    public Guid CompanyId { get; private set; }
    public Guid SupplierId { get; private set; }
    public Supplier? Supplier { get; private set; }
    public Guid? OrderId { get; private set; }
    public PurchaseOrder? Order { get; private set; }
    public DateTime EvaluationDate { get; private set; }
    public int Score { get; private set; }
    public string EvaluatedBy { get; private set; } = null!;
    public decimal? PriceRating { get; private set; }
    public decimal? QualityRating { get; private set; }
    public decimal? DeliveryRating { get; private set; }
    public decimal? ServiceRating { get; private set; }
    public string? Comments { get; private set; }
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    private SupplierEvaluation() { }

    public SupplierEvaluation(Guid id, Guid companyId, Guid supplierId,
        DateTime evaluationDate, int score, string evaluatedBy, Guid? orderId = null) : base(id)
    {
        CompanyId = companyId;
        SupplierId = supplierId;
        EvaluationDate = evaluationDate;
        Score = score;
        EvaluatedBy = evaluatedBy;
        OrderId = orderId;
    }

    public void Update(int score, decimal? priceRating, decimal? qualityRating,
        decimal? deliveryRating, decimal? serviceRating, string? comments)
    {
        Score = score;
        PriceRating = priceRating;
        QualityRating = qualityRating;
        DeliveryRating = deliveryRating;
        ServiceRating = serviceRating;
        Comments = comments;
    }
}
